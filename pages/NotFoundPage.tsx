import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
            <h1 className="text-9xl font-bold text-primary-500">404</h1>
            <h2 className="text-3xl font-semibold mt-4 mb-2">Página No Encontrada</h2>
            <p className="text-gray-400 mb-6">Lo sentimos, la página que estás buscando no existe.</p>
            <Link 
                to="/" 
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-6 rounded-md transition duration-300"
            >
                Ir al Panel Principal
            </Link>
        </div>
    );
};

export default NotFoundPage;