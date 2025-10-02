import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-gray-900 border-b border-gray-700">
      <div>
         {profile?.empresa && <h1 className="text-xl font-semibold text-white">{profile.empresa.nombre}</h1>}
      </div>
      <div className="flex items-center">
        <div className="text-right mr-4">
          <p className="text-sm font-medium text-white">{profile?.nombre}</p>
          <p className="text-xs text-gray-400 capitalize">{profile?.rol}</p>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
          aria-label="Logout"
        >
          <ArrowRightOnRectangleIcon className="h-6 w-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;
