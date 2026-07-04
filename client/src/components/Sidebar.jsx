import {NavLink, useNavigate} from "react-router-dom"
import { useAuth } from '../context/AuthContext'

const menus = [
  { to: '/dashboard',  icon: '📊', label: 'Dashboard' },
  { to: '/products',   icon: '📦', label: 'Produk'    },
  { to: '/categories', icon: '🏷️', label: 'Kategori'  },
  { to: '/stock',      icon: '🔄', label: 'Stok'      },
  { to: '/report',     icon: '📋', label: 'Laporan'   },
  { to: '/suppliers',  icon: '🏭', label: 'Supplier'  },
]

const Sidebar = () => {
  const {user, logout} = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-64 min-h-screen bg-blue-900 text-white flex flex-col">
      <div className="p-6 border-b border-blue-700">
        <h1 className="text-xl font-bold">📦 Inventori</h1>
        <p className="text-blue-300 text-sm mt-1">UMKM Sinar Barokah</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menus.map((m) => (
          <NavLink
            key={m.to}
            to={m.to}
            className={({isActive}) => 
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium
              ${isActive
                ? 'bg-blue-600 text-white'
                : 'text-blue-200 hover:bg-blue-800 hover:text-white'}`
            }
          >
            <span>{m.icon}</span>
            <span>{m.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-blue-700">
        <p className="text-blue-300 text-xs mb-1">Login sebagai</p>
        <p className="font-semibold text-sm">{user?.name}</p>
        <p className="text-blue-300 text-xs capitalize">{user?.role}</p>
        <button
          onClick={handleLogout}
          className="mt-3 w-full bg-red-500 hover:bg-red-600 text-white text-sm py-2 rounded-lg transition-colors"
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  )
}

export default Sidebar