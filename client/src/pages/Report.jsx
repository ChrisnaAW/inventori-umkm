/* eslint-disable no-unused-vars */
import { useState } from "react";
import api from "../api/axios"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const Report = () => {
  const today = new Date().toISOString().split('T')[0]
  const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString().split('T')[0]

  const [startDate, setStartDate] = useState(firstDay)
  const [endDate, setEndDate] = useState(today)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  const fetchReport = async () => {
    if (!startDate || !endDate) {
      setError("Pilih tanggal awal dan akhir")
      return
    }
    if (startDate > endDate) {
      setError("Tanggal awal tidak boleh lebih besar dari tanggal akhir")
      return
    }

    setLoading(true)
    setError('')
    try {
      const res = await api.get('/reports/stock', {
        params: {start_date: startDate, end_date: endDate}
      })
      setData(res.data.data)
      setSearched(true)
    } catch (err) {
      setError("Gagal memuat laporan")
    } finally {
      setLoading(false)
    }
  }

  const formatRupiah = (num) => 
    new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(num || 0)

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric'
    })

  const exportExcel = () => {
    const rows = data.map((item, i) => ({
      'No': i + 1,
      'Kode': item.code,
      'Nama Produk': item.name,
      'Kategori': item.category || '-',
      'Satuan': item.unit,
      'Stok Masuk': item.total_in,
      'Stok Keluar': item.total_out,
      'Stok Saat Ini': item.stock_now,
    }))

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan Stok')
    XLSX.writeFile(wb, `Laporan_Stok_${startDate}_${endDate}.xlsx`)
  }

  const exportPDF = () => {
    const doc = new jsPDF()

    doc.setFontSize(14)
    doc.text('Laporan Inventori Stok', 14, 15)
    doc.setFontSize(10)
    doc.text(`UMKM Sinar Barokah`, 14, 22)
    doc.text(`Periode: ${formatDate(startDate)} - ${formatDate(endDate)}`, 14, 28)

    autoTable(doc, {
      startY: 35,
      head: [['No', 'Kode', 'Nama Produk', 'Kategori', 'Satuan', 'Masuk', 'Keluar', 'Stok Kini']],
      body: data.map((item, i) => [
        i + 1,
        item.code,
        item.name,
        item.category || '-',
        item.unit,
        item.total_in,
        item.total_out,
        item.stock_now,
      ]),
      styles: {fontSize: 8},
      headStyles: {fillColor: [37, 99, 235]},
      alternateRowStyles: {fillColor: [241, 245, 249]},
    })

    doc.save(`Laporan_Stok_${startDate}_${endDate}.pdf`)
  }

  const totalIn = data.reduce((sum, d) => sum + Number(d.total_in), 0)
  const totalOut = data.reduce((sum, d) => sum + Number(d.total_out), 0)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Laporan</h1>
        <p className="text-gray-500 text-sm">Rekap pergerakan stok per periode</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-700 mb-4">Filter Periode</h3>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Tanggal Awal
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Tanggal Akhir
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={fetchReport}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            {loading ? '⏳ Memuat...' : '🔍 Tampilkan Laporan'}
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-2 text-sm">
            ⚠️ {error}
          </div>
        )}
      </div>

      {searched && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <p className="text-gray-500 text-sm">Total Produk</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{data.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <p className="text-gray-500 text-sm">Total Stok Masuk</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{totalIn}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <p className="text-gray-500 text-sm">Total Stok Keluar</p>
              <p className="text-2xl font-bold text-red-500 mt-1">{totalOut}</p>
            </div>
          </div>

          {data.length > 0 && (
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={exportExcel}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                📊 Export Excel
              </button>
              <button
                onClick={exportPDF}
                className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                📄 Export PDF
              </button>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="font-semibold text-gray-700">
                Periode: {formatDate(startDate)} – {formatDate(endDate)}
              </p>
            </div>

            {data.length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                Tidak ada data pada periode ini
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left text-gray-500 border-b border-gray-100">
                      <th className="px-6 py-3 font-medium">No</th>
                      <th className="px-6 py-3 font-medium">Kode</th>
                      <th className="px-6 py-3 font-medium">Nama Produk</th>
                      <th className="px-6 py-3 font-medium">Kategori</th>
                      <th className="px-6 py-3 font-medium">Satuan</th>
                      <th className="px-6 py-3 font-medium text-right text-green-600">Masuk</th>
                      <th className="px-6 py-3 font-medium text-right text-red-500">Keluar</th>
                      <th className="px-6 py-3 font-medium text-right">Stok Kini</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, i) => (
                      <tr
                        key={item.code}
                        className="border-b border-gray-50 last:border-0 hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 text-gray-400">{i + 1}</td>
                        <td className="px-6 py-4 text-gray-600">{item.code}</td>
                        <td className="px-6 py-4 font-medium text-gray-800">{item.name}</td>
                        <td className="px-6 py-4 text-gray-500">{item.category || '-'}</td>
                        <td className="px-6 py-4 text-gray-500">{item.unit}</td>
                        <td className="px-6 py-4 text-right font-semibold text-green-600">
                          +{item.total_in}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-red-500">
                          -{item.total_out}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-gray-800">
                          {item.stock_now}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 border-t border-gray-200">
                      <td colSpan={5} className="px-6 py-3 font-semibold text-gray-700">
                        Total
                      </td>
                      <td className="px-6 py-3 text-right font-bold text-green-600">
                        +{totalIn}
                      </td>
                      <td className="px-6 py-3 text-right font-bold text-red-500">
                        -{totalOut}
                      </td>
                      <td className="px-6 py-3"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default Report