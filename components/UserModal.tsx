import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';
import { Usuario, UserRole } from '../types';
import Spinner from './Spinner';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    user: Usuario | null;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, user }) => {
    const { profile } = useAuth();
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rol, setRol] = useState<UserRole>('empleado');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEditing = !!user;

    useEffect(() => {
        if (user) {
            setNombre(user.nombre);
            setEmail(user.email);
            setRol(user.rol);
        } else {
            // Reset form for new user
            setNombre('');
            setEmail('');
            setPassword('');
            setRol('empleado');
        }
        // Clear error when modal is opened or user changes
        setError(null);
    }, [user, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (isEditing) {
            // Update user logic
            const { error: updateError } = await supabase
                .from('usuarios')
                .update({ nombre, rol })
                .eq('id', user.id);
            
            if (updateError) {
                setError(updateError.message);
            } else {
                onSave();
            }

        } else {
            // Create user logic
            if (!profile?.empresa_id) {
                setError("No se puede crear un usuario sin una empresa asociada.");
                setLoading(false);
                return;
            }

            // Step 1: Create the user in auth.users
            // We assume email verification is enabled, so this won't log the admin out.
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (authError) {
                setError(authError.message);
            } else if (authData.user) {
                // Step 2: Create the user profile in the public.usuarios table
                // WARNING: If this step fails, an orphaned user will be left in auth.users.
                // A robust solution would use an Edge Function to perform these steps atomically.
                const { error: profileError } = await supabase.from('usuarios').insert({
                    id: authData.user.id,
                    nombre,
                    email,
                    rol,
                    empresa_id: profile.empresa_id,
                });

                if (profileError) {
                    setError(profileError.message);
                    // Here you would ideally delete the orphaned auth user,
                    // but that requires admin privileges not available on the client.
                    // e.g., await supabase.auth.admin.deleteUser(authData.user.id)
                } else {
                    onSave();
                }
            } else {
                 setError("No se pudo crear el usuario. El objeto de usuario no fue devuelto.");
            }
        }
        setLoading(false);
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-white mb-4">{isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
                        
                        {error && <p className="bg-red-900 text-red-200 p-3 rounded-md mb-4 text-sm">{error}</p>}

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="nombre" className="block text-sm font-medium text-gray-300">Nombre</label>
                                <input
                                    id="nombre"
                                    type="text"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    required
                                    className="mt-1 block w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isEditing}
                                    className="mt-1 block w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                            {!isEditing && (
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-300">Contraseña</label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        className="mt-1 block w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                        placeholder="Mínimo 6 caracteres"
                                    />
                                </div>
                            )}
                            <div>
                                <label htmlFor="rol" className="block text-sm font-medium text-gray-300">Rol</label>
                                <select
                                    id="rol"
                                    value={rol}
                                    onChange={(e) => setRol(e.target.value as UserRole)}
                                    required
                                    className="mt-1 block w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                >
                                    <option value="empleado">Empleado</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 px-6 py-4 flex justify-end items-center space-x-3 rounded-b-lg">
                         <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-500 focus:outline-none focus:border-gray-700 focus:ring ring-gray-300 disabled:opacity-50 transition ease-in-out duration-150"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex justify-center items-center px-4 py-2 bg-primary-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-primary-700 active:bg-primary-900 focus:outline-none focus:border-primary-900 focus:ring ring-primary-300 disabled:opacity-50 transition ease-in-out duration-150"
                        >
                            {loading ? <Spinner /> : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserModal;
