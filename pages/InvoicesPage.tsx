import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Factura } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { PlusIcon, EyeIcon } from '@heroicons/react/24/outline';

const InvoicesPage: React.FC = () => {
    const { profile } = useAuth();
    const [invoices, setInvoices] = useState<Factura[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchInvoices = useCallback(async () => {
        if (!profile) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('facturas')
            .select('*, clientes(nombre), usuarios(nombre)')
            .eq('empresa_id', profile.empresa_id)
            .order('fecha', { ascending: false });

        if (error) {
            console.error('Error al obtener facturas:', error);
        } else {
            setInvoices(data as unknown as Factura[]);
        }
        setLoading(false);
    }, [profile]);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    const getStatusChip = (status: string) => {
        switch (status) {
            case 'pagada':
                return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">Pagada</span>;
            case 'pendiente':
                return <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-200 rounded-full">Pendiente</span>;
            case 'anulada':
                return <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-200 rounded-full">Anulada</span>;
            default:
                return <span className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 rounded-full">Desconocido</span>;
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Facturas</h1>
                <button onClick={() => navigate('/invoices/new')} className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-md flex items-center">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Nueva Factura
                </button>
            </div>
             <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-white">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="py-3 px-4 text-left">ID Factura</th>
                                <th className="py-3 px-4 text-left">Cliente</th>
                                <th className="py-3 px-4 text-left">Fecha</th>
                                <th className="py-3 px-4 text-right">Total</th>
                                <th className="py-3 px-4 text-center">Estado</th>
                                <th className="py-3 px-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-4">Cargando facturas...</td></tr>
                            ) : invoices.map((invoice) => (
                                <tr key={invoice.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="py-3 px-4 font-mono text-sm">...{invoice.id.slice(-8)}</td>
                                    <td className="py-3 px-4">{invoice.clientes.nombre}</td>
                                    <td className="py-3 px-4">{new Date(invoice.fecha).toLocaleDateString()}</td>
                                    <td className="py-3 px-4 text-right">${invoice.total.toFixed(2)}</td>
                                    <td className="py-3 px-4 text-center">{getStatusChip(invoice.estado)}</td>
                                    <td className="py-3 px-4 text-center">
                                        <Link to={`/invoices/${invoice.id}`} className="text-primary-400 hover:text-primary-300 p-2 inline-block">
                                            <EyeIcon className="h-5 w-5"/>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InvoicesPage;