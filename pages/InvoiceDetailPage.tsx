import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Factura } from '../types';

const InvoiceDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [invoice, setInvoice] = useState<Factura | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchInvoice = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('facturas')
            .select('*, clientes(*), usuarios(nombre), detalle_factura(*, productos(*))')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error al obtener detalles de la factura:', error);
        } else {
            setInvoice(data as unknown as Factura);
        }
        setLoading(false);
    }, [id]);

    useEffect(() => {
        fetchInvoice();
    }, [fetchInvoice]);
    
    const getStatusChip = (status: string) => {
        switch (status) {
            case 'pagada':
                return <span className="px-3 py-1 text-sm font-semibold text-green-800 bg-green-200 rounded-full">Pagada</span>;
            case 'pendiente':
                return <span className="px-3 py-1 text-sm font-semibold text-yellow-800 bg-yellow-200 rounded-full">Pendiente</span>;
            case 'anulada':
                return <span className="px-3 py-1 text-sm font-semibold text-red-800 bg-red-200 rounded-full">Anulada</span>;
            default:
                return <span className="px-3 py-1 text-sm font-semibold text-gray-800 bg-gray-200 rounded-full">Desconocido</span>;
        }
    };

    if (loading) {
        return <div className="text-center p-10">Cargando detalles de la factura...</div>;
    }

    if (!invoice) {
        return <div className="text-center p-10">Factura no encontrada.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-white">Factura</h1>
                    <p className="text-gray-400 font-mono">ID: {invoice.id}</p>
                </div>
                {getStatusChip(invoice.estado)}
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8 text-gray-300">
                <div>
                    <h2 className="text-lg font-semibold text-gray-400 mb-2">Facturado a</h2>
                    <p className="font-bold text-white text-xl">{invoice.clientes.nombre}</p>
                    <p>{invoice.clientes.direccion}</p>
                    <p>{invoice.clientes.email}</p>
                    <p>{invoice.clientes.telefono}</p>
                </div>
                <div className="text-right">
                     <h2 className="text-lg font-semibold text-gray-400 mb-2">Detalles de la Factura</h2>
                     <p><span className="font-semibold">Fecha:</span> {new Date(invoice.fecha).toLocaleDateString()}</p>
                     <p><span className="font-semibold">Creado por:</span> {invoice.usuarios.nombre}</p>
                </div>
            </div>

            <div>
                <table className="min-w-full text-white">
                    <thead className="bg-gray-700">
                        <tr>
                            <th className="py-3 px-4 text-left">Artículo</th>
                            <th className="py-3 px-4 text-center">Cantidad</th>
                            <th className="py-3 px-4 text-right">Precio Unitario</th>
                            <th className="py-3 px-4 text-right">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800">
                        {invoice.detalle_factura.map((item) => (
                            <tr key={item.id} className="border-b border-gray-700">
                                <td className="py-4 px-4">{item.productos.nombre}</td>
                                <td className="py-4 px-4 text-center">{item.cantidad}</td>
                                <td className="py-4 px-4 text-right">${item.precio_unitario.toFixed(2)}</td>
                                <td className="py-4 px-4 text-right">${item.subtotal.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-700">
                        <tr>
                           <td colSpan={3} className="py-4 px-4 text-right font-bold text-lg">Total</td>
                           <td className="py-4 px-4 text-right font-bold text-lg">${invoice.total.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default InvoiceDetailPage;