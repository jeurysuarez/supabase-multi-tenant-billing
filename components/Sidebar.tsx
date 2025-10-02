
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  HomeIcon,
  UsersIcon,
  ShoppingBagIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

const Sidebar: React.FC = () => {
  const { profile } = useAuth();

  const navLinkClass = ({ isActive }: { isActive: boolean }): string =>
    `flex items-center px-4 py-2 mt-2 text-sm font-semibold rounded-lg transition-colors duration-200 ${
      isActive
        ? 'bg-primary-600 text-white'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;

  return (
    <aside className="flex-shrink-0 w-64 bg-gray-900 border-r border-gray-700 flex flex-col">
      <div className="h-16 flex items-center justify-center px-4 text-white text-2xl font-bold border-b border-gray-700">
        FacturaPro
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        <NavLink to="/" className={navLinkClass} end>
            <HomeIcon className="w-5 h-5 mr-3" />
            Panel Principal
        </NavLink>
        <NavLink to="/clientes" className={navLinkClass}>
            <UsersIcon className="w-5 h-5 mr-3" />
            Clientes
        </NavLink>
        <NavLink to="/productos" className={navLinkClass}>
            <ShoppingBagIcon className="w-5 h-5 mr-3" />
            Productos
        </NavLink>
        <NavLink to="/facturas" className={navLinkClass}>
            <DocumentTextIcon className="w-5 h-5 mr-3" />
            Facturas
        </NavLink>
        {profile?.rol === 'admin' && (
            <NavLink to="/usuarios" className={navLinkClass}>
                <UsersIcon className="w-5 h-5 mr-3" />
                Usuarios
            </NavLink>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
