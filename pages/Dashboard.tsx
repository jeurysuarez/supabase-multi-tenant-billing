import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabase';
import { UsersIcon, ArchiveBoxIcon, DocumentTextIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline';

const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex items-center">
        <div className="p-3 rounded-full bg-primary-500/20 text-primary-400 mr-4">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
        </div>
    </div>
);


const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ clients: 0, products: 0, invoices: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!profile) return;

      setLoading(true);

      const [
        { count: clientCount },
        { count: productCount },
        { count: invoiceCount }
      ] = await Promise.all([
        supabase.from('clientes').select('*', { count: 'exact', head: true }).eq('empresa_id', profile.empresa_id),
        supabase.from('productos').select('*', { count: 'exact', head: true }).eq('empresa_id', profile.empresa_id),
        supabase.from('facturas').select('*', { count: 'exact', head: true }).eq('empresa_id', profile.empresa_id)
      ]);
      
      setStats({
        clients: clientCount ?? 0,
        products: productCount ?? 0,
        invoices: invoiceCount ?? 0,
      });

      setLoading(false);
    };

    fetchStats();
  }, [profile]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Welcome, {profile?.nombre}!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Clients" value={loading ? '...' : stats.clients} icon={<UsersIcon className="h-8 w-8" />} />
        <StatCard title="Total Products" value={loading ? '...' : stats.products} icon={<ArchiveBoxIcon className="h-8 w-8" />} />
        <StatCard title="Total Invoices" value={loading ? '...' : stats.invoices} icon={<DocumentTextIcon className="h-8 w-8" />} />
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <BuildingOffice2Icon className="h-6 w-6 mr-3 text-primary-400" />
            Company Information
        </h2>
        {profile?.empresa ? (
            <div className="space-y-3 text-gray-300">
                <p><span className="font-semibold text-gray-400">Name:</span> {profile.empresa.nombre}</p>
                <p><span className="font-semibold text-gray-400">RNC:</span> {profile.empresa.rnc || 'N/A'}</p>
                <p><span className="font-semibold text-gray-400">Address:</span> {profile.empresa.direccion || 'N/A'}</p>
                <p><span className="font-semibold text-gray-400">Phone:</span> {profile.empresa.telefono || 'N/A'}</p>
            </div>
        ) : (
            <p>Loading company information...</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
