const db = require("../config/database");

exports.getAll = async (req, res) => {
  try {
    const { product_id, type, start_date, end_date } = req.query;

    let query = `
      SELECT 
        sm.*,
        p.name  AS product_name,
        p.code  AS product_code,
        p.unit  AS product_unit,
        u.name  AS user_name
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.id
      JOIN users    u ON sm.user_id    = u.id
      WHERE 1=1
    `;
    const params = [];

    if (product_id) {
      query += " AND sm.product_id = ?";
      params.push(product_id);
    }
    if (type) {
      query += " AND sm.type = ?";
      params.push(type);
    }
    if (start_date) {
      query += " AND DATE(sm.created_at) >= ?";
      params.push(start_date);
    }
    if (end_date) {
      query += " AND DATE(sm.created_at) <= ?";
      params.push(end_date);
    }

    query += " ORDER BY sm.created_at DESC";

    const [rows] = await db.query(query, params);
    res.json({ data: rows });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.stockIn = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const { product_id, quantity, note } = req.body;
    const user_id = req.user.id;

    if (!product_id || !quantity || quantity <= 0) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({
        message: "product_id dan quantity (> 0) wajib diisi",
      });
    }

    const [products] = await conn.query("SELECT * FROM products WHERE id = ?", [
      product_id,
    ]);
    if (products.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    await conn.query(
      `INSERT INTO stock_movements 
        (product_id, user_id, type, quantity, note) 
       VALUES (?, ?, 'in', ?, ?)`,
      [product_id, user_id, quantity, note || null],
    );

    await conn.query("UPDATE products SET stock = stock + ? WHERE id = ?", [
      quantity,
      product_id,
    ]);

    await conn.commit();
    conn.release();

    const [updated] = await db.query(
      "SELECT stock FROM products WHERE id = ?",
      [product_id],
    );

    res.status(201).json({
      message: "Stok masuk berhasil dicatat",
      stock_now: updated[0].stock,
    });
  } catch (error) {
    await conn.rollback();
    conn.release();
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.stockOut = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const { product_id, quantity, note } = req.body;
    const user_id = req.user.id;

    if (!product_id || !quantity || quantity <= 0) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({
        message: "product_id dan quantity (> 0) wajib diisi",
      });
    }

    const [products] = await conn.query("SELECT * FROM products WHERE id = ?", [
      product_id,
    ]);
    if (products.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }
    if (products[0].stock < quantity) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({
        message: `Stok tidak cukup. Stok tersedia: ${products[0].stock}`,
      });
    }

    await conn.query(
      `INSERT INTO stock_movements 
        (product_id, user_id, type, quantity, note) 
       VALUES (?, ?, 'out', ?, ?)`,
      [product_id, user_id, quantity, note || null],
    );

    await conn.query("UPDATE products SET stock = stock - ? WHERE id = ?", [
      quantity,
      product_id,
    ]);

    await conn.commit();
    conn.release();

    const [updated] = await db.query(
      "SELECT stock FROM products WHERE id = ?",
      [product_id],
    );

    res.status(201).json({
      message: "Stok keluar berhasil dicatat",
      stock_now: updated[0].stock,
    });
  } catch (error) {
    await conn.rollback();
    conn.release();
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
