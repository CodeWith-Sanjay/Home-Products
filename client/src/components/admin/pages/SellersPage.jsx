import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { StatCard } from "../../admin/components/StatCard";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import {
  Search, Plus, Store, UserCheck, UserX, ShieldCheck, Clock,
  Star, Mail, Phone, MapPin, FileText, CheckCircle2, XCircle,
  AlertTriangle, Ban, Eye, TrendingUp, History, Download
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { api } from "../../../services/api";

const CHART_COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#ef4444'];

const statusStyle = {
  Active: "bg-emerald-50 text-emerald-600 border-emerald-100",
  "Pending KYC": "bg-amber-50 text-amber-600 border-amber-100",
  Suspended: "bg-rose-50 text-rose-600 border-rose-100",
  Banned: "bg-slate-50 text-slate-600 border-slate-100",
};

export default function SellersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      const resp = await api.get('/user/admin/sellers-data');
      if (resp.data.success) {
        setSellers(resp.data.data);
      }
    } catch (err) {
      console.error("Fetch sellers error:", err);
    } finally {
      setLoading(false);
    }
  };

  const performanceData = useMemo(() => {
    return sellers.filter(s => s.status === "Active").map(s => ({
      name: s.name.split(" ")[0],
      orders: s.orders,
      rating: s.rating * 20
    })).slice(0, 8);
  }, [sellers]);

  const stats = useMemo(() => {
    return {
      total: sellers.length,
      active: sellers.filter(s => s.status === 'Active').length,
      pending: sellers.filter(s => s.status === 'Pending KYC').length,
      suspended: sellers.filter(s => s.status === 'Suspended').length
    };
  }, [sellers]);

  const filtered = useMemo(() => {
    return sellers.filter((s) => {
      const matchSearch = s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.owner?.toLowerCase().includes(search.toLowerCase());
      if (tab === "all") return matchSearch;
      if (tab === "active") return matchSearch && s.status === "Active";
      if (tab === "pending") return matchSearch && s.status === "Pending KYC";
      if (tab === "suspended") return matchSearch && (s.status === "Suspended" || s.status === "Banned");
      return matchSearch;
    });
  }, [sellers, search, tab]);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Seller Ecosystem</h1>
          <p className="text-sm text-slate-500 font-bold italic mt-1">Onboarding, verification, and performance governance</p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="h-12 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-violet-100">
            <Plus className="h-4 w-4 mr-2" /> New Partner
          </Button>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Partners" value={stats.total.toLocaleString()} change="Marketplace Scale" changeType="positive" icon={Store} iconColor="bg-violet-600" />
        <StatCard title="Active Status" value={stats.active.toLocaleString()} change={`${Math.round((stats.active / stats.total) * 100 || 0)}% of total`} changeType="positive" icon={UserCheck} iconColor="bg-emerald-600" />
        <StatCard title="Pending KYC" value={stats.pending.toLocaleString()} change="Awaiting Action" changeType="neutral" icon={Clock} iconColor="bg-amber-600" />
        <StatCard title="Suspended" value={stats.suspended.toLocaleString()} change="Risk Mitigation" changeType="negative" icon={UserX} iconColor="bg-rose-600" />
      </div>

      {/* Seller Performance Chart */}
      <div className="bg-white rounded-[32px] p-8 border shadow-sm group overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 blur-3xl -mr-32 -mt-32" />
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Partner Performance</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Order velocity and rating score</p>
          </div>
          <TrendingUp className="text-slate-200 h-8 w-8" />
        </div>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', background: '#fff' }}
                itemStyle={{ fontWeight: 900 }}
              />
              <Bar dataKey="orders" name="Total Orders" fill="#8b5cf6" radius={[10, 10, 0, 0]} />
              <Bar dataKey="rating" name="Rating Score" fill="#10b981" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            placeholder="Search partners, owners, or store IDs..."
            className="w-full h-12 pl-12 pr-4 rounded-2xl border border-slate-100 bg-white text-sm font-bold focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {[
            { key: "all", label: "All Assets" },
            { key: "active", label: "Verified" },
            { key: "pending", label: "KYC Pending" },
            { key: "suspended", label: "Restricted" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setTab(f.key)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${f.key === tab ? "bg-slate-900 text-white shadow-lg" : "bg-white text-slate-400 hover:bg-slate-50 border border-slate-100"
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Seller Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => (
          <div key={s.id} className="bg-white rounded-[32px] p-8 border shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-1.5 h-full ${s.is_active ? 'bg-emerald-500' : 'bg-amber-500'}`} />

            <div className="flex items-start justify-between mb-6">
              <div className="h-14 w-14 rounded-2xl bg-slate-50 border flex items-center justify-center group-hover:scale-110 transition-transform">
                <Store className="h-7 w-7 text-slate-400" />
              </div>
              <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusStyle[s.status]}`}>
                {s.status}
              </span>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">{s.name}</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Lead: {s.owner}</p>
            </div>

            <div className="space-y-3 mb-8 text-[11px] font-bold text-slate-500">
              <div className="flex items-center gap-2.5 bg-slate-50 p-2 rounded-xl">
                <Mail className="h-3.5 w-3.5 text-violet-500" />
                <span className="truncate">{s.email}</span>
              </div>
              <div className="flex items-center gap-2.5 bg-slate-50 p-2 rounded-xl">
                <Phone className="h-3.5 w-3.5 text-emerald-500" />
                <span>{s.phone}</span>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-3 gap-4 py-6 border-y border-slate-50 text-center mb-6">
              <div>
                <p className="text-lg font-black text-slate-900">{s.products}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Assets</p>
              </div>
              <div>
                <p className="text-lg font-black text-slate-900">{s.orders}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Orders</p>
              </div>
              <div>
                <p className="text-lg font-black text-slate-900">{s.rating || '—'}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Score</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 h-12 rounded-2xl bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 transition-all">
                Profile
              </button>
              <button className="h-12 w-12 flex items-center justify-center rounded-2xl bg-slate-50 border text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-all">
                <Eye className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && !loading && (
          <div className="col-span-full py-24 text-center">
            <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-10 w-10 text-slate-200" />
            </div>
            <h3 className="text-xl font-black text-slate-900">No Partners Found</h3>
            <p className="text-sm font-bold text-slate-400 mt-2 italic">Refine your search parameters or tab filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

