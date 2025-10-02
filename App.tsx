import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
// FIX: Consolidate useAuth hook usage to the one in `hooks/useAuth.ts`.
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/UsersPage';
import ClientsPage from './pages/ClientsPage';
import ProductsPage from './pages/ProductsPage';
import InvoicesPage from './pages/InvoicesPage';
import CreateInvoicePage from './pages/CreateInvoicePage';
import InvoiceDetailPage from './pages/InvoiceDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import { UserRole } from './types';


const AppRoutes: React.FC = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/auth" element={!session ? <AuthPage /> : <Navigate to="/" />} />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="invoices/new" element={<CreateInvoicePage />} />
          <Route path="invoices/:id" element={<InvoiceDetailPage />} />
          <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
            <Route path="users" element={<UsersPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}


const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
