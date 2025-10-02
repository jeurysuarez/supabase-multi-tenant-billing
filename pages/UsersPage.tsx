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
            console.error('Error al obtener usuarios:', error);
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
            // Actualizar perfil de usuario en la tabla 'usuarios'
            const { error } = await supabase.from('usuarios')
                .update({ nombre: currentUser.nombre, rol: currentUser.rol })
                .eq('id', currentUser.id!);
            if(error) alert('Error al actualizar usuario: ' + error.message);
        } else {
            // Crear un nuevo usuario
            if(!currentUser.email || !currentUser.password) {
                alert('El correo y la contraseña son obligatorios para nuevos usuarios.');
                return;
            }
             // 1. Crear usuario en Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: currentUser.email,
                password: currentUser.password,
            });
            
            if (authError || !authData.user) {
                alert('Error al crear usuario en Auth: ' + authError?.message);
                return;
            }

            // 2. Insertar perfil en la tabla 'usuarios'
            const { error: profileError } = await supabase.from('usuarios').insert({
                id: authData.user.id,
                nombre: currentUser.nombre,
                rol: currentUser.rol,
                empresa_id: profile.empresa_id,
            });
            
            if (profileError) {
                alert('Usuario creado en Auth, pero falló al crear el perfil: ' + profileError.message);
                // Considera una lógica de limpieza aquí, p. ej., eliminar el usuario de auth
            }
        }
        fetchUsers();
        handleCloseModal();
    };


    const handleDelete = async (id: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.')) {
            // Se recomienda usar una Edge Function con privilegios de administrador para esto.
            // Llamar `deleteUser` desde el cliente no es una práctica estándar.
            alert("El borrado de usuarios debe manejarse a través de una función de backend segura por razones de seguridad.");
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Usuarios</h1>
                <button onClick={() => handleOpenModal()} className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-md flex items-center">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Añadir Usuario
                </button>
            </div>
            
            <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                <table className="min-w-full text-white">
                    <thead className="bg-gray-700">
                        <tr>
                            <th className="py-3 px-4 text-left">Nombre</th>
                            <th className="py-3 px-4 text-left">Rol</th>
                            <th className="py-3 px-4 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={3} className="text-center py-4">Cargando...</td></tr>
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
                        <h2 className="text-2xl font-bold mb-4">{isEditing ? 'Editar Usuario' : 'Añadir Usuario'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-400 mb-1">Nombre</label>
                                <input type="text" name="nombre" value={currentUser?.nombre || ''} onChange={handleChange} className="w-full bg-gray-700 rounded-md px-3 py-2" required />
                            </div>
                            {!isEditing && (
                                <>
                                <div className="mb-4">
                                    <label className="block text-gray-400 mb-1">Correo</label>
                                    <input type="email" name="email" value={currentUser?.email || ''} onChange={handleChange} className="w-full bg-gray-700 rounded-md px-3 py-2" required />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-400 mb-1">Contraseña</label>
                                    <input type="password" name="password" value={currentUser?.password || ''} onChange={handleChange} className="w-full bg-gray-700 rounded-md px-3 py-2" required />
                                </div>
                                </>
                            )}
                             <div className="mb-4">
                                <label className="block text-gray-400 mb-1">Rol</label>
                                <select name="rol" value={currentUser?.rol || ''} onChange={handleChange} className="w-full bg-gray-700 rounded-md px-3 py-2" required>
                                    <option value={UserRole.EMPLEADO}>Empleado</option>
                                    <option value={UserRole.ADMIN}>Administrador</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-gray-600 rounded-md">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-md">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersPage;