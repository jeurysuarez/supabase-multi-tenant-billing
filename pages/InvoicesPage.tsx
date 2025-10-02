
import React from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';

const InvoicesPage: React.FC = () => {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Gestión de Facturas</h1>
                <Link
                    to="/facturas/crear"
                    className="inline-flex items-center px-4 py-2 bg-primary-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-primary-700 active:bg-primary-900 focus:outline-none focus:border-primary-900 focus:ring ring-primary-300 disabled:opacity-25 transition ease-in-out duration-150"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Nueva Factura
                </Link>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <p className="text-gray-300">Aquí podrás ver, crear y gestionar las facturas de tu empresa.</p>
                {/* TODO: Implementar tabla de facturas */}
            </div>
        </div>
    );
};

export default InvoicesPage;
