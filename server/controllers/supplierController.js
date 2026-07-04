const db = require("../config/database");

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM suppliers ORDER BY created_at DESC",
    );
    res.json({ data: rows });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM suppliers WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0)
      return res.status(404).json({ message: "Supplier tidak ditemukan" });
    res.json({ data: rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;
    if (!name)
      return res.status(400).json({ message: "Nama supplier wajib diisi" });
    const [result] = await db.query(
      "INSERT INTO suppliers (name, phone, email, address) VALUES (?, ?, ?, ?)",
      [name, phone || null, email || null, address || null],
    );
    res.status(201).json({
      message: "Supplier berhasil ditambahkan",
      id: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;
    if (!name)
      return res.status(400).json({ message: "Nama supplier wajib diisi" });
    const [result] = await db.query(
      "UPDATE suppliers SET name=?, phone=?, email=?, address=? WHERE id=?",
      [name, phone || null, email || null, address || null, req.params.id],
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Supplier tidak ditemukan" });
    res.json({ message: "Supplier berhasil diupdate" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM suppliers WHERE id=?", [
      req.params.id,
    ]);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Supplier tidak ditemukan" });
    res.json({ message: "Supplier berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
