import React from 'react';
import { useAuth } from '../hooks/useAuth';

const Dashboard: React.FC = () => {
    const { profile } = useAuth();

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">
                Panel Principal
            </h1>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold text-white mb-4">
                    ¡Bienvenido, {profile?.nombre || 'usuario'}!
                </h2>
                <p className="text-gray-300">
                    Desde aquí podrás gestionar clientes, productos y facturas de tu empresa.
                    Utiliza el menú de la izquierda para navegar por las diferentes secciones.
                </p>
                {/* TODO: Añadir estadísticas y accesos directos. */}
            </div>
        </div>
    );
};

export default Dashboard;
