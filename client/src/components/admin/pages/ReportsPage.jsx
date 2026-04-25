import { useState, useEffect } from "react";
import {
  TrendingUp, Download, BarChart as BarIcon, Activity,
  Package, ArrowRight, ShoppingCart, IndianRupee, Box
} from "lucide-react";
import { Button } from "../../ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { cn } from "../../../lib/utils";
import { useToast } from "../../../hooks/use-toast";
import { api } from "../../../services/api";

const RANGES = [
  { key: 'daily',      label: 'Today' },
  { key: 'weekly',     label: 'This Week' },
  { key: 'monthly',    label: 'This Month' },
  { key: 'quarterly',  label: 'Quarterly' },
  { key: 'half_yearly',label: 'Half Yearly' },
  { key: 'annual',     label: 'Annual' },
  { key: 'all',        label: 'All Time' },
];

export default function ReportsPage() {
  const [range, setRange] = useState('all');
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    categorySales: [], topProducts: [], summary: null
  });
  const { toast } = useToast();

  useEffect(() => { fetchAnalytics(); }, [range]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const resp = await api.get(`/user/admin/analytics-data?range=${range}`);
      if (resp.data.success) setAnalytics(resp.data.data);
    } catch (err) {
      toast({ title: "Error", description: "Could not load report data.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const summary = analytics.summary || {};
  const totalRevenue = Number(summary.total_revenue || 0);
  const totalOrders = Number(summary.total_orders || 0);
  const totalItems = Number(summary.total_items_sold || 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const statCards = [
    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Total Orders', value: totalOrders, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Items Sold', value: totalItems, icon: Box, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Avg. Order Value', value: `₹${Math.round(avgOrderValue).toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-8 pb-20 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-2 w-10 bg-indigo-600 rounded-full" />
            <span className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.3em]">Insights</span>
          </div>
          <h1 className="text-4xl font-black text-slate-950 tracking-tight">Sales Reports</h1>
          <p className="text-slate-500 font-bold mt-2 text-sm">Overview of sales and product performance</p>
        </div>
        <Button
          onClick={() => toast({ title: "Exporting...", description: "Your report is being prepared." })}
          className="h-14 rounded-2xl px-8 bg-slate-950 text-white font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
        >
          <Download className="h-4 w-4 mr-2" /> Download CSV
        </Button>
      </div>

      {/* Time Range Selector */}
      <div className="flex flex-wrap gap-2">
        {RANGES.map(r => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={cn(
              "h-10 px-5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border",
              range === r.key
                ? "bg-slate-950 text-white border-slate-950 shadow-lg shadow-slate-200"
                : "bg-white text-slate-500 border-slate-100 hover:border-slate-300 hover:text-slate-900"
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Stat Cards */}
      <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
        {statCards.map((s, i) => (
          <div key={i} className="bg-white rounded-[2rem] p-7 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all group hover:-translate-y-1 duration-300">
            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mb-5 shadow-sm", s.bg, s.color)}>
              <s.icon size={22} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{s.label}</p>
            <p className="text-2xl font-black text-slate-950 tracking-tight">{loading ? '—' : s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Category Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 blur-3xl -mr-48 -mt-48" />
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Sales by Category</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Revenue per product room</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
              <BarIcon size={22} />
            </div>
          </div>
          <div className="h-[300px] relative z-10">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="h-10 w-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            ) : analytics.categorySales.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 font-black text-sm uppercase tracking-widest">No data for this period</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.categorySales}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 900, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 900, fill: '#94a3b8' }} tickFormatter={v => `₹${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.12)', background: '#fff', padding: '16px' }}
                    cursor={{ fill: '#f8fafc' }}
                    formatter={v => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#6366f1" radius={[10, 10, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Top Products</h3>
            <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="h-8 w-8 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin" />
              </div>
            ) : analytics.topProducts.length === 0 ? (
              <p className="text-center text-slate-400 font-black text-sm py-10 uppercase tracking-widest">No data</p>
            ) : analytics.topProducts.slice(0, 5).map((p, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-[1.5rem] bg-slate-50/60 hover:bg-white hover:shadow-lg border border-transparent hover:border-indigo-100 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Package className="h-5 w-5 text-slate-400" />
                  </div>
                  <div className="max-w-[130px]">
                    <p className="font-black text-[13px] text-slate-900 truncate">{p.name}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{p.seller}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-[14px] text-indigo-600">₹{(p.revenue / 1000).toFixed(1)}k</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase mt-0.5">{p.qty} units</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Product Performance</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">All top products for selected period</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 shadow-sm">
            <Activity size={24} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/60">
                <th className="pl-10 pr-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Product Name</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Seller</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Quantity Sold</th>
                <th className="pl-6 pr-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={4} className="py-16 text-center text-slate-400 font-black text-sm uppercase tracking-widest">Loading...</td></tr>
              ) : analytics.topProducts.length === 0 ? (
                <tr><td colSpan={4} className="py-16 text-center text-slate-400 font-black text-sm uppercase tracking-widest">No sales data for this period</td></tr>
              ) : analytics.topProducts.map((p, i) => (
                <tr key={i} className="hover:bg-slate-50/40 transition-colors">
                  <td className="pl-10 pr-6 py-6 font-black text-[15px] text-slate-900">{p.name}</td>
                  <td className="px-6 py-6">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-xl">{p.seller}</span>
                  </td>
                  <td className="px-6 py-6 text-center font-black text-lg text-slate-900">{p.qty}</td>
                  <td className="pl-6 pr-10 py-6 text-right font-black text-xl text-emerald-600 italic">
                    ₹{Number(p.revenue).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
