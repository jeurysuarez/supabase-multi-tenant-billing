
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const CreateInvoicePage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div>
            <button 
                onClick={() => navigate(-1)}
                className="inline-flex items-center mb-6 text-sm font-medium text-gray-300 hover:text-white"
            >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Volver a Facturas
            </button>
            <h1 className="text-3xl font-bold text-white mb-6">Crear Nueva Factura</h1>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <p className="text-gray-300">Formulario para crear una nueva factura.</p>
                {/* TODO: Implementar formulario de creación de factura */}
            </div>
        </div>
    );
};

export default CreateInvoicePage;
