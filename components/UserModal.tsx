import React, { useState, useEffect, FormEvent } from 'react';
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

// Helper to translate Supabase errors into user-friendly messages
const getFriendlyErrorMessage = (error: any): string => {
  const message = error.message || 'Ocurrió un error inesperado.';
  if (message.includes('violates unique constraint "users_email_key"') || message.includes('duplicate key value violates unique constraint "users_email_key"')) {
    return "Este correo electrónico ya está registrado. Por favor, utiliza otro.";
  }
  if (message.includes('violates unique constraint "usuarios_email_key"')) {
    return "Este correo electrónico ya está en uso por otro perfil de usuario.";
  }
  if (message.includes('function public.admin_create_user does not exist')) {
    return "Error de configuración: La función para crear usuarios no se encuentra en la base de datos. Por favor, ejecuta el script SQL proporcionado por el soporte.";
  }
  if (message.includes('check constraint')) {
    return 'Uno de los campos tiene un valor no permitido (ej: rol inválido).';
  }
  return `Error: ${message}. Revisa la consola para más detalles.`;
};


const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, user }) => {
  const { profile } = useAuth();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState<UserRole>('empleado');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = user !== null;

  useEffect(() => {
    if (isOpen) {
        if (user) {
            setNombre(user.nombre || '');
            setEmail(user.email || '');
            setRol(user.rol || 'empleado');
            setPassword(''); // Clear password on open
        } else {
            // Reset form for new user
            setNombre('');
            setEmail('');
            setRol('empleado');
            setPassword('');
        }
        setError(null); // Clear error on open/user change
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditing && user) {
        // Update user profile in 'usuarios' table
        const { error: updateError } = await supabase
          .from('usuarios')
          .update({ nombre, rol })
          .eq('id', user.id);
        
        if (updateError) throw updateError;
        
      } else {
        // Create a new user.
        if (!password || password.length < 6) {
          throw new Error("La contraseña es obligatoria y debe tener al menos 6 caracteres.");
        }
        if (!profile?.empresa_id) {
          throw new Error("No se pudo determinar la empresa del administrador.");
        }

        const { error: rpcError } = await supabase.rpc('admin_create_user', {
            email_input: email,
            password_input: password,
            nombre_input: nombre,
            rol_input: rol,
            empresa_id_input: profile.empresa_id,
        });

        if (rpcError) throw rpcError;
      }
      onSave();
    } catch (err: any) {
      console.error("Error creating/updating user:", err);
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 transition-opacity"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 m-4 text-white transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && <p className="bg-red-900/50 text-red-300 p-3 rounded-md mb-4 text-sm whitespace-pre-wrap">{error}</p>}
          
          <div className="mb-4">
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-300 mb-1">Nombre Completo</label>
            <input
              type="text"
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isEditing}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {!isEditing && (
            <div className="mb-4">
              <label htmlFor="password"className="block text-sm font-medium text-gray-300 mb-1">Contraseña</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!isEditing}
                minLength={6}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="rol" className="block text-sm font-medium text-gray-300 mb-1">Rol</label>
            <select
              id="rol"
              value={rol}
              onChange={(e) => setRol(e.target.value as UserRole)}
              required
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="empleado">Empleado</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-700 transition duration-150 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 rounded-md hover:bg-primary-700 transition duration-150 disabled:opacity-50 flex items-center justify-center min-w-[100px]"
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