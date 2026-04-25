import { pool } from "../../configs/db.js";
import { createAuthSession, invalidateSession } from "../../utils/authSession.js";
import { logAudit } from "../../utils/auditLogger.js";

export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, masterKey } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Required fields are missing" });
    }

    const adminCount = await pool.query("SELECT COUNT(*) FROM admins");
    const hasAdmins = parseInt(adminCount.rows[0].count) > 0;

    const EXPECTED_MASTER_KEY = "HOME_ADMIN_2026";

    if (hasAdmins) {
      if (!masterKey || masterKey !== EXPECTED_MASTER_KEY) {
        return res.status(403).json({
          success: false,
          message: "Administrative registration is restricted. Please provide a valid Master Security Key."
        });
      }
    }

    const existing = await pool.query("SELECT admin_id FROM admins WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: "Email already registered as administrator" });
    }

    const result = await pool.query(
      `INSERT INTO admins 
       (admin_id, name, email, password_hash, role, is_active, created_at, updated_at) 
       VALUES 
       (gen_random_uuid(), $1, $2, crypt($3, gen_salt('bf')), 'admin', true, NOW(), NOW())
       RETURNING admin_id, name, email, role`,
      [name, email, password]
    );

    const admin = result.rows[0];

    // Ensure shadow customer record exists for shopping features (Cart, Wishlist, etc)
    await pool.query(
      `INSERT INTO customers (customer_id, full_name, email, is_active, is_email_verified)
       VALUES ($1, $2, $3, true, true)`,
      [admin.admin_id, admin.name, admin.email]
    );
    console.log(`Shadow customer created for new admin: ${admin.email}`);

    const ip = req.ip || req.connection.remoteAddress;
    const device = { agent: req.get('User-Agent') };
    const session = await createAuthSession(admin.admin_id, 'admin', ip, device);

    return res.status(201).json({
      success: true,
      message: "Administrator account initialized successfully",
      data: {
        id: admin.admin_id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        sessionId: session.sessionId,
        token: session.token
      }
    });

  } catch (error) {
    console.error("ADMIN REGISTER ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to initialize admin account" });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const result = await pool.query("SELECT * FROM admins WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Administrator account not found" });
    }

    const admin = result.rows[0];

    if (!admin.is_active) {
      return res.status(403).json({ success: false, message: "Account is deactivated. Contact system owner." });
    }

    const passwordMatch = await pool.query("SELECT crypt($1, $2) = $2 AS match", [password, admin.password_hash]);
    if (!passwordMatch.rows[0].match) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    await pool.query("UPDATE admins SET last_login_at = NOW() WHERE admin_id = $1", [admin.admin_id]);

    // Ensure shadow customer record exists for shopping features (Cart, Wishlist, etc)
    const shadowCheck = await pool.query("SELECT customer_id FROM customers WHERE customer_id = $1 OR email = $2", [admin.admin_id, admin.email]);
    if (shadowCheck.rows.length === 0) {
      await pool.query(
        `INSERT INTO customers (customer_id, full_name, email, is_active, is_email_verified)
         VALUES ($1, $2, $3, true, true)`,
        [admin.admin_id, admin.name, admin.email]
      );
      console.log(`Shadow customer created for admin: ${admin.email}`);
    }

    const ip = req.ip || req.connection.remoteAddress;
    const device = { agent: req.get('User-Agent') };
    const session = await createAuthSession(admin.admin_id, 'admin', ip, device);

    // Log the successful login
    await logAudit({
      admin_id: admin.admin_id,
      action: 'LOGIN',
      table_name: 'admins',
      record_id: admin.admin_id,
      req
    });

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      data: {
        id: admin.admin_id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        sessionId: session.sessionId,
        token: session.token
      }
    });

  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);
    return res.status(500).json({ success: false, message: "Internal server error during admin login" });
  }
};

export const logoutAdmin = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (sessionId) {
      await invalidateSession(sessionId);
    }
    return res.status(200).json({ success: true, message: "Admin logged out" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Logout failed" });
  }
};

/**
 * Get Admin Dashboard Stats and Charts
 */
