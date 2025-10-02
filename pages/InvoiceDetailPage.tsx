
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';


const InvoiceDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    return (
        <div>
            <button 
                onClick={() => navigate('/facturas')}
                className="inline-flex items-center mb-6 text-sm font-medium text-gray-300 hover:text-white"
            >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Volver a Facturas
            </button>
            <h1 className="text-3xl font-bold text-white mb-6">Detalle de Factura #{id}</h1>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <p className="text-gray-300">Aquí se mostrarán los detalles completos de la factura, con opción para descargarla en PDF, marcarla como pagada, etc.</p>
                {/* TODO: Implementar vista de detalle de factura */}
            </div>
        </div>
    );
};

export default InvoiceDetailPage;
