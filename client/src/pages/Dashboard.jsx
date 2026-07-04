/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/reports/dashboard');
      setData(res.data);
    } catch (err) {
      setError('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"/>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3">
          ⚠️ {error}
        </div>
      </div>
    );
  }

  const { summary, low_stock_products, recent_movements } = data;

  const formatRupiah = (num) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);

  const chartData = low_stock_products.map(p => ({
    name: p.name.length > 12 ? p.name.slice(0, 12) + '…' : p.name,
    stok: p.stock,
    minimum: p.min_stock
  }));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm">Ringkasan kondisi inventori saat ini</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="📦" label="Total Produk" value={summary.total_products} color="bg-blue-100" />
        <StatCard icon="🏷️" label="Total Kategori" value={summary.total_categories} color="bg-purple-100" />
        <StatCard icon="⚠️" label="Stok Menipis" value={summary.low_stock_count} color="bg-amber-100" />
        <StatCard icon="💰" label="Nilai Inventori" value={formatRupiah(summary.total_value)} color="bg-green-100" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard icon="📥" label="Stok Masuk Hari Ini" value={summary.stock_in_today} color="bg-emerald-100" />
        <StatCard icon="📤" label="Stok Keluar Hari Ini" value={summary.stock_out_today} color="bg-rose-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">📉 Produk Stok Menipis</h3>
          {chartData.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">
              Tidak ada produk dengan stok menipis 🎉
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="stok" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Stok Saat Ini" />
                <Bar dataKey="minimum" fill="#e5e7eb" radius={[4, 4, 0, 0]} name="Stok Minimum" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">🕒 Aktivitas Terbaru</h3>
          {recent_movements.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">Belum ada aktivitas</p>
          ) : (
            <div className="space-y-3 max-h-[250px] overflow-y-auto">
              {recent_movements.map((m, i) => (
                <div key={i} className="flex items-center justify-between text-sm border-b border-gray-50 pb-2 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className={m.type === 'in' ? 'text-green-600' : 'text-red-500'}>
                      {m.type === 'in' ? '📥' : '📤'}
                    </span>
                    <div>
                      <p className="font-medium text-gray-700">{m.product_name}</p>
                      <p className="text-gray-400 text-xs">{m.user_name} • {new Date(m.created_at).toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                  <span className={`font-semibold ${m.type === 'in' ? 'text-green-600' : 'text-red-500'}`}>
                    {m.type === 'in' ? '+' : '-'}{m.quantity} {m.unit}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {low_stock_products.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">⚠️ Daftar Produk Perlu Restock</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-2">Kode</th>
                  <th className="pb-2">Nama Produk</th>
                  <th className="pb-2">Kategori</th>
                  <th className="pb-2 text-right">Stok</th>
                  <th className="pb-2 text-right">Minimum</th>
                </tr>
              </thead>
              <tbody>
                {low_stock_products.map((p, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="py-2 text-gray-600">{p.code}</td>
                    <td className="py-2 font-medium text-gray-800">{p.name}</td>
                    <td className="py-2 text-gray-500">{p.category || '-'}</td>
                    <td className="py-2 text-right font-semibold text-red-500">{p.stock} {p.unit}</td>
                    <td className="py-2 text-right text-gray-500">{p.min_stock} {p.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;