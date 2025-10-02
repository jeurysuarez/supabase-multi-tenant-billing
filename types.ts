
export type UserRole = 'admin' | 'empleado';

export interface Empresa {
  id: string;
  nombre: string;
}

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  empresa_id: string;
  empresa: Empresa;
}

export interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: string;
  empresa_id: string;
  created_at: string;
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  empresa_id: string;
  created_at: string;
}

export interface DetalleFactura {
  id?: string;
  factura_id?: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  producto?: Producto;
}

export interface Factura {
  id: string;
  cliente_id: string;
  empresa_id: string;
  fecha_emision: string;
  fecha_vencimiento: string;
  subtotal: number;
  iva: number;
  total: number;
  estado: 'borrador' | 'emitida' | 'pagada' | 'anulada';
  created_at: string;
  cliente?: Cliente;
  detalles: DetalleFactura[];
  usuario_id: string;
  usuario?: Usuario;
}
