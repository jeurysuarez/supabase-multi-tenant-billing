import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Cliente } from '../types';
import { useAuth } from '../hooks/useAuth';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const ClientsPage: React.FC = () => {
    const { profile } = useAuth();
    const [clients, setClients] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentClient, setCurrentClient] = useState<Partial<Cliente> | null>(null);

    const fetchClients = useCallback(async () => {
        if (!profile) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .eq('empresa_id', profile.empresa_id)
            .order('created_at', { ascending: false });
        if (error) {
            console.error('Error fetching clients:', error);
        } else {
            setClients(data);
        }
        setLoading(false);
    }, [profile]);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    const handleOpenModal = (client: Cliente | null = null) => {
        if (client) {
            setIsEditing(true);
            setCurrentClient(client);
        } else {
            setIsEditing(false);
            setCurrentClient({ nombre: '', email: '', telefono: '', rnc: '', direccion: '' });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentClient(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (currentClient) {
            setCurrentClient({ ...currentClient, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentClient || !profile) return;

        const clientData = {
            ...currentClient,
            empresa_id: profile.empresa_id,
        };

        let error;
        if (isEditing) {
            ({ error } = await supabase.from('clientes').update(clientData).eq('id', currentClient.id));
        } else {
            ({ error } = await supabase.from('clientes').insert(clientData));
        }

        if (error) {
            console.error('Error saving client:', error);
            alert('Could not save client. ' + error.message);
        } else {
            fetchClients();
            handleCloseModal();
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this client?')) {
            const { error } = await supabase.from('clientes').delete().eq('id', id);
            if (error) {
                console.error('Error deleting client:', error);
                alert('Could not delete client. ' + error.message);
            } else {
                fetchClients();
            }
        }
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Clients</h1>
                <button onClick={() => handleOpenModal()} className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-md flex items-center">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Client
                </button>
            </div>

            <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-white">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="py-3 px-4 text-left">Name</th>
                                <th className="py-3 px-4 text-left">Email</th>
                                <th className="py-3 px-4 text-left">Phone</th>
                                <th className="py-3 px-4 text-left">RNC</th>
                                <th className="py-3 px-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="text-center py-4">Loading...</td></tr>
                            ) : clients.map((client) => (
                                <tr key={client.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="py-3 px-4">{client.nombre}</td>
                                    <td className="py-3 px-4">{client.email}</td>
                                    <td className="py-3 px-4">{client.telefono}</td>
                                    <td className="py-3 px-4">{client.rnc}</td>
                                    <td className="py-3 px-4 text-center">
                                        <button onClick={() => handleOpenModal(client)} className="text-primary-400 hover:text-primary-300 p-2"><PencilIcon className="h-5 w-5"/></button>
                                        <button onClick={() => handleDelete(client.id)} className="text-red-500 hover:text-red-400 p-2"><TrashIcon className="h-5 w-5"/></button>
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
                        <h2 className="text-2xl font-bold mb-4">{isEditing ? 'Edit Client' : 'Add Client'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-400 mb-1">Name</label>
                                <input type="text" name="nombre" value={currentClient?.nombre || ''} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2" required />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-400 mb-1">Email</label>
                                <input type="email" name="email" value={currentClient?.email || ''} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2" />
                            </div>
                             <div className="mb-4">
                                <label className="block text-gray-400 mb-1">Phone</label>
                                <input type="tel" name="telefono" value={currentClient?.telefono || ''} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2" />
                            </div>
                             <div className="mb-4">
                                <label className="block text-gray-400 mb-1">RNC</label>
                                <input type="text" name="rnc" value={currentClient?.rnc || ''} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2" />
                            </div>
                             <div className="mb-4">
                                <label className="block text-gray-400 mb-1">Address</label>
                                <input type="text" name="direccion" value={currentClient?.direccion || ''} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2" />
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

export default ClientsPage;
