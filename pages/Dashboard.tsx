
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { ChartBarIcon, CurrencyDollarIcon, DocumentTextIcon, UsersIcon } from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const { profile } = useAuth();

  const stats = [
    { name: 'Ingresos Totales (Mes)', value: '$0', icon: CurrencyDollarIcon },
    { name: 'Facturas Emitidas (Mes)', value: '0', icon: DocumentTextIcon },
    { name: 'Clientes Nuevos (Mes)', value: '0', icon: UsersIcon },
    { name: 'Tasa de Pago', value: '0%', icon: ChartBarIcon },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">
        Bienvenido, {profile?.nombre}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-gray-800 p-6 rounded-lg shadow-lg flex items-center">
            <div className="bg-primary-600 p-3 rounded-full mr-4">
              <stat.icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">{stat.name}</p>
              <p className="text-2xl font-semibold text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Actividad Reciente</h2>
          <div className="text-gray-400">
            No hay actividad reciente para mostrar.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
