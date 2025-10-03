import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';
import { Usuario } from '../types';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import UserModal from '../components/UserModal';
import Spinner from '../components/Spinner';

/*
  ============================================================================
  IMPORTANTE: Para que la creación de nuevos usuarios funcione,
  debes ejecutar el siguiente código SQL en tu editor de Supabase.
  Esta función se encarga de crear el usuario de forma segura en un
  único paso, manejando tanto la autenticación como el perfil.

  Ve a Supabase -> SQL Editor -> New query y pega lo siguiente:
  ============================================================================
  
  CREATE OR REPLACE FUNCTION public.admin_create_user(
      email_input text,
      password_input text,
      nombre_input text,
      rol_input text,
      empresa_id_input uuid
  )
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  -- Establecer search_path es una buena práctica de seguridad.
  SET search_path = public
  AS $$
  DECLARE
    new_user_id uuid;
  BEGIN
    -- 1. Crear el usuario en el sistema de autenticación de Supabase (auth.users).
    --    Usamos crypt() para hashear la contraseña. El usuario se crea ya confirmado.
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_user_meta_data
    ) values (
      auth.instance_id(), -- Usa la función correcta para el ID de instancia.
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      email_input,
      crypt(password_input, gen_salt('bf')), -- Encripta la contraseña
      now(), -- Confirma el email inmediatamente
      now(),
      now(),
      jsonb_build_object('nombre', nombre_input)
    ) RETURNING id INTO new_user_id;

    -- 2. Crear el perfil del usuario en la tabla 'public.usuarios'.
    INSERT INTO public.usuarios (id, empresa_id, nombre, email, rol)
    VALUES (new_user_id, empresa_id_input, nombre_input, email_input, rol_input);

  END;
  $$;

  COMMENT ON FUNCTION public.admin_create_user(text, text, text, text, uuid)
  IS 'Crea un nuevo usuario de autenticación y su perfil de usuario asociado. Diseñado para ser llamado por un administrador.';

*/

const UsersPage: React.FC = () => {
    const { profile } = useAuth();
    const [users, setUsers] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<Usuario | null>(null);

    const fetchUsers = useCallback(async () => {
        if (!profile?.empresa_id) return;

        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('usuarios')
                .select('*')
                .eq('empresa_id', profile.empresa_id)
                .order('nombre', { ascending: true });

            if (error) throw error;
            setUsers(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [profile?.empresa_id]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleOpenModal = (user: Usuario | null = null) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleSaveUser = () => {
        fetchUsers(); // Refetch users after save
        handleCloseModal();
    };

    const handleDeleteUser = async (userId: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción es irreversible.')) {
            // WARNING: This only deletes the user from the public 'usuarios' table.
            // The corresponding entry in 'auth.users' will remain (orphaned).
            // A proper implementation should use a server-side function (e.g., Supabase Edge Function)
            // to delete from both tables securely.
            setLoading(true);
            const { error } = await supabase.from('usuarios').delete().eq('id', userId);
            if (error) {
                setError(error.message);
                alert(`Error al eliminar usuario: ${error.message}`);
            } else {
                setUsers(users.filter(u => u.id !== userId)); // Optimistic update
            }
            setLoading(false);
        }
    };
    
    const displayRol = (rol: string | undefined) => {
        if (rol === 'admin') return 'Administrador';
        if (rol === 'empleado') return 'Empleado';
        return rol;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Gestión de Usuarios</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center px-4 py-2 bg-primary-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-primary-700 active:bg-primary-900 focus:outline-none focus:border-primary-900 focus:ring ring-primary-300 disabled:opacity-25 transition ease-in-out duration-150"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Nuevo Usuario
                </button>
            </div>
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                {loading && users.length === 0 ? (
                    <div className="flex justify-center items-center p-8">
                        <Spinner />
                    </div>
                ) : error ? (
                    <p className="text-red-500 p-6">{error}</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-900">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nombre</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rol</th>
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className="sr-only">Acciones</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-gray-800 divide-y divide-gray-700">
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{user.nombre}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 capitalize">{displayRol(user.rol)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                            <button onClick={() => handleOpenModal(user)} className="text-primary-400 hover:text-primary-300 inline-flex items-center">
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                            {profile?.id !== user.id && ( // Prevent self-deletion
                                                <button onClick={() => handleDeleteUser(user.id)} className="text-red-500 hover:text-red-400 inline-flex items-center">
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {users.length === 0 && !loading && (
                            <p className="text-center text-gray-400 py-8">No se encontraron usuarios.</p>
                        )}
                    </div>
                )}
            </div>
            {isModalOpen && (
                <UserModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveUser}
                    user={editingUser}
                />
            )}
        </div>
    );
};

export default UsersPage;