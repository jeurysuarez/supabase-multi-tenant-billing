import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ClientsPage from './pages/ClientsPage';
import ProductsPage from './pages/ProductsPage';
import InvoicesPage from './pages/InvoicesPage';
import CreateInvoicePage from './pages/CreateInvoicePage';
import InvoiceDetailPage from './pages/InvoiceDetailPage';
import UsersPage from './pages/UsersPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="clientes" element={<ClientsPage />} />
              <Route path="productos" element={<ProductsPage />} />
              <Route path="facturas" element={<InvoicesPage />} />
              <Route path="facturas/crear" element={<CreateInvoicePage />} />
              <Route path="facturas/:id" element={<InvoiceDetailPage />} />
              
              {/* Admin only routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="usuarios" element={<UsersPage />} />
              </Route>
            </Route>
          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
