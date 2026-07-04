const db = require("../config/database");

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM categories ORDER BY created_at DESC",
    );
    res.json({ data: rows });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM categories WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Kategori tidak ditemukan" });
    }
    res.json({ data: rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Nama kategori wajib diisi" });
    }
    const [result] = await db.query(
      "INSERT INTO categories (name, description) VALUES (?, ?)",
      [name, description || null],
    );
    res.status(201).json({
      message: "Kategori berhasil ditambahkan",
      id: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Nama kategori wajib diisi" });
    }
    const [result] = await db.query(
      "UPDATE categories SET name = ?, description = ? WHERE id = ?",
      [name, description || null, req.params.id],
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Kategoru tidak ditemukan" });
    }
    res.json({ message: "Kategori berhasil diupdate" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM categories WHERE id = ?", [
      req.params.id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Kategori tidak ditemukan" });
    }
    res.json({ message: "Kategori berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
