/* eslint-disable react-hooks/immutability */
import { useState, useEffect, useRef } from "react";
import api from "../api/axios"

const Navbar = ({title}) => {
  const [lowStock, setLowStock] = useState([])
  const [showDrop, setShowDrop] = useState(false)
  const dropRef = useRef(null)

  useEffect(() => {
    fetchLowStock();
    const interval = setInterval(fetchLowStock, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setShowDrop(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchLowStock = async () => {
    try {
      const res = await api.get('/products/low-stock')
      setLowStock(res.data.data)
    } catch (err) {
      console.error('Gagal fetch low stock', err)
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>

      <div className="relative" ref={dropRef}>
        <button
          onClick={() => setShowDrop(!showDrop)}
          className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <span className="text-xl">🔔</span>
          {lowStock.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {lowStock.length > 9 ? '9+' : lowStock.length}
            </span>
          )}
        </button>

        {showDrop && (
          <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <p className="font-semibold text-gray-800 text-sm">⚠️ Stok Menipis</p>
              <span className="text-xs text-gray-400">{lowStock.length} produk</span>
            </div>

            {lowStock.length === 0 ? (
              <div className="px-4 py-6 text-center text-gray-400 text-sm">
                Semua stok aman 🎉
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                {lowStock.map((p) => (
                  <div key={p.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.code} • {p.category_name || 'Tanpa kategori'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-red-500 font-bold text-sm">{p.stock} {p.unit}</p>
                        <p className="text-xs text-gray-400">min. {p.min_stock}</p>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-400 rounded-full"
                        style={{ width: `${Math.min((p.stock / p.min_stock) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="px-4 py-3 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                Diperbarui otomatis setiap 60 detik
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar