import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

import Login      from './pages/Login';
import Dashboard  from './pages/Dashboard';
import Products   from './pages/Products';
import Categories from './pages/Categories';
import Stock      from './pages/Stock';
import Report     from './pages/Report';
import Suppliers  from './pages/Suppliers';

const pageTitles = {
  '/dashboard':  'Dashboard',
  '/products':   'Produk',
  '/categories': 'Kategori',
  '/stock':      'Stok',
  '/report':     'Laporan',
  '/suppliers':  'Supplier',
};

const AppLayout = ({ children }) => {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Inventori';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-auto">
        <Navbar title={title} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {[
            { path: '/dashboard',  el: <Dashboard />  },
            { path: '/products',   el: <Products />   },
            { path: '/categories', el: <Categories /> },
            { path: '/stock',      el: <Stock />      },
            { path: '/report',     el: <Report />     },
            { path: '/suppliers',  el: <Suppliers />  },
          ].map(({ path, el }) => (
            <Route key={path} path={path} element={
              <ProtectedRoute>
                <AppLayout>{el}</AppLayout>
              </ProtectedRoute>
            }/>
          ))}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;