export const getAdminDashboardData = async (req, res) => {
  try {
    // 1. Core Stats
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM orders WHERE is_deleted = false) as total_orders,
        (SELECT COUNT(*) FROM products WHERE deleted_at IS NULL) as total_products,
        (SELECT COUNT(*) FROM customers WHERE deleted_at IS NULL) as total_customers,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE payment_status = 'Paid' AND order_status != 'Cancelled' AND is_deleted = false) as total_revenue,
        (SELECT COUNT(*) FROM orders WHERE placed_at >= CURRENT_DATE AND is_deleted = false) as today_orders,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE placed_at >= CURRENT_DATE AND payment_status = 'Paid' AND order_status != 'Cancelled' AND is_deleted = false) as today_revenue,
        (SELECT COUNT(*) FROM products WHERE created_at >= CURRENT_DATE AND deleted_at IS NULL) as today_new_products,
        (SELECT COUNT(*) FROM customers WHERE created_at >= CURRENT_DATE AND deleted_at IS NULL) as today_new_customers
    `;
    const statsResult = await pool.query(statsQuery);
    const stats = statsResult.rows[0];

    // 2. Revenue Trend (Last 6 Months)
    const trendQuery = `
      SELECT 
        TO_CHAR(m.month, 'Mon') as month,
        COALESCE(SUM(o.total_amount), 0) as revenue,
        COALESCE((SELECT SUM(commission_amount) FROM seller_commissions sc JOIN orders o2 ON sc.order_id = o2.order_id WHERE date_trunc('month', o2.placed_at) = m.month AND o2.payment_status = 'Paid' AND o2.order_status != 'Cancelled'), 0) as profit,
        COUNT(o.order_id) as orders
      FROM (
        SELECT date_trunc('month', CURRENT_DATE) - (i || ' month')::interval as month
        FROM generate_series(0, 5) i
      ) m
      LEFT JOIN orders o ON date_trunc('month', o.placed_at) = m.month AND o.payment_status = 'Paid' AND o.order_status != 'Cancelled' AND o.is_deleted = false
      GROUP BY m.month
      ORDER BY m.month ASC
    `;
    const trendResult = await pool.query(trendQuery);

    // 3. Category (Room) Distribution
    const categoryQuery = `
      SELECT COALESCE(room, 'Other') as name, COUNT(*) as value
      FROM products
      WHERE deleted_at IS NULL
      GROUP BY room
      ORDER BY value DESC
      LIMIT 5
    `;
    const categoryResult = await pool.query(categoryQuery);

    // 4. Recent Orders
    const ordersQuery = `
      SELECT o.order_id as id, c.full_name as customer, o.total_amount as total, o.order_status as status, 
             TO_CHAR(o.placed_at, 'DD Mon, HH:MI AM') as time,
             (SELECT COUNT(*) FROM order_items WHERE order_id = o.order_id) as items
      FROM orders o
      JOIN customers c ON o.customer_id = c.customer_id
      WHERE o.is_deleted = false
      ORDER BY o.placed_at DESC
      LIMIT 5
    `;
    const ordersResult = await pool.query(ordersQuery);

    // 5. Recent Activity (Audit Logs)
    const activityQuery = `
      SELECT 
        CASE 
          WHEN action = 'LOGIN' THEN 'Admin logged in'
          WHEN action = 'CREATE' THEN 'New ' || table_name || ' record created'
          WHEN action = 'UPDATE' THEN table_name || ' record updated'
          WHEN action = 'DELETE' THEN table_name || ' record removed'
          ELSE action || ' on ' || table_name
        END as text,
        TO_CHAR(created_at, 'HH:MI AM') as time,
        action as type
      FROM audit_logs
      ORDER BY created_at DESC
      LIMIT 5
    `;
    const activityResult = await pool.query(activityQuery);

    // 6. Product Performance
    const performanceQuery = `
      SELECT name, price, stock_quantity as stock, rating, reviews_count as "reviewCount", product_id as id, sku, room, images[1] as image
      FROM products
      WHERE deleted_at IS NULL
      ORDER BY rating DESC, reviews_count DESC NULLS LAST
      LIMIT 5
    `;
    const performanceResult = await pool.query(performanceQuery);

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          total_orders: Number(stats.total_orders),
          total_products: Number(stats.total_products),
          total_customers: Number(stats.total_customers),
          total_revenue: Number(stats.total_revenue),
          today_orders: Number(stats.today_orders),
          today_revenue: Number(stats.today_revenue),
          today_new_products: Number(stats.today_new_products),
          today_new_customers: Number(stats.today_new_customers)
        },
        revenueTrend: trendResult.rows.map(r => ({
          ...r,
          revenue: Number(r.revenue),
          profit: Number(r.profit),
          orders: Number(r.orders)
        })),
        categoryDistribution: categoryResult.rows.map(r => ({
          ...r,
          value: Number(r.value)
        })),
        recentOrders: ordersResult.rows.map(o => ({
          ...o,
          total: `₹${Number(o.total || 0).toLocaleString('en-IN')}`,
          time: o.time
        })),
        recentActivity: activityResult.rows,
        productPerformance: performanceResult.rows.map((p, i) => ({
          rank: i + 1,
          ...p,
          performance: Math.round((Number(p.rating) || 4.5) * 20)
        }))
      }
    });

  } catch (error) {
    console.error("ADMIN DASHBOARD DATA ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch dashboard data" });
  }
};

/**
 * Get All Audit Logs (Admin View)
 */
export const getAuditLogs = async (req, res) => {
  try {
    const logsQuery = `
      SELECT 
        al.*,
        COALESCE(a.name, s.store_name, 'System') as actor_name,
        COALESCE(a.email, s.email, 'system@homeproducts.com') as actor_email
      FROM audit_logs al
      LEFT JOIN admins a ON al.admin_id = a.admin_id
      LEFT JOIN sellers s ON al.admin_id = s.seller_id
      ORDER BY al.created_at DESC
      LIMIT 100
    `;
    const result = await pool.query(logsQuery);

    return res.status(200).json({
      success: true,
      data: result.rows.map(log => ({
        ...log,
        created_at: new Date(log.created_at).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }))
    });
  } catch (error) {
    console.error("GET AUDIT LOGS ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch audit logs" });
  }
};

/**
 * Get Detailed Sellers List and Performance
 */
export const getSellersData = async (req, res) => {
  try {
    const sellersQuery = `
      SELECT 
        s.seller_id as id,
        s.store_name as name,
        s.full_name as owner,
        s.email,
        s.phone,
        s.is_verified,
        s.is_active,
        s.created_at as "joinDate",
        (SELECT COUNT(*) FROM products WHERE seller_id = s.seller_id AND deleted_at IS NULL) as products,
        (SELECT COUNT(*) FROM order_sellers WHERE seller_id = s.seller_id) as orders,
        (SELECT COALESCE(SUM(p.price * oi.quantity), 0) 
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.product_id 
         JOIN order_sellers os ON os.order_id = oi.order_id
         WHERE os.seller_id = s.seller_id) as revenue,
        COALESCE((SELECT AVG(rating) FROM products WHERE seller_id = s.seller_id), 0) as rating
      FROM sellers s
      ORDER BY s.created_at DESC
    `;
    const result = await pool.query(sellersQuery);

    return res.status(200).json({
      success: true,
      data: result.rows.map(s => ({
        ...s,
        status: s.is_active ? (s.is_verified ? 'Active' : 'Pending KYC') : 'Suspended',
        revenue: `₹${Number(s.revenue).toLocaleString('en-IN')}`,
        rating: Number(Number(s.rating).toFixed(1)),
        joinDate: new Date(s.joinDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
      }))
    });
  } catch (error) {
    console.error("GET SELLERS ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch sellers data" });
  }
};

/**
 * Get Financial Analytics and Transactions
 */
export const getFinanceData = async (req, res) => {
  try {
    // 1. Revenue & Profit Summary
    const summaryQuery = `
      SELECT 
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE payment_status = 'Paid' AND order_status != 'Cancelled' AND is_deleted = false) as gross_revenue,
        (SELECT COALESCE(SUM(commission_amount), 0) FROM seller_commissions WHERE status != 'Cancelled') as platform_commission,
        (SELECT COALESCE(SUM(commission_amount), 0) FROM seller_commissions WHERE status != 'Cancelled') as net_profit
    `;
    const summaryResult = await pool.query(summaryQuery);

    // 2. Monthly Revenue/Cost/Profit
    const monthlyQuery = `
      SELECT 
        TO_CHAR(m.month, 'Mon') as month,
        COALESCE(SUM(o.total_amount), 0) as revenue,
        COALESCE(SUM(os.seller_subtotal), 0) as costs,
        COALESCE((SELECT SUM(commission_amount) FROM seller_commissions sc JOIN orders o2 ON sc.order_id = o2.order_id WHERE date_trunc('month', o2.placed_at) = m.month AND o2.order_status != 'Cancelled'), 0) as profit
      FROM (
        SELECT date_trunc('month', CURRENT_DATE) - (i || ' month')::interval as month
        FROM generate_series(0, 5) i
      ) m
      LEFT JOIN orders o ON date_trunc('month', o.placed_at) = m.month AND o.payment_status = 'Paid' AND o.order_status != 'Cancelled' AND o.is_deleted = false
      LEFT JOIN order_sellers os ON o.order_id = os.order_id
      GROUP BY m.month
      ORDER BY m.month ASC
    `;
    const monthlyResult = await pool.query(monthlyQuery);

    // 3. Payouts List (Sellers with pending commissions)
    const payoutsQuery = `
      SELECT 
        s.store_name as name,
        COALESCE(SUM(sc.seller_earnings), 0) as amount,
        COALESCE(SUM(sc.sale_amount), 0) as revenue,
        'Pending' as status
      FROM sellers s
      JOIN seller_commissions sc ON s.seller_id = sc.seller_id
      WHERE LOWER(sc.status) = 'pending'
      GROUP BY s.store_name
      LIMIT 10
    `;
    // 4. Expense Distribution
    const expenseQuery = `
      SELECT 'Seller Payouts' as name, COALESCE(SUM(seller_earnings), 0) as value FROM seller_commissions WHERE status = 'Completed'
      UNION ALL
      SELECT 'Platform Tax' as name, COALESCE(SUM(commission_amount) * 0.18, 0) as value FROM seller_commissions
      UNION ALL
      SELECT 'Shipping' as name, COUNT(*) * 50 as value FROM orders WHERE order_status = 'Shipped' OR order_status = 'Delivered'
      UNION ALL
      SELECT 'Infrastructure' as name, 5000 as value
    `;
    const expenseResult = await pool.query(expenseQuery);

    // 5. Recent Transactions
    const txnsQuery = `
      SELECT 
        'TXN-' || order_id as id,
        'Order Payment' as type,
        c.full_name as seller,
        o.total_amount as amount,
        TO_CHAR(o.placed_at, 'DD Mon YYYY') as date,
        'Completed' as status
      FROM orders o
      JOIN customers c ON o.customer_id = c.customer_id
      WHERE o.is_deleted = false
      ORDER BY o.placed_at DESC
      LIMIT 10
    `;
    const txnsResult = await pool.query(txnsQuery);

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          gross_revenue: Number(summaryResult.rows[0].gross_revenue),
          platform_commission: Number(summaryResult.rows[0].platform_commission),
          net_profit: Number(summaryResult.rows[0].net_profit)
        },
        monthlyPL: monthlyResult.rows.map(r => ({
          ...r,
          revenue: Number(r.revenue),
          costs: Number(r.costs),
          profit: Number(r.profit)
        })),
        payouts: payoutsResult.rows.map((p, i) => ({
          id: i + 1,
          ...p,
          amount: Number(p.amount),
          revenue: Number(p.revenue)
        })),
        expenses: expenseResult.rows.map(r => ({
          name: r.name,
          value: Number(r.value)
        })),
        transactions: txnsResult.rows.map(r => ({
          ...r,
          amount: Number(r.amount)
        }))
      }
    });
  } catch (error) {
    console.error("GET FINANCE ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch financial data" });
  }
};

/**
 * Get Comprehensive Analytics (Sales, Reports, Payments)
 */
export const getAnalyticsData = async (req, res) => {
  try {
    const { range = 'all' } = req.query;

    let rangeFilter = '';
    if (range === 'daily') rangeFilter = "AND o.placed_at >= CURRENT_DATE - interval '1 day'";
    else if (range === 'weekly') rangeFilter = "AND o.placed_at >= CURRENT_DATE - interval '1 week'";
    else if (range === 'monthly') rangeFilter = "AND o.placed_at >= CURRENT_DATE - interval '1 month'";
    else if (range === 'quarterly') rangeFilter = "AND o.placed_at >= CURRENT_DATE - interval '3 month'";
    else if (range === 'half_yearly') rangeFilter = "AND o.placed_at >= CURRENT_DATE - interval '6 month'";
    else if (range === 'annual') rangeFilter = "AND o.placed_at >= CURRENT_DATE - interval '1 year'";

    // 1. Sales by Category
    const categoryResult = await pool.query(`
      SELECT p.room as category, SUM(oi.quantity * p.price) as revenue, COUNT(oi.order_item_id) as sales
      FROM order_items oi
      JOIN products p ON oi.product_id = p.product_id
      JOIN orders o ON oi.order_id = o.order_id
      WHERE o.order_status != 'Cancelled' AND o.is_deleted = false ${rangeFilter}
      GROUP BY p.room ORDER BY revenue DESC
    `);

    // 2. Top Performing Products
    const productsResult = await pool.query(`
      SELECT p.name, s.store_name as seller, SUM(oi.quantity) as qty, SUM(oi.quantity * p.price) as revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.product_id
      JOIN sellers s ON p.seller_id = s.seller_id
      JOIN orders o ON oi.order_id = o.order_id
      WHERE o.order_status != 'Cancelled' AND o.is_deleted = false ${rangeFilter}
      GROUP BY p.name, s.store_name ORDER BY revenue DESC LIMIT 10
    `);

    // 3. Summary Stats
    const summaryResult = await pool.query(`
      SELECT
        COUNT(*) as total_orders,
        COALESCE(SUM(o.total_amount), 0) as total_revenue,
        COALESCE(SUM(oi_count.item_count), 0) as total_items_sold
      FROM orders o
      LEFT JOIN (
        SELECT order_id, SUM(quantity) as item_count FROM order_items GROUP BY order_id
      ) oi_count ON o.order_id = oi_count.order_id
      WHERE o.order_status != 'Cancelled' AND o.is_deleted = false ${rangeFilter}
    `);

    // 4. Payment Status Breakdown
    const paymentStatsResult = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE LOWER(payment_status) = 'paid' AND LOWER(order_status) != 'cancelled') as success,
        COUNT(*) FILTER (WHERE LOWER(order_status) = 'cancelled') as cancelled,
        COUNT(*) FILTER (WHERE LOWER(order_status) = 'pending' OR LOWER(order_status) = 'processing') as pending
      FROM orders WHERE is_deleted = false
    `);

    // 5. Returns
    const returnsResult = await pool.query(`
      SELECT o.order_id as orderId, c.full_name as customer, o.total_amount as amount, o.order_status as status, o.placed_at as date
      FROM orders o JOIN customers c ON o.customer_id = c.customer_id
      WHERE o.order_status = 'Cancelled' AND o.is_deleted = false LIMIT 10
    `);

    return res.status(200).json({
      success: true,
      data: {
        categorySales: categoryResult.rows.map(r => ({
          ...r,
          revenue: Number(r.revenue),
          sales: Number(r.sales)
        })),
        topProducts: productsResult.rows.map(r => ({
          ...r,
          qty: Number(r.qty),
          revenue: Number(r.revenue)
        })),
        summary: {
          total_orders: Number(summaryResult.rows[0].total_orders),
          total_revenue: Number(summaryResult.rows[0].total_revenue),
          total_items_sold: Number(summaryResult.rows[0].total_items_sold)
        },
        paymentStats: {
          total: Number(paymentStatsResult.rows[0].total),
          success: Number(paymentStatsResult.rows[0].success),
          cancelled: Number(paymentStatsResult.rows[0].cancelled),
          pending: Number(paymentStatsResult.rows[0].pending)
        },
        recentReturns: returnsResult.rows.map(r => ({
          id: `RET-${(r.orderId || '').split('-')[0] || 'N/A'}`,
          ...r,
          reason: "Not Specified",
          amount: `₹${Number(r.amount).toLocaleString('en-IN')}`,
          date: new Date(r.date).toLocaleDateString('en-IN')
        }))
      }
    });
  } catch (error) {
    console.error("GET ANALYTICS ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch analytics data" });
  }
};

