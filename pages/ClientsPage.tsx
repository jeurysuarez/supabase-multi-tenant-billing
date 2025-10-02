
import React from 'react';

const ClientsPage: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Gestión de Clientes</h1>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <p className="text-gray-300">Aquí podrás ver, crear, editar y eliminar los clientes de tu empresa.</p>
                {/* TODO: Implementar tabla de clientes y modales de creación/edición */}
            </div>
        </div>
    );
};

export default ClientsPage;
