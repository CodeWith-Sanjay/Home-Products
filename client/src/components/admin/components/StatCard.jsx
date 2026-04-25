import { cn } from "../../../lib/utils";
import { ArrowUp, ArrowDown } from "lucide-react";

export function StatCard({ title, value, todayValue, change, changeType = "neutral", icon: Icon, iconColor }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-slate-500/5 blur-2xl -mr-12 -mt-12 group-hover:bg-slate-500/10 transition-all"></div>
      
      <div className="flex items-start justify-between mb-5 relative z-10">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-2">{title}</p>
          <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none">{value}</h3>
        </div>
        <div className={cn("rounded-2xl flex shrink-0 items-center justify-center h-12 w-12 shadow-sm border", iconColor || "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700")}>
          <Icon className={cn("h-6 w-6 shrink-0", iconColor ? "text-white" : "text-slate-400 dark:text-slate-500")} />
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-50 dark:border-slate-800/50 relative z-10">
        {todayValue !== undefined && (
          <div className="flex items-center gap-1.5">
            <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-lg text-[10px] font-black tracking-tighter">+{todayValue} Today</span>
          </div>
        )}

        {change && (
          <div className="flex items-center gap-1.5 ml-auto">
            <p
              className={cn(
                "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border",
                changeType === "positive" && "bg-emerald-50/50 border-emerald-100 text-emerald-600",
                changeType === "negative" && "bg-rose-50/50 border-rose-100 text-rose-600",
                changeType === "neutral" && "bg-slate-50 border-slate-100 text-slate-400"
              )}
            >
              <span className="flex items-center gap-1">
                {changeType === "positive" ? <ArrowUp className="h-2.5 w-2.5 stroke-[3px]" /> : changeType === "negative" ? <ArrowDown className="h-2.5 w-2.5 stroke-[3px]" /> : null}
                {change}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