/**
 * Get All Payments (Admin View)
 */
export const getAllPayments = async (req, res) => {
  try {
    const paymentsQuery = `
      SELECT 
        o.order_id as id,
        c.full_name as customer,
        o.total_amount as amount,
        o.payment_method as method,
        o.order_status as status,
        o.payment_status,
        o.cod_fee,
        o.placed_at as date
      FROM orders o
      JOIN customers c ON o.customer_id = c.customer_id
      WHERE o.is_deleted = false
      ORDER BY o.placed_at DESC
    `;
    const result = await pool.query(paymentsQuery);

    const statsQuery = `
      SELECT 
        COALESCE(SUM(total_amount) FILTER (
          WHERE order_status != 'Cancelled' AND (
            (payment_method != 'cod' AND cod_fee = 0) OR 
            (order_status = 'Delivered' OR payment_status = 'Paid')
          )
        ), 0) as total,
        COUNT(CASE 
          WHEN order_status != 'Cancelled' AND (
            (payment_method != 'cod' AND cod_fee = 0) OR 
            (order_status = 'Delivered' OR payment_status = 'Paid')
          ) THEN 1 
          ELSE NULL 
        END) as success,
        COUNT(CASE WHEN order_status = 'Cancelled' THEN 1 END) as cancelled,
        COUNT(CASE 
          WHEN order_status != 'Cancelled' AND (
            (payment_method = 'cod' OR cod_fee > 0) AND 
            (order_status != 'Delivered' AND payment_status != 'Paid')
          ) THEN 1 
          ELSE NULL 
        END) as pending
      FROM orders
      WHERE is_deleted = false
    `;
    const statsResult = await pool.query(statsQuery);

    return res.status(200).json({
      success: true,
      data: result.rows.map(r => {
        let paymentStatus = 'Pending';
        let methodLabel = r.method;
        // Identify payment type
        const isCOD = r.method === 'cod' || parseFloat(r.cod_fee || 0) > 0;

        if (isCOD) {
          methodLabel = 'PostPaid';
        } else if (r.method === 'Prepaid' || r.method === 'razorpay') {
          methodLabel = 'Online';
        }

        // Determine Payment Status
        if (r.status === 'Cancelled') {
          paymentStatus = 'Cancelled';
        } else if (isCOD) {
          // COD: Success only if Delivered or Paid, otherwise Pending
          if (r.status === 'Delivered' || r.payment_status === 'Paid') {
            paymentStatus = 'Success';
          } else {
            paymentStatus = 'Pending';
          }
        } else {
          // Online: Success by default unless cancelled
          if (r.status === 'Cancelled') {
            paymentStatus = 'Cancelled';
          } else {
            paymentStatus = 'Success';
          }
        }

        return {
          ...r,
          method: methodLabel,
          amount: `₹${Number(r.amount).toLocaleString('en-IN')}`,
          date: new Date(r.date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          status: paymentStatus
        };
      }),
      stats: {
        total: `₹${Number(statsResult.rows[0].total).toLocaleString('en-IN')}`,
        success: statsResult.rows[0].success,
        cancelled: statsResult.rows[0].cancelled,
        pending: statsResult.rows[0].pending
      }
    });
  } catch (error) {
    console.error("GET PAYMENTS ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch payments" });
  }
};

