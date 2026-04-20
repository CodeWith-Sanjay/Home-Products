import { card, buttonSecondary } from "../../utils/UIStyles";
import { useNavigate } from "react-router-dom";
import emailjs from "emailjs-com";
import { useContext } from "react";
import { CartContext } from "../../context/CartContext/CartContext";
import { ProductContext } from "../../context/ProductContext/ProductContext";
import { createOrder } from "../../services/orderService";

const ReviewOrder = ({ onBack, paymentMethod, total, userDetails, items }) => {
  const navigate = useNavigate();
  const { cart, fetchCart } = useContext(CartContext);
  const { fetchProducts } = useContext(ProductContext);

  const user = JSON.parse(localStorage.getItem('auth'));

  const sendOrderEmail = (orderId) => {
    const templateParams = {
      customer_name: userDetails?.name,
      customer_email: user?.email,
      phone: userDetails?.phone,
      address: `${userDetails?.address}, ${userDetails?.city}, ${userDetails?.state} - ${userDetails?.pincode}`,
      payment_method:
        paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment",
      total_amount: total,
      order_id: orderId
    };

    emailjs
      .send(
        "service_xi1pa3f",
        "template_yflwrps",
        templateParams,
        "y1WJPO0mL8ZixdyyR",
      )
      .then(
        (response) => {
          console.log("Email sent successfully", response);
        },
        (error) => {
          console.error("Email failed", error);
        },
      );
  };

  const handlePlaceOrder = async () => {
    try {
      console.log("Preparing order data for items:", items);
      const orderData = {
        customer_id: user.id || user.customer_id,
        address_details: userDetails,
        items: items.map(item => {
          if (!item.seller_id) {
            console.warn("Item missing seller_id:", item);
          }
          return {
            product_id: item.product_id,
            variant_id: item.variant_id || null,
            quantity: item.quantity || 1,
            unit_price: item.discountPrice || item.price,
            seller_id: item.seller_id
          };
        }),
        payment_method: paymentMethod,
        subtotal: items.reduce((acc, item) => acc + (item.discountPrice || item.price) * (item.quantity || 1), 0),
        shipping_charges: paymentMethod === 'cod' ? 50 : 0,
        tax_amount: 0,
        total_amount: total
      };

      if (paymentMethod === "cod") {
        const response = await createOrder(orderData);
        if (response.success) {
          sendOrderEmail(response.order_id);
          fetchCart(); 
          if (fetchProducts) fetchProducts();
          navigate("/order-success");
        }
      } else {
        const options = {
          key: "rzp_test_ScwlLN4ZFz2Qxa",
          amount: total * 100,
          currency: "INR",
          name: "GMD Marketplace",
          description: "Order Payment",

          handler: async function (response) {
            const dbResponse = await createOrder({
                ...orderData,
                payment_id: response.razorpay_payment_id
            });
            if (dbResponse.success) {
                sendOrderEmail(dbResponse.order_id);
                fetchCart(); 
                if (fetchProducts) fetchProducts();
                navigate("/order-success");
            }
          },

          prefill: {
            name: userDetails?.name,
            email: userDetails?.email,
            contact: userDetails?.phone,
          },

          theme: {
            color: "#2563eb",
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      console.error("Order placement failed:", error);
      alert("Failed to place order. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">
          Review & Confirm
        </h2>
        <p className="text-sm text-gray-500">
          Verify your details before placing order
        </p>
      </div>

      <div className={`${card} p-6 space-y-4`}>
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-500">
            DELIVERY DETAILS
          </h3>
        </div>

        <div className="space-y-1 text-sm text-gray-700">
          <p className="font-semibold text-gray-900">{userDetails?.name}</p>

          <p>{userDetails?.address}</p>

          <p>
            {userDetails?.city}, {userDetails?.state} - {userDetails?.pincode}
          </p>

          <div className="flex gap-4 text-gray-500 pt-2">
            <span>📞 {userDetails?.phone}</span>
            <span>✉️ {userDetails?.email}</span>
          </div>
        </div>
      </div>

      <div className={`${card} p-6 space-y-3`}>
        <h3 className="text-sm font-medium text-gray-500">PAYMENT METHOD</h3>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-700">
            {paymentMethod === "cod"
              ? "Cash on Delivery"
              : "Online Payment (Razorpay)"}
          </span>

          {paymentMethod === "cod" && (
            <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-md">
              + ₹50 fee
            </span>
          )}
        </div>
      </div>

      <div className={`${card} p-6 flex justify-between items-center`}>
        <div>
          <p className="text-sm text-gray-500">Total Payable</p>
          <p className="text-xs text-gray-400">Inclusive of all charges</p>
        </div>

        <span className="text-2xl font-bold text-blue-600">₹{total}</span>
      </div>

      <div className="flex justify-between pt-2">
        <button onClick={onBack} className={buttonSecondary}>
          ← Back
        </button>

        <button
          onClick={handlePlaceOrder}
          className="bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700 shadow"
        >
          Place Order
        </button>
      </div>
    </div>
  );
};

export default ReviewOrder;
