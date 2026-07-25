import React, { useState } from 'react';
import { api } from '@/services/api';
import { db } from '@/services/mockDb';
import { useAuthStore } from '@/store/authStore';

const ImportMockData: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const { user } = useAuthStore();

  const push = (s: string) => setLogs(l => [...l, s]);

  const runImport = async () => {
    if (!user) {
      push('Please login as admin to run import.');
      return;
    }
    setRunning(true);
    setLogs([]);

    try {
      // Users
      const users = db.get<any[]>('lumina_users') || [];
      const userMap: Record<string,string> = {};
      push(`Found ${users.length} users`);
      for (const u of users) {
        try {
          const password = u.email.includes('@') ? 'password123' : 'password123';
          const created = await api.auth.register({ full_name: u.full_name, email: u.email, phone: u.phone, password_hash: password } as any);
          userMap[u.user_id] = created.user_id;
          push(`Created user ${u.email} -> ${created.user_id}`);
          // assign extra roles
          const roles = u.roles || [];
          for (const r of roles) {
            if (r !== 'Customer') {
              await api.users.assignRole(created.user_id, r);
              push(`  Assigned role ${r}`);
            }
          }
        } catch (err: any) {
          push(`Failed create user ${u.email}: ${err?.message || String(err)}`);
        }
      }

      // Addresses
      const addresses = db.get<any[]>('lumina_addresses') || [];
      push(`Found ${addresses.length} addresses`);
      for (const a of addresses) {
        const mappedUser = userMap[a.user_id];
        if (!mappedUser) { push(`  Skip address for unknown user ${a.user_id}`); continue; }
        try {
          await api.users.addAddress(mappedUser, {
            receiver_name: a.receiver_name,
            phone: a.phone,
            province: a.province,
            district: a.district,
            ward: a.ward,
            detail_address: a.detail_address,
            is_default: a.is_default
          } as any);
          push(`  Added address for ${mappedUser}`);
        } catch (err: any) { push(`  Addr error: ${String(err)}`); }
      }

      // Shops
      const shops = db.get<any[]>('lumina_shops') || [];
      const shopMap: Record<string,string> = {};
      push(`Found ${shops.length} shops`);
      for (const s of shops) {
        const owner = userMap[s.owner_id] || s.owner_id;
        try {
          const created = await api.shops.create({ owner_id: owner, shop_name: s.shop_name, logo: s.logo, description: s.description, rating: s.rating, total_followers: s.total_followers, status: s.status } as any);
          shopMap[s.shop_id] = created.shop_id;
          push(`Created shop ${s.shop_name} -> ${created.shop_id}`);
        } catch (err: any) { push(`  Shop error: ${String(err)}`); }
      }

      // Products
      const products = db.get<any[]>('lumina_products') || [];
      const prodMap: Record<string,string> = {};
      push(`Found ${products.length} products`);
      for (const p of products) {
        const mappedShop = shopMap[p.shop_id] || p.shop_id;
        try {
          const created = await api.products.create({
            shop_id: mappedShop,
            brand_id: p.brand_id,
            category_id: p.category_id,
            product_name: p.product_name,
            slug: p.slug,
            description: p.description,
            thumbnail: p.thumbnail,
            status: p.status,
            average_rating: p.average_rating,
            review_count: p.review_count,
            sold_quantity: p.sold_quantity
          } as any);
          prodMap[p.product_id] = created.product_id;
          push(`  Created product ${p.product_name} -> ${created.product_id}`);
        } catch (err: any) { push(`  Product error: ${String(err)}`); }
      }

      // Images
      const images = db.get<any[]>('lumina_product_images') || [];
      push(`Found ${images.length} product images`);
      for (const img of images) {
        const mappedProd = prodMap[img.product_id] || img.product_id;
        try {
          await api.products.addImage(mappedProd, img.image_url);
          push(`  Added image to ${mappedProd}`);
        } catch (err: any) { push(`  Img error: ${String(err)}`); }
      }

      // Variants
      const variants = db.get<any[]>('lumina_variants') || [];
      const varMap: Record<string,string> = {};
      push(`Found ${variants.length} variants`);
      for (const v of variants) {
        const mappedProd = prodMap[v.product_id] || v.product_id;
        try {
          const created = await api.products.addVariant(mappedProd, {
            sku: v.sku,
            price: v.price,
            original_price: v.original_price,
            weight: v.weight,
            status: v.status,
            attributeValues: v.attributeValues
          } as any);
          varMap[v.variant_id] = created.variant_id || '';
          push(`  Created variant ${v.sku}`);
        } catch (err: any) { push(`  Var error: ${String(err)}`); }
      }

      // Vouchers
      const vouchers = db.get<any[]>('lumina_vouchers') || [];
      push(`Found ${vouchers.length} vouchers`);
      for (const v of vouchers) {
        const mappedShop = shopMap[v.shop_id] || v.shop_id;
        try {
          await api.vouchers.create({ ...v, shop_id: mappedShop } as any);
          push(`  Created voucher ${v.voucher_code}`);
        } catch (err: any) { push(`  Vch error: ${String(err)}`); }
      }

      // Reviews
      const reviews = db.get<any[]>('lumina_reviews') || [];
      push(`Found ${reviews.length} reviews`);
      for (const r of reviews) {
        const mappedProd = prodMap[r.product_id] || r.product_id;
        const mappedUser = userMap[r.user_id] || r.user_id;
        try {
          await api.reviews.create({ user_id: mappedUser, product_id: mappedProd, rating: r.rating, comment: r.comment, status: r.status } as any);
          push(`  Created review by ${mappedUser}`);
        } catch (err: any) { push(`  Rev error: ${String(err)}`); }
      }

      push('Import finished');
    } catch (err: any) {
      push(`Fatal: ${String(err)}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Import Mock Data → API</h2>
      <p className="text-sm text-slate-500 mb-4">This tool reads the browser's `mockDb` localStorage and pushes data to the backend API. You must be logged in as admin.</p>
      <button onClick={runImport} disabled={running} className="px-4 py-2 bg-primary text-white rounded mb-4">{running ? 'Running…' : 'Run Import'}</button>
      <div className="whitespace-pre-wrap bg-slate-50 p-3 rounded max-h-80 overflow-y-auto text-xs">
        {logs.map((l,i) => <div key={i}>{l}</div>)}
      </div>
    </div>
  );
};

export default ImportMockData;
