
import React, { useState, useEffect, FormEvent } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';
import { Usuario, UserRole } from '../types';

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
  const [rol, setRol] = useState<UserRole>('empleado');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isEditing = !!user;

  useEffect(() => {
    if (isOpen) {
      if (user) {
        setNombre(user.nombre);
        setEmail(user.email);
        setRol(user.rol);
      } else {
        setNombre('');
        setEmail('');
        setRol('empleado');
        setPassword('');
      }
      setError(null);
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!profile?.empresa_id) {
        setError("No se pudo identificar la empresa del usuario actual.");
        setLoading(false);
        return;
    }

    if (!isEditing && password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres.");
        setLoading(false);
        return;
    }

    try {
      if (isEditing && user) {
        // Edit existing user's profile data
        const { error: updateError } = await supabase
          .from('usuarios')
          .update({ nombre, rol })
          .eq('id', user.id);

        if (updateError) throw updateError;
        // NOTE: Updating email requires special handling (e.g., supabase.auth.updateUser)
        // and changing passwords should be a separate, secure flow.
        // This simplified example only updates the 'nombre' and 'rol' fields.
      } else {
        // Create new user
        // SECURITY: Creating users should be handled by a secure server-side environment.
        // The following code assumes you have a Supabase Edge Function named 'create-user'
        // that handles creating the user in 'auth.users' and then inserting their
        // profile into 'public.usuarios'.
        const { data, error: functionError } = await supabase.functions.invoke('create-user', {
          body: {
            email,
            password,
            nombre,
            rol,
            empresa_id: profile.empresa_id,
          },
        });

        if (functionError) throw functionError;
        if (data?.error) {
            // Check for specific Supabase Auth error for duplicate user
            if (data.error.message?.includes('User already registered')) {
                throw new Error('Ya existe un usuario con este correo electrónico.');
            }
            throw new Error(data.error.message || 'Error desconocido desde la función.');
        }
      }
      onSave(); // This will trigger a re-fetch in the parent and close the modal
    } catch (err: any) {
      console.error("Error al guardar el usuario:", err);
      setError(err.message || 'Ocurrió un error al guardar el usuario.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex justify-center items-center p-4 transition-opacity">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md transform transition-all" role="dialog" aria-modal="true">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              {isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
            </h2>
            {error && <p className="bg-red-900/50 text-red-300 text-sm p-3 rounded-md mb-4">{error}</p>}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-300">Nombre Completo</label>
                <input 
                  type="text" 
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">Correo Electrónico</label>
                <input 
                  type="email" 
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:bg-gray-600 disabled:text-gray-400"
                  required
                  disabled={isEditing}
                />
                 {isEditing && <p className="mt-1 text-xs text-gray-500">El correo electrónico no se puede cambiar.</p>}
              </div>
              {!isEditing && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300">Contraseña</label>
                  <input 
                    type="password" 
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    required
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                  />
                </div>
              )}
              <div>
                <label htmlFor="rol" className="block text-sm font-medium text-gray-300">Rol</label>
                <select
                  id="rol"
                  value={rol}
                  onChange={(e) => setRol(e.target.value as UserRole)}
                  className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="empleado">Empleado</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900/50 px-6 py-4 flex justify-end items-center space-x-3 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-500 focus:outline-none focus:border-gray-700 focus:ring ring-gray-300 disabled:opacity-25 transition ease-in-out duration-150"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex justify-center items-center px-4 py-2 bg-primary-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-primary-700 active:bg-primary-900 focus:outline-none focus:border-primary-900 focus:ring ring-primary-300 disabled:opacity-50 transition ease-in-out duration-150"
              disabled={loading}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (isEditing ? 'Guardar Cambios' : 'Crear Usuario')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
