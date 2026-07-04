const db = require("../config/database");

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `);
    res.json({ data: rows });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `,
      [req.params.id],
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }
    res.json({ data: rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getLowStock = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.stock <= p.min_stock
      ORDER BY p.stock ASC
    `);
    res.json({ data: rows });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, code, category_id, price, stock, min_stock, unit } = req.body;

    if (!name || !code) {
      return res
        .status(400)
        .json({ message: "Nama dan kode produk wajib diisi" });
    }

    const [existing] = await db.query(
      "SELECT id FROM products WHERE code = ?",
      [code],
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: "Kode produk sudah digunakan" });
    }

    const [result] = await db.query(
      `INSERT INTO products 
        (name, code, category_id, price, stock, min_stock, unit) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        code,
        category_id || null,
        price || 0,
        stock || 0,
        min_stock || 5,
        unit || "pcs",
      ],
    );

    res.status(201).json({
      message: "Produk berhasil ditambahkan",
      id: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, code, category_id, price, stock, min_stock, unit } = req.body;

    if (!name || !code) {
      return res
        .status(400)
        .json({ message: "Nama dan kode produk wajib diisi" });
    }

    const [existing] = await db.query(
      "SELECT id FROM products WHERE code = ? AND id != ?",
      [code, req.params.id],
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: "Kode produk sudah digunakan" });
    }

    const [result] = await db.query(
      `UPDATE products SET
        name = ?, code = ?, category_id = ?,
        price = ?, stock = ?, min_stock = ?, unit = ?
       WHERE id = ?`,
      [
        name,
        code,
        category_id || null,
        price || 0,
        stock || 0,
        min_stock || 5,
        unit || "pcs",
        req.params.id,
      ],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    res.json({ message: "Produk berhasil diupdate" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM products WHERE id = ?", [
      req.params.id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }
    res.json({ message: "Produk berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
