import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { db } from '@/services/mockDb';
import { api } from '@/services/api';
import { Plus, Trash2, Edit, Store, Box, Package, Check } from 'lucide-react';
import VariantEditor from '@/components/store/VariantEditor';
import { normalizeProducts } from '@/services/productMapper';

export const SellerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [shop, setShop] = useState<any | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');

  // new product form
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>('');
  const [thumbnail, setThumbnail] = useState('');

  const syncProductsForShop = (shopId?: string) => {
    if (!shopId) {
      setProducts([]);
      return;
    }

    const fallback = db.getProducts().filter((p: any) => p.shop?.shop_id === shopId || p.shop_id === shopId);
    const preferred = fallback.length > 0 ? fallback : [];

    setProducts(preferred);

    (async () => {
      try {
        const prods = await api.products.list({ shop_id: shopId });
        const normalized = normalizeProducts(prods || [], shop ? [shop] : []);
        const next = normalized.length > 0 ? normalized : preferred;
        setProducts(next);
      } catch {
        setProducts(preferred);
      }
    })();
  };

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      try {
        const res = await api.client.get(`/shops/owner/${user.user_id}`);
        const s = res.data || null;
        setShop(s);
        syncProductsForShop(s?.shop_id);
      } catch (err) {
        setShop(null);
        setProducts([]);
      }
    };
    fetch();
  }, [user]);

  const refresh = () => {
    if (!user) return;
    (async () => {
      try {
        const res = await api.client.get(`/shops/owner/${user.user_id}`);
        const s = res.data || null;
        setShop(s);
        syncProductsForShop(s?.shop_id);
      } catch (err) {
        setShop(null);
        setProducts([]);
      }
    })();
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop) return;
    if (!name || !price) return;

    (async () => {
      try {
        const created = await api.products.create({
          shop_id: shop.shop_id,
          brand_id: '',
          category_id: 'cat-1',
          product_name: name,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: '',
          thumbnail: thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
          status: 'ACTIVE',
          average_rating: 5,
          review_count: 0,
          sold_quantity: 0,
          // include a main variant and optional image to satisfy backend that expects nested data
          variants: [
            {
              sku: `${name}-SKU`,
              price: Number(price),
              original_price: Number(price),
              weight: 0,
              status: 'ACTIVE',
              attributeValues: [],
              inventory: { quantity: Number(stock) || 0 }
            }
          ],
          images: thumbnail ? [{ image_url: thumbnail, display_order: 1 }] : []
        } as any);

        setShowAdd(false);
        setName(''); setPrice(''); setStock(''); setThumbnail('');
        refresh();
      } catch (err: any) {
        // show server error to help debugging
        try {
          const msg = err?.response?.data || err?.message || String(err);
          // eslint-disable-next-line no-alert
          alert('Create product failed: ' + (typeof msg === 'string' ? msg : JSON.stringify(msg)));
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('Add product failed', err);
        }
      }
    })();
  };

  const handleDelete = (productId: string) => {
    if (!confirm('Delete this product?')) return;
    api.products.remove(productId).then(() => refresh()).catch(() => {});
  };

  // EDIT PRODUCT / INVENTORY
  const [editing, setEditing] = useState<any | null>(null);
  const [editPrice, setEditPrice] = useState<number | ''>('');
  const [editStock, setEditStock] = useState<number | ''>('');
  const [editName, setEditName] = useState('');

  const openEdit = (p: any) => {
    setEditing(p);
    setEditName(p.product_name);
    setEditPrice(p.variants?.[0]?.price === undefined ? '' : Number(p.variants[0].price));
    setEditStock(p.variants?.[0]?.inventory?.quantity ?? '');
  };

  const saveEdit = () => {
    if (!editing) return;

    const updatedPrice = editPrice === '' ? undefined : Number(editPrice);
    const updatedStock = editStock === '' ? undefined : Number(editStock);

    // Update product basic
    db.updateProduct(editing.product_id, { product_name: editName, thumbnail: editing.thumbnail });

    // Update main variant price
    const mainVar = editing.variants?.[0];
    if (mainVar) {
      if (updatedPrice !== undefined) {
        db.updateVariant(mainVar.variant_id, { price: updatedPrice });
        api.products.updateVariant(editing.product_id, mainVar.variant_id, { price: updatedPrice }).catch(() => {});
      }
      if (updatedStock !== undefined) {
        db.updateInventoryQuantity(mainVar.variant_id, updatedStock);
        api.products.updateInventory(editing.product_id, mainVar.variant_id, updatedStock).catch(() => {});
      }
    }

    setProducts(prev => prev.map((p: any) => {
      if (p.product_id !== editing.product_id) return p;
      const nextVariants = (p.variants || []).map((v: any) => {
        if (v.variant_id !== mainVar?.variant_id) return v;
        return {
          ...v,
          price: updatedPrice ?? v.price,
          inventory: {
            ...v.inventory,
            quantity: updatedStock ?? v.inventory?.quantity ?? 0,
          },
        };
      });
      return { ...p, variants: nextVariants };
    }));

    // record inventory change
    if (mainVar) {
      const prevInv = mainVar.inventory?.quantity || 0;
      const newInv = updatedStock ?? prevInv;
      const delta = newInv - prevInv;
      if (delta !== 0) db.recordInventoryChange(user?.user_id, mainVar.variant_id, delta, 'Manual update by seller');
    }
    setEditing(null);
    refresh();
  };

  // SELLER ORDERS
  const [orders, setOrders] = useState<any[]>([]);
  const loadOrders = () => {
    if (!shop) return;
    const o = db.getSellerOrders(shop.shop_id);
    setOrders(o);
  };

  useEffect(() => {
    if (activeTab === 'orders') loadOrders();
  }, [activeTab, shop]);

  const changeOrderStatus = (orderShopId: string, status: any) => {
    if (!confirm('Change order status to ' + status + '?')) return;
    db.updateSellerOrderStatus(orderShopId, status);
    loadOrders();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center border border-slate-100 dark:border-slate-800">
            <Store className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 dark:text-white">{shop ? shop.shop_name : 'No Shop Registered'}</h1>
            <p className="text-xs text-slate-400">Manage your products and orders here.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl bg-slate-50 dark:bg-slate-900 p-1">
            <button onClick={() => setActiveTab('products')} className={`px-3 py-2 rounded-lg text-xs font-bold ${activeTab === 'products' ? 'bg-primary text-white' : ''}`}>Products</button>
            <button onClick={() => setActiveTab('orders')} className={`px-3 py-2 rounded-lg text-xs font-bold ${activeTab === 'orders' ? 'bg-primary text-white' : ''}`}>Orders</button>
          </div>
          <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-primary text-white text-xs font-bold">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>
      {/* Main Content */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {products.length === 0 ? (
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-center text-sm text-slate-500">
              No products yet. Add your first product.
            </div>
          ) : (
            products.map(p => (
              <div key={p.product_id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <img src={p.thumbnail} alt={p.product_name} className="w-full h-40 object-cover" />
                <div className="p-4">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">{p.product_name}</h3>
                    <div className="text-xs text-slate-400">Stock: {p.variants?.[0]?.inventory?.quantity || 0}</div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-extrabold text-primary">₫{Number(p.variants?.[0]?.price || 0).toLocaleString('vi-VN')}</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(p)} className="p-2 rounded-lg border text-slate-700 text-xs">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => {
                          // open image modal
                          setEditing({ ...p, _viewImages: true });
                        }} className="p-2 rounded-lg border text-slate-700 text-xs">
                          <Box className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(p.product_id)} className="p-2 rounded-lg border text-rose-500 text-xs">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
              </div>
            ))
          )}
        </div>
      )}

        {/* Edit modal */}
        {editing && !editing._viewImages && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40" onClick={() => setEditing(null)} />
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold mb-4">Edit Product</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold">Name</label>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-3 py-2 rounded-xl border" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold">Price</label>
                    <input type="number" value={editPrice as any} onChange={(e) => setEditPrice(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border" />
                  </div>
                  <div>
                    <label className="text-xs font-bold">Stock</label>
                    <input type="number" value={editStock as any} onChange={(e) => setEditStock(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button onClick={() => setEditing(null)} className="py-2 px-4 rounded-xl border">Cancel</button>
                  <button onClick={saveEdit} className="py-2 px-4 rounded-xl bg-primary text-white">Save</button>
                </div>
                <div className="mt-4">
                  <h4 className="font-bold text-sm mb-2">Inventory History</h4>
                  <InventoryHistoryList variantId={editing.variants?.[0]?.variant_id} />
                </div>
                <div className="mt-4">
                  <h4 className="font-bold text-sm mb-2">Variant Editor</h4>
                  <VariantEditor product={editing} onUpdated={() => { refresh(); }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Images modal */}
        {editing && editing._viewImages && (
          <ImagesModal product={editing} onClose={() => { setEditing(null); refresh(); }} />
        )}

      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="p-6 bg-white dark:bg-slate-900 border rounded-2xl text-center text-sm text-slate-500">No orders yet.</div>
          ) : (
            orders.map(o => (
              <div key={o.order_shop_id} className="bg-white dark:bg-slate-900 border rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400">Order: <span className="font-bold text-slate-800 dark:text-white">{o.order_code}</span></div>
                    <div className="text-sm font-bold mt-1">{o.shop.shop_name}</div>
                  </div>
                  <div className="text-xs text-slate-500">{new Date(o.created_at).toLocaleString()}</div>
                </div>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="col-span-2">
                    {o.items.map((it: any) => (
                      <div key={it.order_item_id} className="flex items-center gap-3 py-2 border-b last:border-b-0">
                        <img src={it.product.thumbnail} className="w-12 h-12 object-cover rounded" />
                        <div>
                          <div className="font-bold text-sm">{it.product.product_name}</div>
                          <div className="text-xs text-slate-400">x{it.quantity} • ₫{it.price.toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-right flex flex-col gap-2">
                    <div className="text-sm font-bold">Status: {o.group_status}</div>
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => changeOrderStatus(o.order_shop_id, 'PACKING')} className="px-3 py-1 rounded bg-slate-100 text-xs">Packing</button>
                      <button onClick={() => changeOrderStatus(o.order_shop_id, 'SHIPPING')} className="px-3 py-1 rounded bg-primary text-white text-xs">Ship</button>
                      <button onClick={() => changeOrderStatus(o.order_shop_id, 'COMPLETED')} className="px-3 py-1 rounded bg-emerald-500 text-white text-xs">Complete</button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Product Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setShowAdd(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold mb-4">Add New Product</h3>
            <form onSubmit={handleAddProduct} className="space-y-3">
              <div>
                <label className="text-xs font-bold">Product Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 rounded-xl border" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold">Price</label>
                  <input type="number" value={price as any} onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border" />
                </div>
                <div>
                  <label className="text-xs font-bold">Stock</label>
                  <input type="number" value={stock as any} onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold">Thumbnail URL</label>
                <input value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} className="w-full px-3 py-2 rounded-xl border" />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowAdd(false)} className="py-2 px-4 rounded-xl border">Cancel</button>
                <button type="submit" className="py-2 px-4 rounded-xl bg-primary text-white">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SellerDashboard;

// InventoryHistoryList component
const InventoryHistoryList: React.FC<{ variantId?: string }> = ({ variantId }) => {
  const [list, setList] = useState<any[]>([]);
  useEffect(() => {
    if (!variantId) return;
    const h = db.getInventoryHistory(variantId);
    setList(h);
  }, [variantId]);

  if (!variantId) return <div className="text-xs text-slate-400">No variant selected.</div>;

  return (
    <div className="max-h-48 overflow-y-auto text-xs space-y-2">
      {list.length === 0 ? (
        <div className="text-xs text-slate-400">No inventory changes recorded.</div>
      ) : (
        list.map(l => (
          <div key={l.id} className="flex items-center justify-between">
            <div className="text-slate-600">{l.reason}</div>
            <div className={`text-xs font-bold ${l.delta > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{l.delta > 0 ? '+' : ''}{l.delta}</div>
          </div>
        ))
      )}
    </div>
  );
};

// ImagesModal component
const ImagesModal: React.FC<{ product: any; onClose: () => void }> = ({ product, onClose }) => {
  const [images, setImages] = useState<any[]>(product.images || []);
  const [newUrl, setNewUrl] = useState('');

  const refreshImages = () => {
    const imgs = db.get<any[]>("lumina_product_images").filter((i: any) => i.product_id === product.product_id).sort((a: any,b: any) => a.display_order - b.display_order);
    setImages(imgs);
  };

  useEffect(() => refreshImages(), []);

  const handleAdd = () => {
    if (!newUrl.trim()) return;
    db.addProductImage(product.product_id, newUrl.trim());
    setNewUrl('');
    refreshImages();
  };

  const handleRemove = (id: string) => {
    if (!confirm('Remove image?')) return;
    db.removeProductImage(id);
    refreshImages();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-bold mb-4">Manage Images</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {images.map(img => (
              <div key={img.image_id} className="relative">
                <img src={img.image_url} className="w-full h-24 object-cover rounded" />
                <button onClick={() => handleRemove(img.image_id)} className="absolute top-2 right-2 p-1 bg-rose-50 text-rose-500 rounded">Delete</button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="Image URL" className="flex-1 px-3 py-2 rounded-xl border text-xs" />
            <button onClick={handleAdd} className="py-2 px-4 rounded-xl bg-primary text-white text-xs">Add</button>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button onClick={onClose} className="py-2 px-4 rounded-xl border">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};
