import { pool } from '../configs/db.js';
import { createShiprocketOrder, getShiprocketTracking, cancelShiprocketOrder } from '../utils/shiprocket.js';

/**
 * Internal helper to push an order to Shiprocket
 * @param {string} orderId 
 * @param {object} client - Optional DB client for transaction
 */
export const pushOrderToShiprocket = async (orderId, client = pool) => {
    // 1. Fetch Order Details with Customer Address
    const orderRes = await client.query(`
        SELECT o.*, a.full_name, a.phone, a.address_line_1, a.city, a.state, a.pincode, c.email
        FROM orders o
        JOIN addresses a ON o.address_id = a.address_id
        JOIN customers c ON o.customer_id = c.customer_id
        WHERE o.order_id = $1
    `, [orderId]);

    if (orderRes.rows.length === 0) {
        throw new Error("Order not found");
    }

    const order = orderRes.rows[0];

    // 2. Fetch Order Items with Product Weight/Dimensions
    const itemsRes = await client.query(`
        SELECT oi.*, p.name as product_name, p.sku, p.weight, p.length, p.breadth, p.height
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
        WHERE oi.order_id = $1
    `, [orderId]);

    const items = itemsRes.rows;

    // 3. Get Default Pickup Location for the primary seller
    const firstSellerId = items[0].seller_id;
    const pickupRes = await client.query(`
        SELECT * FROM seller_pickup_location 
        WHERE seller_id = $1 AND is_default = true
        LIMIT 1
    `, [firstSellerId]);

    if (pickupRes.rows.length === 0) {
        throw new Error("Seller has no default pickup location. Please add one in Seller Dashboard -> Pickups.");
    }

    const pickupLocation = pickupRes.rows[0];

    // 4. Prepare Shiprocket Payload
    const nameParts = (order.full_name || "Customer").trim().split(/\s+/);
    const firstName = nameParts[0] || "Customer";
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "User";
    
    // Ensure phone is at least 10 digits for Shiprocket validation
    const validPhone = order.phone && order.phone.length >= 10 ? order.phone : "9999999999";

    const srPayload = {
        order_id: order.order_id.slice(0, 20),
        order_date: new Date(order.placed_at).toISOString().split('T')[0],
        pickup_location: pickupLocation.location_name,
        billing_customer_name: firstName,
        billing_last_name: lastName,
        billing_address: order.address_line_1,
        billing_address_2: "",
        billing_city: order.city,
        billing_pincode: order.pincode,
        billing_state: order.state,
        billing_country: "India",
        billing_email: order.email,
        billing_phone: validPhone,
        shipping_is_billing: true,
        shipping_customer_name: firstName,
        shipping_last_name: lastName,
        shipping_address: order.address_line_1,
        shipping_address_2: "",
        shipping_city: order.city,
        shipping_pincode: order.pincode,
        shipping_country: "India",
        shipping_state: order.state,
        shipping_email: order.email,
        shipping_phone: validPhone,
        order_items: items.map(item => ({
            name: item.product_name,
            sku: item.sku || item.product_id.slice(0, 8),
            units: item.quantity,
            selling_price: Number(item.unit_price),
            discount: 0,
            tax: 0,
            hsn: 0
        })),
        payment_method: order.payment_method === 'cod' ? 'COD' : 'Prepaid',
        sub_total: Number(order.subtotal),
        length: Math.max(...items.map(i => Number(i.length) || 10)),
        breadth: Math.max(...items.map(i => Number(i.breadth) || 10)),
        height: Math.max(...items.map(i => Number(i.height) || 10)),
        weight: items.reduce((acc, i) => acc + (Number(i.weight) || 0.5) * i.quantity, 0)
    };

    // 5. Call Shiprocket API
    console.log("Shiprocket Payload:", JSON.stringify(srPayload, null, 2));
    const srResponse = await createShiprocketOrder(srPayload);

    if (!srResponse || !srResponse.order_id) {
        throw new Error(srResponse.message || "Failed to create Shiprocket order");
    }

    // 6. Save to shiprocket_orders table
    await client.query(`
        INSERT INTO shiprocket_orders (
            sr_order_id, order_id, shipment_id, sr_status, sr_created_at, updated_at
        ) VALUES (gen_random_uuid(), $1, $2, 'NEW', NOW(), NOW())
        ON CONFLICT (order_id) DO UPDATE SET 
            shipment_id = EXCLUDED.shipment_id,
            sr_status = EXCLUDED.sr_status,
            updated_at = NOW()
    `, [order.order_id, srResponse.shipment_id.toString()]);

    return srResponse;
};

/**
 * Initiate shipment manually via API
 */
export const initiateShipment = async (req, res) => {
    const { orderId } = req.params;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const srResponse = await pushOrderToShiprocket(orderId, client);

        // Update order status locally
        await client.query(`
            UPDATE orders SET order_status = 'Processing', courier = 'Shiprocket', tracking_id = $1 WHERE order_id = $2
        `, [srResponse.shipment_id.toString(), orderId]);

        await client.query('COMMIT');
        return res.status(200).json({ success: true, message: "Shipment initiated", data: srResponse });
    } catch (error) {
        await client.query('ROLLBACK');
        return res.status(500).json({ success: false, message: error.message });
    } finally {
        client.release();
    }
};

/**
 * Cancel shipment in Shiprocket
 */
export const cancelShipment = async (orderId, client = pool) => {
    try {
        // 1. Get Shiprocket Order ID from our table
        const srOrderRes = await client.query("SELECT sr_order_id, shipment_id FROM shiprocket_orders WHERE order_id = $1", [orderId]);
        
        if (srOrderRes.rows.length === 0) {
            console.log("No Shiprocket record found for order cancellation, skipping SR API call.");
            return;
        }

        const { shipment_id } = srOrderRes.rows[0];

        // 2. Call Shiprocket Cancel API
        // Shiprocket cancel expects an array of IDs. We use the shipment_id or order_id.
        // For adhoc orders, we use the order_id we provided or the one they generated.
        const srResponse = await cancelShiprocketOrder([shipment_id]);

        if (srResponse.status_code === 200) {
            await client.query("UPDATE shiprocket_orders SET sr_status = 'CANCELLED', updated_at = NOW() WHERE order_id = $1", [orderId]);
            console.log(`Shiprocket order ${shipment_id} cancelled successfully.`);
        } else {
            console.warn(`Shiprocket Cancellation Warning: ${srResponse.message}`);
        }
    } catch (error) {
        console.error("Cancel Shipment Error:", error.message);
    }
};

/**
 * Fetch and update tracking info from Shiprocket
 */
export const syncTracking = async (req, res) => {
    const { orderId } = req.params;
    try {
        const srOrder = await pool.query("SELECT awb_code FROM shiprocket_orders WHERE order_id = $1", [orderId]);
        if (srOrder.rows.length === 0 || !srOrder.rows[0].awb_code) {
            return res.status(404).json({ success: false, message: "No AWB assigned yet" });
        }
        const tracking = await getShiprocketTracking(srOrder.rows[0].awb_code);
        return res.status(200).json({ success: true, data: tracking });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
