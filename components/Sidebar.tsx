import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import { HomeIcon, UsersIcon, ArchiveBoxIcon, ShoppingCartIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const Sidebar: React.FC = () => {
  const { profile } = useAuth();

  const commonClasses = "flex items-center px-4 py-2 mt-5 text-gray-400 rounded-lg hover:bg-gray-700 hover:text-white";
  const activeClasses = "bg-gray-700 text-white";

  return (
    <div className="flex flex-col w-64 bg-gray-900 border-r border-gray-700">
      <div className="flex items-center justify-center h-16 border-b border-gray-700">
        <span className="text-white text-2xl font-bold">FacturaPro</span>
      </div>
      <div className="flex flex-col flex-1 overflow-y-auto p-4">
        <nav>
          <NavLink to="/" className={({ isActive }) => `${commonClasses} ${isActive ? activeClasses : ''}`}>
            <HomeIcon className="h-6 w-6 mr-3" />
            Panel
          </NavLink>
          <NavLink to="/invoices" className={({ isActive }) => `${commonClasses} ${isActive ? activeClasses : ''}`}>
            <DocumentTextIcon className="h-6 w-6 mr-3" />
            Facturas
          </NavLink>
          <NavLink to="/clients" className={({ isActive }) => `${commonClasses} ${isActive ? activeClasses : ''}`}>
            <ShoppingCartIcon className="h-6 w-6 mr-3" />
            Clientes
          </NavLink>
          <NavLink to="/products" className={({ isActive }) => `${commonClasses} ${isActive ? activeClasses : ''}`}>
            <ArchiveBoxIcon className="h-6 w-6 mr-3" />
            Productos
          </NavLink>
          {profile?.rol === UserRole.ADMIN && (
            <NavLink to="/users" className={({ isActive }) => `${commonClasses} ${isActive ? activeClasses : ''}`}>
              <UsersIcon className="h-6 w-6 mr-3" />
              Usuarios
            </NavLink>
          )}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;