/**
 * Get All Returns (Admin View)
 */
export const getAllReturns = async (req, res) => {
  try {
    const returnsQuery = `
      SELECT 
        o.order_id as id,
        c.full_name as customer,
        o.total_amount as amount,
        o.order_status as status,
        o.placed_at as date,
        'Damaged Item' as reason
      FROM orders o
      JOIN customers c ON o.customer_id = c.customer_id
      WHERE o.order_status = 'Cancelled' AND o.is_deleted = false
      ORDER BY o.placed_at DESC
    `;
    const result = await pool.query(returnsQuery);

    return res.status(200).json({
      success: true,
      data: result.rows.map(r => ({
        ...r,
        id: `RET-${r.id.split('-')[0].toUpperCase()}`,
        orderId: r.id,
        amount: `₹${Number(r.amount).toLocaleString('en-IN')}`,
        date: new Date(r.date).toLocaleDateString('en-IN')
      }))
    });
  } catch (error) {
    console.error("GET RETURNS ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch returns" });
  }
};

/**
 * Get All Orders (Admin View)
 */
export const getAllOrders = async (req, res) => {
  try {
    const ordersQuery = `
      SELECT 
        o.order_id as id,
        c.full_name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        o.total_amount,
        o.order_status as status,
        o.payment_method,
        o.placed_at as created_at,
        COALESCE(a.address_line_1 || ', ' || a.city || ', ' || a.state || ' - ' || a.pincode, 'No Address Provided') as shipping_address,
        o.courier,
        o.tracking_id,
        o.estimated_delivery,
        (
          SELECT json_agg(json_build_object(
            'product_id', oi.product_id,
            'name', p.name,
            'price', oi.unit_price,
            'quantity', oi.quantity,
            'image', p.images[1]
          ))
          FROM order_items oi
          JOIN products p ON oi.product_id = p.product_id
          WHERE oi.order_id = o.order_id
        ) as items
      FROM orders o
      JOIN customers c ON o.customer_id = c.customer_id
      LEFT JOIN addresses a ON o.address_id = a.address_id
      WHERE o.is_deleted = false
      ORDER BY o.placed_at DESC
    `;
    const result = await pool.query(ordersQuery);

    return res.status(200).json(result.rows || []);
  } catch (error) {
    console.error("GET ALL ORDERS ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

/**
 * Get All Customers (Admin View)
 */
export const getAllCustomers = async (req, res) => {
  try {
    const customersQuery = `
      SELECT 
        customer_id,
        full_name as name,
        email,
        phone,
        created_at,
        is_active
      FROM customers
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
    `;
    const result = await pool.query(customersQuery);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("GET ALL CUSTOMERS ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch customers" });
  }
};

/**
 * Toggle Customer Active Status
 */
export const toggleCustomerStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const checkQuery = `SELECT is_active FROM customers WHERE customer_id = $1`;
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    const newStatus = !checkResult.rows[0].is_active;
    const updateQuery = `UPDATE customers SET is_active = $1 WHERE customer_id = $2 RETURNING is_active`;
    await pool.query(updateQuery, [newStatus, id]);

    return res.status(200).json({ success: true, is_active: newStatus });
  } catch (error) {
    console.error("TOGGLE CUSTOMER STATUS ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to update status" });
  }
};
/**
 * Get All Products (Admin View)
 */
