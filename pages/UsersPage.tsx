import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Usuario, UserRole } from '../types';
import { useAuth } from '../hooks/useAuth';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const UsersPage: React.FC = () => {
    const { profile } = useAuth();
    const [users, setUsers] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    type EditableUser = Partial<Usuario> & { email?: string; password?: string };
    const [currentUser, setCurrentUser] = useState<EditableUser | null>(null);

    const fetchUsers = useCallback(async () => {
        if (!profile) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('empresa_id', profile.empresa_id)
            .order('created_at', { ascending: false });
        if (error) {
            console.error('Error fetching users:', error);
        } else {
            setUsers(data as Usuario[]);
        }
        setLoading(false);
    }, [profile]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);
    
    const handleOpenModal = (user: EditableUser | null = null) => {
        if (user) {
            setIsEditing(true);
            setCurrentUser(user);
        } else {
            setIsEditing(false);
            setCurrentUser({ nombre: '', email: '', password: '', rol: UserRole.EMPLEADO });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentUser(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (currentUser) {
            setCurrentUser({ ...currentUser, [e.target.name]: e.target.value });
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !profile) return;

        if (isEditing) {
            // Update user profile in 'usuarios' table
            const { error } = await supabase.from('usuarios')
                .update({ nombre: currentUser.nombre, rol: currentUser.rol })
                .eq('id', currentUser.id!);
            if(error) alert('Error updating user: ' + error.message);
        } else {
            // Create a new user
            if(!currentUser.email || !currentUser.password) {
                alert('Email and password are required for new users.');
                return;
            }
             // 1. Create user in Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: currentUser.email,
                password: currentUser.password,
            });
            
            if (authError || !authData.user) {
                alert('Error creating user in Auth: ' + authError?.message);
                return;
            }

            // 2. Insert profile into 'usuarios' table
            const { error: profileError } = await supabase.from('usuarios').insert({
                id: authData.user.id,
                nombre: currentUser.nombre,
                rol: currentUser.rol,
                empresa_id: profile.empresa_id,
            });
            
            if (profileError) {
                alert('User created in Auth, but failed to create profile: ' + profileError.message);
                // Consider cleanup logic here, e.g., deleting the auth user
            }
        }
        fetchUsers();
        handleCloseModal();
    };


    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            // It's recommended to use an Edge Function with admin privileges for this.
            // Calling `deleteUser` from the client is not standard practice.
            alert("User deletion should be handled via a secure backend function for security reasons.");
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Users</h1>
                <button onClick={() => handleOpenModal()} className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-md flex items-center">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add User
                </button>
            </div>
            
            <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                <table className="min-w-full text-white">
                    <thead className="bg-gray-700">
                        <tr>
                            <th className="py-3 px-4 text-left">Name</th>
                            <th className="py-3 px-4 text-left">Role</th>
                            <th className="py-3 px-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={3} className="text-center py-4">Loading...</td></tr>
                        ) : users.map((user) => (
                            <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                <td className="py-3 px-4">{user.nombre}</td>
                                <td className="py-3 px-4 capitalize">{user.rol}</td>
                                <td className="py-3 px-4 text-center">
                                    <button onClick={() => handleOpenModal(user)} className="text-primary-400 hover:text-primary-300 p-2"><PencilIcon className="h-5 w-5"/></button>
                                    <button onClick={() => handleDelete(user.id)} className="text-red-500 hover:text-red-400 p-2"><TrashIcon className="h-5 w-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">{isEditing ? 'Edit User' : 'Add User'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-400 mb-1">Name</label>
                                <input type="text" name="nombre" value={currentUser?.nombre || ''} onChange={handleChange} className="w-full bg-gray-700 rounded-md px-3 py-2" required />
                            </div>
                            {!isEditing && (
                                <>
                                <div className="mb-4">
                                    <label className="block text-gray-400 mb-1">Email</label>
                                    <input type="email" name="email" value={currentUser?.email || ''} onChange={handleChange} className="w-full bg-gray-700 rounded-md px-3 py-2" required />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-400 mb-1">Password</label>
                                    <input type="password" name="password" value={currentUser?.password || ''} onChange={handleChange} className="w-full bg-gray-700 rounded-md px-3 py-2" required />
                                </div>
                                </>
                            )}
                             <div className="mb-4">
                                <label className="block text-gray-400 mb-1">Role</label>
                                <select name="rol" value={currentUser?.rol || ''} onChange={handleChange} className="w-full bg-gray-700 rounded-md px-3 py-2" required>
                                    <option value={UserRole.EMPLEADO}>Employee</option>
                                    <option value={UserRole.ADMIN}>Admin</option>
                                </select>
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

export default UsersPage;
