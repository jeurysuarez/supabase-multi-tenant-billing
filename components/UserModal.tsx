
import React, { useState, useEffect, FormEvent } from 'react';
import { supabase } from '../services/supabase';
import { Usuario, UserRole } from '../types';
import { useAuth } from '../hooks/useAuth';
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
        // Reset state on user or isOpen change
        if (isOpen) {
            if (user) {
                setNombre(user.nombre);
                setEmail(user.email);
                setRol(user.rol);
                setPassword(''); // Clear password field for editing
            } else {
                // Reset form for new user
                setNombre('');
                setEmail('');
                setPassword('');
                setRol('empleado');
            }
            setError(null); // Clear previous errors when modal opens
        }
    }, [user, isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!profile?.empresa_id) {
            setError("No se pudo identificar la empresa del administrador.");
            setLoading(false);
            return;
        }

        try {
            if (isEditing && user) {
                // In a real application, you might want to allow updating more fields.
                // For simplicity, we only update name and role here.
                // Email is the identifier and should not be changed.
                // Password changes should have a dedicated, secure flow.
                const { error: updateError } = await supabase
                    .from('usuarios')
                    .update({
                        nombre,
                        rol,
                    })
                    .eq('id', user.id);
                
                if (updateError) throw updateError;

            } else {
                // Create new user in Supabase Auth.
                // This will typically send a confirmation email.
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        // We can pass additional data to be used in a trigger
                        // to populate the public users table automatically.
                        // This is a more robust approach.
                        data: {
                            nombre: nombre,
                            rol: rol,
                            empresa_id: profile.empresa_id
                        }
                    }
                });
                
                if (authError) throw authError;

                // If you don't use a trigger, you would insert into the public table here.
                // However, this can be racy if email confirmation is on.
                // The trigger approach is better. For this example, we assume no trigger
                // and add a record to the usuarios table.
                if (!authData.user) throw new Error("No se pudo crear el usuario.");

                const { error: profileError } = await supabase.from('usuarios').insert({
                    id: authData.user.id,
                    nombre,
                    email,
                    rol,
                    empresa_id: profile.empresa_id,
                });
                
                if (profileError) {
                    // This is a problematic state: an auth user exists without a profile.
                    // This requires manual cleanup or a backend function.
                    // We'll notify the admin.
                    console.error("Auth user created, but profile creation failed:", profileError);
                    throw new Error(`Se creó el usuario de autenticación, pero no su perfil: ${profileError.message}. Contacte a soporte.`);
                }
            }
            onSave();
        } catch (err: any) {
            setError(err.message || "Ocurrió un error inesperado.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
            // `onMouseDown` is used to prevent closing when clicking inside the modal content
            onMouseDown={onClose}
        >
            <div 
                className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4"
                onMouseDown={e => e.stopPropagation()}
            >
                <h3 className="text-xl font-semibold text-white mb-4">
                    {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h3>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="nombre">
                            Nombre Completo
                        </label>
                        <input
                            id="nombre"
                            className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700 border-gray-600 text-white leading-tight focus:outline-none focus:shadow-outline"
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="email">
                            Correo Electrónico
                        </label>
                        <input
                            id="email"
                            className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700 border-gray-600 text-white leading-tight focus:outline-none focus:shadow-outline"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isEditing} // Cannot change email
                        />
                    </div>
                    {!isEditing && (
                        <div className="mb-4">
                            <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="password">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700 border-gray-600 text-white mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                type="password"
                                placeholder="******************"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required={!isEditing}
                            />
                        </div>
                    )}
                    <div className="mb-6">
                        <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="rol">
                            Rol
                        </label>
                        <select
                            id="rol"
                            className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700 border-gray-600 text-white leading-tight focus:outline-none focus:shadow-outline"
                            value={rol}
                            onChange={(e) => setRol(e.target.value as UserRole)}
                        >
                            <option value="empleado">Empleado</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>

                    {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
                    
                    <div className="flex items-center justify-end space-x-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-28 flex items-center justify-center disabled:bg-primary-800"
                        >
                           {loading ? <Spinner /> : isEditing ? 'Guardar' : 'Crear'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserModal;
