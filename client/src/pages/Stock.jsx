/* eslint-disable react-hooks/immutability */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import api from "../api/axios"
import Modal from "../components/Modal"

const Stock = () => {
  const [movements, setMovements] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [filterType, setFilterType] = useState('')
  const [filterProduct, setFilterProduct] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState('in')
  const [form, setForm] = useState({product_id: '', quantity: '', note: ''})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchProducts()
    fetchMovements()
  }, [])

  useEffect(() => {
    fetchMovements()
  }, [filterType, filterProduct])

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products')
      setProducts(res.data.data)
    } catch (err) {
      console.error("Gagal memuat produk", err)
    }
  }

  const fetchMovements = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filterType) params.type = filterType
      if(filterProduct) params.product_id = filterProduct

      const res = await api.get('/stock', {params})
      setMovements(res.data.data)
    } catch (err) {
      setError("Gagal memuat riwayat stok")
    } finally {
      setLoading(false)
    }
  }

  const openModal = (type) => {
    setModalType(type)
    setForm({product_id: '', quantity: '', note: ''})
    setFormError('')
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!form.product_id || !form.quantity || form.quantity <= 0) {
      setFormError("Produk dan jumlah (lebih dari 0) wajib diisi")
      return
    }

    setSubmitting(true)
    try {
      const endpoint = modalType === 'in' ? '/stock/in' : '/stock/out'
      await api.post(endpoint, {
        product_id: form.product_id,
        quantity: parseInt(form.quantity),
        note: form.note
      })
      setModalOpen(false)
      fetchMovements()
      fetchProducts()
    } catch (err) {
      setFormError(err.response?.data?.message || "Terjadi kesalahan")
    } finally {
      setSubmitting(false)
    }
  }

  const selectedProduct = products.find(p => p.id == form.product_id)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Stok</h1>
          <p className="text-gray-500 text-sm">Catat pergerakan stok masuk & keluar</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => openModal('in')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            📥 Stok Masuk
          </button>
          <button
            onClick={() => openModal('out')}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            📤 Stok Keluar
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Semua Tipe</option>
          <option value="in">Stok Masuk</option>
          <option value="out">Stok Keluar</option>
        </select>

        <select
          value={filterProduct}
          onChange={(e) => setFilterProduct(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Semua Produk</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Tabel Riwayat */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Memuat data...</div>
        ) : error ? (
          <div className="p-10 text-center text-red-500">{error}</div>
        ) : movements.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            Belum ada riwayat pergerakan stok
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500 border-b border-gray-100">
                  <th className="px-6 py-3 font-medium">Tanggal</th>
                  <th className="px-6 py-3 font-medium">Tipe</th>
                  <th className="px-6 py-3 font-medium">Produk</th>
                  <th className="px-6 py-3 font-medium text-right">Jumlah</th>
                  <th className="px-6 py-3 font-medium">Catatan</th>
                  <th className="px-6 py-3 font-medium">Petugas</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {new Date(m.created_at).toLocaleString('id-ID', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        m.type === 'in'
                          ? 'bg-green-50 text-green-600'
                          : 'bg-red-50 text-red-500'
                      }`}>
                        {m.type === 'in' ? '📥 Masuk' : '📤 Keluar'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">{m.product_name}</p>
                      <p className="text-xs text-gray-400">{m.product_code}</p>
                    </td>
                    <td className={`px-6 py-4 text-right font-semibold ${
                      m.type === 'in' ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {m.type === 'in' ? '+' : '-'}{m.quantity} {m.product_unit}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{m.note || '-'}</td>
                    <td className="px-6 py-4 text-gray-500">{m.user_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form Stok */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalType === 'in' ? '📥 Catat Stok Masuk' : '📤 Catat Stok Keluar'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-2 text-sm">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Produk <span className="text-red-500">*</span>
            </label>
            <select
              value={form.product_id}
              onChange={(e) => setForm({ ...form, product_id: e.target.value })}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">- Pilih Produk -</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Stok: {p.stock} {p.unit})
                </option>
              ))}
            </select>
            {selectedProduct && modalType === 'out' && (
              <p className="text-xs text-gray-400 mt-1">
                Stok tersedia: <span className="font-medium">{selectedProduct.stock} {selectedProduct.unit}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jumlah <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catatan
            </label>
            <textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={modalType === 'in' ? 'Contoh: Restock dari supplier' : 'Contoh: Penjualan harian'}
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                modalType === 'in'
                  ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
                  : 'bg-red-500 hover:bg-red-600 disabled:bg-red-300'
              }`}
            >
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Stock