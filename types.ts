import { User } from '@supabase/supabase-js';

export enum UserRole {
  ADMIN = 'admin',
  EMPLEADO = 'empleado',
}

export interface Empresa {
  id: string;
  nombre: string;
  rnc?: string;
  direccion?: string;
  telefono?: string;
  created_at: string;
}

export interface Usuario {
  id: string;
  empresa_id: string;
  nombre: string;
  rol: UserRole;
  created_at: string;
  empresa?: Empresa;
}

export interface AppUser extends User {
  profile: Usuario;
}

export interface Cliente {
  id: string;
  empresa_id: string;
  nombre: string;
  rnc?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  created_at: string;
}

export interface Producto {
  id: string;
  empresa_id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  created_at: string;
}

export interface Factura {
  id: string;
  empresa_id: string;
  cliente_id: string;
  usuario_id: string;
  fecha: string;
  total: number;
  estado: 'pagada' | 'pendiente' | 'anulada';
  clientes: Cliente;
  usuarios: { nombre: string };
  detalle_factura: DetalleFactura[];
}

export interface DetalleFactura {
  id: string;
  factura_id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  productos: Producto;
}
