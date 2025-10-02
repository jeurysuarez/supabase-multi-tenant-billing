
import React from 'react';

const ProductsPage: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Gestión de Productos</h1>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <p className="text-gray-300">Aquí podrás ver, crear, editar y eliminar los productos o servicios de tu empresa.</p>
                {/* TODO: Implementar tabla de productos y modales de creación/edición */}
            </div>
        </div>
    );
};

export default ProductsPage;
