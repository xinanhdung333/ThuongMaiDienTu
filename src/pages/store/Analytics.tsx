import React, { useEffect, useState, useRef } from 'react';
import { db } from '@/services/mockDb';
import { useAuthStore } from '@/store/authStore';
import ProductCard from '@/components/product/ProductCard';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const SellerAnalytics: React.FC = () => {
  const { user } = useAuthStore();
  const [shop, setShop] = useState<any | null>(null);
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [series, setSeries] = useState<{ date: string; revenue: number; orders: number }[]>([]);
  const [showRevenue, setShowRevenue] = useState(true);
  const [showOrders, setShowOrders] = useState(true);
  const revenueChartRef = useRef<any>(null);
  const ordersChartRef = useRef<any>(null);

  useEffect(() => {
    if (!user) return;
    const s = db.getShopByOwner(user.user_id);
    setShop(s);
    if (s) {
      const a = db.getSellerAnalytics(s.shop_id);
      setAnalytics(a);
      const ts = db.getSellerTimeSeries(s.shop_id, 14);
      setSeries(ts);
    }
  }, [user]);

  if (!user) return <div className="p-8 text-center">Please login to view analytics.</div>;
  if (!shop) return <div className="p-8 text-center">You do not have a shop yet.</div>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-extrabold">Shop Analytics</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (!analytics || !shop) return;
              // build CSV
              let csv = 'Metric,Value\n';
              csv += `Revenue,${analytics.revenue}\n`;
              csv += `Orders,${analytics.ordersCount}\n`;
              csv += `Products Sold,${analytics.productsSold}\n`;
              csv += `Views,${analytics.totalViews}\n`;
              csv += `Conversion,${analytics.conversion}\n`;
              if (analytics.refunds !== undefined) csv += `Refunds,${analytics.refunds}\n`;
              csv += '\nTop Products\n';
              csv += 'product_id,product_name,sold_quantity,price\n';
              analytics.topProducts.forEach((p: any) => {
                const name = (p.product_name || '').replace(/"/g, '""');
                const price = p.variants && p.variants[0] ? p.variants[0].price : '';
                csv += `${p.product_id},"${name}",${p.sold_quantity || 0},${price}\n`;
              });

              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `analytics-${shop.shop_id}-${new Date().toISOString().slice(0,10)}.csv`;
              document.body.appendChild(a);
              a.click();
              a.remove();
              URL.revokeObjectURL(url);
            }}
            className="py-2 px-3 rounded-xl bg-primary text-white text-sm font-bold"
          >
            Export CSV
          </button>
          <button
            onClick={() => setShowRevenue(s => !s)}
            className={`py-2 px-3 rounded-xl text-sm font-bold ${showRevenue ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            {showRevenue ? 'Hide Revenue' : 'Show Revenue'}
          </button>
          <button
            onClick={() => setShowOrders(s => !s)}
            className={`py-2 px-3 rounded-xl text-sm font-bold ${showOrders ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            {showOrders ? 'Hide Orders' : 'Show Orders'}
          </button>
        </div>
      </div>

      {analytics ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="p-4 bg-white dark:bg-slate-900 border rounded-2xl">
            <div className="text-sm text-slate-400">Revenue</div>
            <div className="text-xl font-bold">₫{analytics.revenue.toLocaleString('vi-VN')}</div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 border rounded-2xl">
            <div className="text-sm text-slate-400">Orders</div>
            <div className="text-xl font-bold">{analytics.ordersCount}</div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 border rounded-2xl">
            <div className="text-sm text-slate-400">Products Sold</div>
            <div className="text-xl font-bold">{analytics.productsSold}</div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 border rounded-2xl">
            <div className="text-sm text-slate-400">Views</div>
            <div className="text-xl font-bold">{analytics.totalViews}</div>
            <div className="text-xs text-slate-400">Conversion: {analytics.conversion}</div>
          </div>
        </div>
      ) : (
        <div className="p-4 text-slate-400">No analytics data yet.</div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-4 bg-white dark:bg-slate-900 border rounded-2xl">
          <h3 className="font-bold mb-2">Revenue (last 14 days)</h3>
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => {
                if (revenueChartRef.current) {
                  const url = revenueChartRef.current.toBase64Image();
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `revenue-${shop.shop_id}-${new Date().toISOString().slice(0,10)}.png`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                }
              }}
              className="py-1 px-2 rounded bg-slate-100 text-sm"
            >
              Export PNG
            </button>
            <button
              onClick={() => {
                // build simple SVG representation and download
                const width = 800;
                const height = 320;
                const padding = 32;
                const data = series.map(s => s.revenue);
                const max = Math.max(...data, 1);
                const min = Math.min(...data, 0);
                const len = data.length;
                const points = data.map((d, i) => {
                  const x = padding + (i / (len - 1)) * (width - padding * 2);
                  const y = padding + (1 - (d - min) / (max - min || 1)) * (height - padding * 2);
                  return `${x},${y}`;
                }).join(' ');
                const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n  <rect width="100%" height="100%" fill="white"/>\n  <polyline fill="none" stroke="#0ea5a4" stroke-width="3" points="${points}"/>\n</svg>`;
                const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `revenue-${shop.shop_id}-${new Date().toISOString().slice(0,10)}.svg`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
              }}
              className="py-1 px-2 rounded bg-slate-100 text-sm"
            >
              Export SVG
            </button>
          </div>
          <Line
            options={{
              responsive: true,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (context: any) => {
                        const v = context.parsed.y || 0;
                        return `₫${Number(v).toLocaleString('vi-VN')}`;
                      }
                    }
                  }
                },
                scales: { y: { ticks: { callback: (val: any) => `₫${Number(val).toLocaleString('vi-VN')}` } } }
            }}
            ref={revenueChartRef}
            data={{
              labels: series.map(s => s.date.slice(5)),
              datasets: [
                {
                  label: 'Revenue',
                    data: series.map(s => s.revenue),
                    hidden: !showRevenue,
                  fill: true,
                  backgroundColor: 'rgba(14,165,164,0.08)',
                  borderColor: '#0ea5a4',
                  tension: 0.3
                }
              ]
            }}
          />
          <div className="text-xs text-slate-400 mt-2">Total: ₫{analytics ? analytics.revenue.toLocaleString('vi-VN') : 0}</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border rounded-2xl">
          <h3 className="font-bold mb-2">Orders (last 14 days)</h3>
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => {
                if (ordersChartRef.current) {
                  const url = ordersChartRef.current.toBase64Image();
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `orders-${shop.shop_id}-${new Date().toISOString().slice(0,10)}.png`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                }
              }}
              className="py-1 px-2 rounded bg-slate-100 text-sm"
            >
              Export PNG
            </button>
            <button
              onClick={() => {
                const width = 800;
                const height = 320;
                const padding = 32;
                const data = series.map(s => s.orders);
                const max = Math.max(...data, 1);
                const min = Math.min(...data, 0);
                const len = data.length;
                const points = data.map((d, i) => {
                  const x = padding + (i / (len - 1)) * (width - padding * 2);
                  const y = padding + (1 - (d - min) / (max - min || 1)) * (height - padding * 2);
                  return `${x},${y}`;
                }).join(' ');
                const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n  <rect width="100%" height="100%" fill="white"/>\n  <polyline fill="none" stroke="#6366f1" stroke-width="3" points="${points}"/>\n</svg>`;
                const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `orders-${shop.shop_id}-${new Date().toISOString().slice(0,10)}.svg`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
              }}
              className="py-1 px-2 rounded bg-slate-100 text-sm"
            >
              Export SVG
            </button>
          </div>
          <Line
            ref={ordersChartRef}
            options={{
              responsive: true,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (context: any) => {
                        const v = context.parsed.y || 0;
                        return `${v} orders`;
                      }
                    }
                  }
                },
                scales: { y: { beginAtZero: true } }
            }}
            data={{
              labels: series.map(s => s.date.slice(5)),
              datasets: [
                {
                  label: 'Orders',
                    data: series.map(s => s.orders),
                    hidden: !showOrders,
                  fill: true,
                  backgroundColor: 'rgba(99,102,241,0.08)',
                  borderColor: '#6366f1',
                  tension: 0.3
                }
              ]
            }}
          />
          <div className="text-xs text-slate-400 mt-2">Orders: {analytics ? analytics.ordersCount : 0}</div>
        </div>
      </div>

      <h2 className="text-lg font-bold mb-4">Top Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {analytics && analytics.topProducts.length > 0 ? (
          analytics.topProducts.map((p: any) => (
            <ProductCard key={p.product_id} product={p} />
          ))
        ) : (
          <div className="p-4 text-slate-400">No top products to show.</div>
        )}
      </div>
    </div>
  );
};

export default SellerAnalytics;
