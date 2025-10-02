
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ClientsPage from './pages/ClientsPage';
import ProductsPage from './pages/ProductsPage';
import UsersPage from './pages/UsersPage';
import InvoicesPage from './pages/InvoicesPage';
import CreateInvoicePage from './pages/CreateInvoicePage';
import InvoiceDetailPage from './pages/InvoiceDetailPage';
import NotFoundPage from './pages/NotFoundPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          
          <Route path="/" element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="clientes" element={<ClientsPage />} />
              <Route path="productos" element={<ProductsPage />} />
              <Route path="facturas" element={<InvoicesPage />} />
              <Route path="facturas/crear" element={<CreateInvoicePage />} />
              <Route path="facturas/:id" element={<InvoiceDetailPage />} />
              
              <Route path="usuarios" element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route index element={<UsersPage />} />
              </Route>
              
              {/* This will render the dashboard for any other authenticated route. 
                  A better approach might be to navigate to a 404 page within the layout. */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
          
          {/* A general 404 for routes that don't match anything */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
