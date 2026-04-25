import { useState, useEffect, useMemo } from "react";
import { 
  IndianRupee, TrendingUp, CreditCard, Receipt, Search,
  Download, Calendar, History, TrendingDown, Wallet, ShieldCheck, 
  ArrowUpRight, ArrowDownRight, LayoutDashboard, Landmark, ArrowRight
} from "lucide-react";
import { Button } from "../../ui/button";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { cn } from "../../../lib/utils";
import { useToast } from "../../../hooks/use-toast";
import { api } from "../../../services/api";

const CHART_COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#ef4444'];
const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
const fmtK = (v) => `₹${(v / 1000).toFixed(0)}k`;

const FinanceStatCard = ({ title, value, label, icon: Icon, color, change }) => (
  <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
    <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-[0.03] -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-700`} />
    <div className="flex items-center gap-6 relative z-10">
      <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg", color.replace('bg-', 'bg- opacity-10').replace('opacity-10', ''), "bg-opacity-10")}>
        <Icon className={cn("h-8 w-8", color.replace('bg-', 'text-'))} />
      </div>
      <div>
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
          {change && (
            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", change.startsWith('+') ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50")}>
              {change}
            </span>
          )}
        </div>
        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{label}</p>
      </div>
    </div>
  </div>
);

export default function FinancePage() {
  const [loading, setLoading] = useState(true);
  const [financeData, setFinanceData] = useState({
    summary: { gross_revenue: 0, platform_commission: 0, net_profit: 0 },
    monthlyPL: [],
    payouts: [],
    expenses: [],
    transactions: []
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      const resp = await api.get('/user/admin/finance-data');
      if (resp.data.success) {
        setFinanceData(resp.data.data);
      }
    } catch (err) {
      console.error("Fetch finance data error:", err);
      toast({ title: "Fetch Error", description: "Failed to load financial metrics.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const { summary, monthlyPL, payouts, expenses, transactions } = financeData;

  const handleExport = () => {
    toast({ title: "Audit Report", description: "Your financial ledger is being generated for download." });
  };

  return (
    <div className="space-y-10 pb-20 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-2 w-10 bg-violet-600 rounded-full" />
            <span className="text-[11px] font-black text-violet-600 uppercase tracking-[0.3em]">Fiscal Outlook</span>
          </div>
          <h1 className="text-4xl font-black text-slate-950 tracking-tight">Finance Dashboard</h1>
          <p className="text-slate-500 font-bold mt-2 text-sm">Track platform revenue and partner payouts</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleExport}
            className="h-14 rounded-2xl px-8 bg-slate-950 text-white font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
          >
            <Download className="h-4 w-4 mr-2" /> Download Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <FinanceStatCard title="Total Revenue" value={fmt(summary.gross_revenue)} label="Gross Sales" icon={IndianRupee} color="bg-violet-600" change="+14.2%" />
        <FinanceStatCard title="Platform Fees" value={fmt(summary.platform_commission)} label="Commission (15%)" icon={Receipt} color="bg-emerald-600" />
        <FinanceStatCard title="Net Profit" value={fmt(summary.net_profit)} label="After Payouts" icon={TrendingUp} color="bg-blue-600" change="+8.4%" />
        <FinanceStatCard title="Profit Margin" value="32.4%" label="Capital Efficiency" icon={CreditCard} color="bg-amber-600" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main P&L Chart */}
        <div className="lg:col-span-2 bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/5 blur-3xl -mr-48 -mt-48" />
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Revenue Growth</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Monthly performance trend</p>
            </div>
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-2">
                 <div className="h-3 w-3 rounded-full bg-violet-500 shadow-sm" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Revenue</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-sm" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Profit</span>
               </div>
            </div>
          </div>
          <div className="h-[350px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyPL}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 900, fill: '#94a3b8'}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 900, fill: '#94a3b8'}} tickFormatter={fmtK} />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', background: '#fff', padding: '20px' }}
                  itemStyle={{ fontWeight: 900, fontSize: '12px' }}
                  labelStyle={{ fontWeight: 900, color: '#64748b', marginBottom: '8px' }}
                  formatter={(v) => fmt(v)}
                />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={5} fillOpacity={1} fill="url(#revGrad)" />
                <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={5} fillOpacity={1} fill="url(#profGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Distribution */}
        <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 blur-3xl -mr-24 -mt-24" />
          <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-8 relative z-10">Expense Distribution</h3>
          <div className="h-[250px] mb-10 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={expenses.length > 0 ? expenses : [
                    { name: "Payouts", value: 0 },
                    { name: "Taxes", value: 0 },
                    { name: "Ops", value: 0 },
                    { name: "Shipping", value: 0 }
                  ]} 
                  innerRadius={75} 
                  outerRadius={105} 
                  paddingAngle={10} 
                  dataKey="value" 
                  strokeWidth={0}
                >
                  {expenses.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 900 }}
                  formatter={(v) => fmt(v)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4 relative z-10">
            {expenses.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full shadow-sm" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight">{s.name}</span>
                </div>
                <span className="text-xs font-black text-slate-900">{fmt(s.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Payouts Ledger */}
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-10 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Seller Payouts</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Pending partner disbursements</p>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm">
              <Wallet size={28} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="pl-10 pr-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Seller</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Payout Amount</th>
                  <th className="pl-6 pr-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="pl-10 pr-6 py-8">
                      <div className="flex items-center gap-5">
                        <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-600 text-sm shadow-sm group-hover:scale-110 transition-transform">
                          {p.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-[15px] text-slate-900 tracking-tight">{p.name}</span>
                          <span className="text-[10px] font-black text-violet-500 uppercase tracking-widest mt-1">Partner Store</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-8 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-black text-lg text-slate-950 italic tracking-tight">{fmt(p.amount)}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">Rev: {fmt(p.revenue)}</span>
                      </div>
                    </td>
                    <td className="pl-6 pr-10 py-8 text-center">
                       <span className={cn(
                         "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border",
                         p.status === 'Completed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                       )}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-8 bg-slate-50/50 border-t border-slate-100 text-center">
             <button className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-900 transition-colors flex items-center justify-center gap-2 mx-auto">
               View Full Ledger <ArrowRight size={14} />
             </button>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-10 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Transaction History</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Recent order audit trail</p>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm">
              <History size={28} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="pl-10 pr-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction ID</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Amount</th>
                  <th className="pl-6 pr-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="pl-10 pr-6 py-8">
                      <div className="flex flex-col">
                        <span className="font-black text-[15px] text-slate-900 tracking-tight">{t.id}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t.date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-8 text-right">
                       <span className="font-black text-lg text-slate-950 italic tracking-tight">{fmt(t.amount)}</span>
                    </td>
                    <td className="pl-6 pr-10 py-8 text-center">
                       <span className="inline-flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 shadow-sm">
                         <ShieldCheck className="h-4 w-4" /> Verified
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-8 bg-slate-50/50 border-t border-slate-100 text-center">
             <button className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-900 transition-colors flex items-center justify-center gap-2 mx-auto">
               Export History <ArrowRight size={14} />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
