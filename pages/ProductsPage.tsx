import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Producto } from '../types';
import { useAuth } from '../hooks/useAuth';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const ProductsPage: React.FC = () => {
    const { profile } = useAuth();
    const [products, setProducts] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Partial<Producto> | null>(null);

    const fetchProducts = useCallback(async () => {
        if (!profile) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('productos')
            .select('*')
            .eq('empresa_id', profile.empresa_id)
            .order('created_at', { ascending: false });
        if (error) {
            console.error('Error fetching products:', error);
        } else {
            setProducts(data);
        }
        setLoading(false);
    }, [profile]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleOpenModal = (product: Producto | null = null) => {
        if (product) {
            setIsEditing(true);
            setCurrentProduct(product);
        } else {
            setIsEditing(false);
            setCurrentProduct({ nombre: '', descripcion: '', precio: 0, stock: 0 });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentProduct(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (currentProduct) {
            const { name, value, type } = e.target;
            const isNumber = type === 'number';
            setCurrentProduct({ ...currentProduct, [name]: isNumber ? parseFloat(value) : value });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentProduct || !profile) return;

        const productData = {
            ...currentProduct,
            empresa_id: profile.empresa_id,
        };

        let error;
        if (isEditing) {
            ({ error } = await supabase.from('productos').update(productData).eq('id', currentProduct.id));
        } else {
            ({ error } = await supabase.from('productos').insert(productData));
        }

        if (error) {
            console.error('Error saving product:', error);
            alert('Could not save product: ' + error.message);
        } else {
            fetchProducts();
            handleCloseModal();
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            const { error } = await supabase.from('productos').delete().eq('id', id);
            if (error) {
                console.error('Error deleting product:', error);
                alert('Could not delete product: ' + error.message);
            } else {
                fetchProducts();
            }
        }
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Products</h1>
                <button onClick={() => handleOpenModal()} className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-md flex items-center">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Product
                </button>
            </div>

            <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-white">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="py-3 px-4 text-left">Name</th>
                                <th className="py-3 px-4 text-left">Description</th>
                                <th className="py-3 px-4 text-right">Price</th>
                                <th className="py-3 px-4 text-right">Stock</th>
                                <th className="py-3 px-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="text-center py-4">Loading...</td></tr>
                            ) : products.map((product) => (
                                <tr key={product.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="py-3 px-4">{product.nombre}</td>
                                    <td className="py-3 px-4 max-w-xs truncate">{product.descripcion}</td>
                                    <td className="py-3 px-4 text-right">${product.precio.toFixed(2)}</td>
                                    <td className="py-3 px-4 text-right">{product.stock}</td>
                                    <td className="py-3 px-4 text-center">
                                        <button onClick={() => handleOpenModal(product)} className="text-primary-400 hover:text-primary-300 p-2"><PencilIcon className="h-5 w-5"/></button>
                                        <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-400 p-2"><TrashIcon className="h-5 w-5"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">{isEditing ? 'Edit Product' : 'Add Product'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-400 mb-1">Name</label>
                                <input type="text" name="nombre" value={currentProduct?.nombre || ''} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2" required />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-400 mb-1">Description</label>
                                <textarea name="descripcion" value={currentProduct?.descripcion || ''} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2" />
                            </div>
                             <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-gray-400 mb-1">Price</label>
                                    <input type="number" step="0.01" name="precio" value={currentProduct?.precio ?? ''} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2" required />
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-1">Stock</label>
                                    <input type="number" name="stock" value={currentProduct?.stock ?? ''} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2" required />
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-gray-600 rounded-md">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-md">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductsPage;
