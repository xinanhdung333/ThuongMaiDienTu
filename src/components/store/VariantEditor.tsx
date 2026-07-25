import React, { useState } from 'react';
import { db } from '@/services/mockDb';
import { api } from '@/services/api';
import { Plus, Trash2, Edit, Save } from 'lucide-react';

const VariantEditor: React.FC<{ product: any; onUpdated?: () => void }> = ({ product, onUpdated }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [local, setLocal] = useState<Record<string, any>>({});
  const [newMode, setNewMode] = useState(false);
  const [newFields, setNewFields] = useState({ sku: '', price: '', stock: '', attrs: '' });

  const variants = product?.variants || [];

  const startEdit = (v: any) => {
    setEditingId(v.variant_id);
    setLocal({ sku: v.sku, price: v.price, stock: v.inventory?.quantity || 0, attrs: (v.attributeValues || []).map((a:any)=>a.value_name).join(', ') });
  };

  const saveEdit = async (variantId: string) => {
    const v = local[variantId] || local;
    const patch: any = { sku: v.sku };
    if (v.price !== '' && v.price !== undefined) patch.price = Number(v.price);
    if (Object.keys(patch).length > 0) db.updateVariant(variantId, patch);
    await api.products.updateVariant(product.product_id, variantId, patch).catch(() => null);

    if (v.stock !== '' && v.stock !== undefined) {
      db.updateInventoryQuantity(variantId, Number(v.stock));
      await api.products.updateInventory(product.product_id, variantId, Number(v.stock)).catch(() => null);
    }

    const prev = variants.find((x:any)=>x.variant_id===variantId)?.inventory?.quantity || 0;
    const newQty = (v.stock === '' || v.stock === undefined) ? prev : Number(v.stock);
    const delta = newQty - prev;
    if (delta !== 0) db.recordInventoryChange(undefined, variantId, delta, 'Variant stock update');
    setEditingId(null);
    setLocal({});
    onUpdated?.();
  };

  const removeVariant = async (variantId: string) => {
    if (!confirm('Remove this variant?')) return;
    db.deleteVariant(variantId);
    await api.products.removeVariant(product.product_id, variantId).catch(() => null);
    onUpdated?.();
  };

  const addVariant = async () => {
    const sku = newFields.sku.trim() || `SKU-${Date.now()}`;
    const price = newFields.price === '' ? undefined : Number(newFields.price);
    const stock = newFields.stock === '' ? 0 : Number(newFields.stock) || 0;
    const attrs = newFields.attrs.split(',').map(s=>({ attribute_name: 'Option', value_name: s.trim(), value_id: '' }));
    db.addVariant(product.product_id, { sku, price: price ?? 0, original_price: price ?? 0, weight: 0, status: 'ACTIVE', attributeValues: attrs }, stock);
    await api.products.addVariant(product.product_id, {
      sku,
      price: price ?? 0,
      original_price: price ?? 0,
      weight: 0,
      status: 'ACTIVE',
      inventory: { quantity: stock },
    } as any).catch(() => null);
    setNewMode(false);
    setNewFields({ sku: '', price: '', stock: '', attrs: '' });
    onUpdated?.();
  };

  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold">Variants</div>
      <div className="space-y-2">
        {variants.map((v:any) => (
          <div key={v.variant_id} className="p-2 border rounded-lg grid grid-cols-6 gap-2 items-center">
            <div className="col-span-2 truncate">{v.attributeValues?.map((a:any)=>a.value_name).join(' • ') || 'Default'}</div>
            <div className="col-span-1 text-xs">SKU: {v.sku}</div>
            <div className="col-span-1 text-xs">Price: ₫{Number(v.price || 0).toLocaleString('vi-VN')}</div>
            <div className="col-span-1 text-xs">Stock: {v.inventory?.quantity || 0}</div>
            <div className="col-span-6 flex gap-2 mt-2">
              {editingId === v.variant_id ? (
                <>
                  <input className="px-2 py-1 rounded border text-xs" value={local.sku} onChange={(e)=>setLocal({...local, sku: e.target.value})} placeholder="SKU" />
                  <input className="px-2 py-1 rounded border text-xs" value={local.price} onChange={(e)=>setLocal({...local, price: e.target.value})} placeholder="Price" />
                  <input className="px-2 py-1 rounded border text-xs" value={local.stock} onChange={(e)=>setLocal({...local, stock: e.target.value})} placeholder="Stock" />
                  <button onClick={()=>saveEdit(v.variant_id)} className="ml-auto px-3 py-1 rounded bg-primary text-white text-xs"><Save className="inline-block w-3 h-3 mr-1"/>Save</button>
                </>
              ) : (
                <>
                  <button onClick={()=>startEdit(v)} className="px-3 py-1 rounded border text-xs"><Edit className="inline-block w-3 h-3 mr-1"/>Edit</button>
                  <button onClick={()=>removeVariant(v.variant_id)} className="px-3 py-1 rounded border text-xs text-rose-500"><Trash2 className="inline-block w-3 h-3 mr-1"/>Delete</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {newMode ? (
        <div className="p-3 border rounded-lg space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <input placeholder="SKU" className="px-2 py-1 rounded border text-xs" value={newFields.sku} onChange={(e)=>setNewFields({...newFields, sku: e.target.value})} />
            <input placeholder="Price" className="px-2 py-1 rounded border text-xs" value={newFields.price} onChange={(e)=>setNewFields({...newFields, price: e.target.value})} />
            <input placeholder="Stock" className="px-2 py-1 rounded border text-xs" value={newFields.stock} onChange={(e)=>setNewFields({...newFields, stock: e.target.value})} />
          </div>
          <input placeholder="Attributes (comma separated)" className="w-full px-2 py-1 rounded border text-xs" value={newFields.attrs} onChange={(e)=>setNewFields({...newFields, attrs: e.target.value})} />
          <div className="flex justify-end gap-2">
            <button onClick={()=>{setNewMode(false); setNewFields({ sku: '', price: '', stock: '', attrs: '' });}} className="px-3 py-1 rounded border text-xs">Cancel</button>
            <button onClick={addVariant} className="px-3 py-1 rounded bg-primary text-white text-xs">Add Variant</button>
          </div>
        </div>
      ) : (
        <div>
          <button onClick={()=>setNewMode(true)} className="px-3 py-1 rounded border text-xs inline-flex items-center gap-2"><Plus className="w-3 h-3"/> Add variant</button>
        </div>
      )}
    </div>
  );
};

export default VariantEditor;