export const getAdminProducts = async (req, res) => {
  try {
    const productsQuery = `
      SELECT 
        p.*,
        c.name as category_name,
        s.store_name as seller_name,
        (SELECT json_agg(pi.* ORDER BY pi.sort_order) FROM product_images pi WHERE pi.product_id = p.product_id) as pi_images,
        (SELECT json_agg(pv.*) FROM product_variants pv WHERE pv.product_id = p.product_id) as variants
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN sellers s ON p.seller_id = s.seller_id
      WHERE p.deleted_at IS NULL
      ORDER BY p.created_at DESC
    `;
    const result = await pool.query(productsQuery);

    // Map to match frontend expectations if needed
    const products = result.rows.map(p => ({
      ...p,
      id: p.product_id,
      thumbnail: p.pi_images && p.pi_images.length > 0 ? p.pi_images[0].image_url : (p.images && p.images.length > 0 ? p.images[0] : null),
      stock: p.stock_quantity || 0,
      status: p.is_active ? "Active" : "Inactive"
    }));

    return res.status(200).json(products);
  } catch (error) {
    console.error("GET ADMIN PRODUCTS ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch admin products" });
  }
};

/**
 * Change Admin Password
 */
export const changeAdminPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Current and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
    }

    const result = await pool.query("SELECT password_hash FROM admins WHERE admin_id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Admin account not found" });
    }

    const { password_hash } = result.rows[0];
    const match = await pool.query("SELECT crypt($1, $2) = $2 AS match", [currentPassword, password_hash]);
    if (!match.rows[0].match) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }

    await pool.query(
      "UPDATE admins SET password_hash = crypt($1, gen_salt('bf')), updated_at = NOW() WHERE admin_id = $2",
      [newPassword, id]
    );

    return res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to update password" });
  }
};
