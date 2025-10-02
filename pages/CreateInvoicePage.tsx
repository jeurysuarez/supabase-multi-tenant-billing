import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabase';
import { Cliente, Producto } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { TrashIcon } from '@heroicons/react/24/outline';

interface InvoiceItem {
    producto_id: string;
    nombre: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
    stock: number;
}

const CreateInvoicePage: React.FC = () => {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const [clients, setClients] = useState<Cliente[]>([]);
    const [products, setProducts] = useState<Producto[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!profile) return;
            const { data: clientData } = await supabase.from('clientes').select('*').eq('empresa_id', profile.empresa_id);
            const { data: productData } = await supabase.from('productos').select('*').eq('empresa_id', profile.empresa_id).gt('stock', 0);
            setClients(clientData || []);
            setProducts(productData || []);
        };
        fetchData();
    }, [profile]);

    const handleAddProduct = (productId: string) => {
        if (!productId || invoiceItems.some(item => item.producto_id === productId)) return;
        const product = products.find(p => p.id === productId);
        if (product) {
            const newItem: InvoiceItem = {
                producto_id: product.id,
                nombre: product.nombre,
                cantidad: 1,
                precio_unitario: product.precio,
                subtotal: product.precio,
                stock: product.stock,
            };
            setInvoiceItems([...invoiceItems, newItem]);
        }
    };

    const handleQuantityChange = (productId: string, quantity: number) => {
        setInvoiceItems(invoiceItems.map(item => {
            if (item.producto_id === productId) {
                const newQuantity = Math.max(1, Math.min(quantity, item.stock));
                return { ...item, cantidad: newQuantity, subtotal: item.precio_unitario * newQuantity };
            }
            return item;
        }));
    };

    const handleRemoveItem = (productId: string) => {
        setInvoiceItems(invoiceItems.filter(item => item.producto_id !== productId));
    };

    const total = useMemo(() => {
        return invoiceItems.reduce((acc, item) => acc + item.subtotal, 0);
    }, [invoiceItems]);

    const handleSaveInvoice = async () => {
        if (!selectedClientId || invoiceItems.length === 0 || !profile) {
            alert('Please select a client and add at least one product.');
            return;
        }
        setLoading(true);

        // 1. Create the invoice
        const { data: facturaData, error: facturaError } = await supabase
            .from('facturas')
            .insert({
                empresa_id: profile.empresa_id,
                cliente_id: selectedClientId,
                usuario_id: profile.id,
                fecha: new Date().toISOString(),
                total: total,
                estado: 'pendiente'
            })
            .select()
            .single();

        if (facturaError || !facturaData) {
            alert('Error creating invoice: ' + facturaError?.message);
            setLoading(false);
            return;
        }

        // 2. Add invoice details
        const detalleFactura = invoiceItems.map(item => ({
            factura_id: facturaData.id,
            producto_id: item.producto_id,
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario,
            subtotal: item.subtotal
        }));
        
        const { error: detalleError } = await supabase.from('detalle_factura').insert(detalleFactura);

        if (detalleError) {
            alert('Error adding invoice details: ' + detalleError.message);
            // Consider rolling back the invoice creation
            setLoading(false);
            return;
        }

        // 3. Update product stock
        // This should ideally be a single transaction or an RPC call for atomicity
        const stockUpdates = invoiceItems.map(item => 
            supabase.rpc('update_stock', {
                product_id: item.producto_id,
                quantity_sold: item.cantidad
            })
        );
        
        await Promise.all(stockUpdates);
        /*
        Example SQL for update_stock RPC function:
        CREATE OR REPLACE FUNCTION update_stock(product_id uuid, quantity_sold int)
        RETURNS void AS $$
        BEGIN
            UPDATE public.productos
            SET stock = stock - quantity_sold
            WHERE id = product_id;
        END;
        $$ LANGUAGE plpgsql;
        */

        setLoading(false);
        alert('Invoice created successfully!');
        navigate('/invoices');
    };


    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-6">Create New Invoice</h1>
            
            <div className="bg-gray-800 p-6 rounded-lg mb-6">
                <label htmlFor="client-select" className="block text-sm font-medium text-gray-400 mb-2">Select a Client</label>
                <select 
                    id="client-select"
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2"
                >
                    <option value="" disabled>-- Choose a client --</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg mb-6">
                <h2 className="text-xl font-semibold mb-4">Invoice Items</h2>
                <div className="mb-4">
                    <select
                        onChange={(e) => handleAddProduct(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2"
                        value=""
                    >
                        <option value="" disabled>-- Add a product --</option>
                        {products.filter(p => !invoiceItems.some(i => i.producto_id === p.id)).map(p => (
                            <option key={p.id} value={p.id}>{p.nombre} (${p.precio}) - Stock: {p.stock}</option>
                        ))}
                    </select>
                </div>
                
                <div className="space-y-3">
                    {invoiceItems.map(item => (
                        <div key={item.producto_id} className="flex items-center justify-between bg-gray-700 p-3 rounded-md">
                           <div className="flex-1">
                                <p className="font-semibold">{item.nombre}</p>
                                <p className="text-sm text-gray-400">${item.precio_unitario.toFixed(2)}</p>
                           </div>
                           <div className="w-24">
                               <input 
                                   type="number"
                                   value={item.cantidad}
                                   onChange={e => handleQuantityChange(item.producto_id, parseInt(e.target.value))}
                                   min="1"
                                   max={item.stock}
                                   className="w-full bg-gray-600 rounded-md px-2 py-1 text-center"
                                />
                           </div>
                           <p className="w-28 text-right font-semibold">${item.subtotal.toFixed(2)}</p>
                           <button onClick={() => handleRemoveItem(item.producto_id)} className="ml-4 text-red-500 hover:text-red-400 p-1">
                                <TrashIcon className="h-5 w-5"/>
                           </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg flex justify-between items-center">
                <div>
                    <p className="text-lg text-gray-400">Total</p>
                    <p className="text-4xl font-bold">${total.toFixed(2)}</p>
                </div>
                <button 
                    onClick={handleSaveInvoice}
                    disabled={loading}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-md disabled:bg-primary-800"
                >
                    {loading ? 'Saving...' : 'Save Invoice'}
                </button>
            </div>
        </div>
    );
};

export default CreateInvoicePage;
