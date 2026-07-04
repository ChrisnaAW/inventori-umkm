const db = require("../config/database");

exports.getDashboard = async (req, res) => {
  try {
    const [[{ total_products }]] = await db.query(
      "SELECT COUNT(*) AS total_products FROM products",
    );

    const [[{ total_categories }]] = await db.query(
      "SELECT COUNT(*) AS total_categories FROM categories",
    );

    const [[{ low_stock_count }]] = await db.query(
      "SELECT COUNT(*) AS low_stock_count FROM products WHERE stock <= min_stock",
    );

    const [[{ total_value }]] = await db.query(
      "SELECT SUM(stock * price) AS total_value FROM products",
    );

    const [[{ stock_in_today }]] = await db.query(
      `SELECT COALESCE(SUM(quantity), 0) AS stock_in_today 
       FROM stock_movements 
       WHERE type = 'in' AND DATE(created_at) = CURDATE()`,
    );

    const [[{ stock_out_today }]] = await db.query(
      `SELECT COALESCE(SUM(quantity), 0) AS stock_out_today 
       FROM stock_movements 
       WHERE type = 'out' AND DATE(created_at) = CURDATE()`,
    );

    const [low_stock_products] = await db.query(
      `SELECT p.name, p.code, p.stock, p.min_stock, p.unit, c.name AS category
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.stock <= p.min_stock
       ORDER BY p.stock ASC
       LIMIT 5`,
    );

    const [recent_movements] = await db.query(
      `SELECT sm.type, sm.quantity, sm.note, sm.created_at,
              p.name AS product_name, p.unit,
              u.name AS user_name
       FROM stock_movements sm
       JOIN products p ON sm.product_id = p.id
       JOIN users    u ON sm.user_id    = u.id
       ORDER BY sm.created_at DESC
       LIMIT 10`,
    );

    res.json({
      summary: {
        total_products,
        total_categories,
        low_stock_count,
        total_value: total_value || 0,
        stock_in_today,
        stock_out_today,
      },
      low_stock_products,
      recent_movements,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getStockReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        message: "start_date dan end_date wajib diisi (format: YYYY-MM-DD)",
      });
    }

    const [rows] = await db.query(
      `SELECT 
        p.code,
        p.name,
        p.unit,
        c.name                                    AS category,
        p.stock                                   AS stock_now,
        COALESCE(SUM(CASE WHEN sm.type = 'in'  
                     THEN sm.quantity END), 0)    AS total_in,
        COALESCE(SUM(CASE WHEN sm.type = 'out' 
                     THEN sm.quantity END), 0)    AS total_out
       FROM products p
       LEFT JOIN categories c       ON p.category_id  = c.id
       LEFT JOIN stock_movements sm ON p.id = sm.product_id
         AND DATE(sm.created_at) BETWEEN ? AND ?
       GROUP BY p.id, p.code, p.name, p.unit, c.name, p.stock
       ORDER BY p.name ASC`,
      [start_date, end_date],
    );

    res.json({
      period: { start_date, end_date },
      data: rows,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
