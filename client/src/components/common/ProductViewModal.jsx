import React from 'react';
import { X, Package, Tag, IndianRupee, Layers, ShoppingBag, Clock, Home, Info, ShieldCheck, Box } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function ProductViewModal({ product, onClose }) {
  if (!product) return null;

  const isRealImage = product.thumbnail && (product.thumbnail.startsWith("data:image") || product.thumbnail.startsWith("http") || product.thumbnail.startsWith("/"));

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[999] p-4 animate-in fade-in duration-500" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-3xl rounded-[56px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 border border-white/20 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 h-12 w-12 flex items-center justify-center rounded-2xl bg-black/5 hover:bg-black/10 text-slate-900 transition-all z-20 hover:rotate-90 active:scale-90"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col lg:flex-row h-full">
          {/* Visual Side */}
          <div className="lg:w-1/2 relative bg-slate-50 min-h-[400px]">
             {isRealImage ? (
               <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full flex flex-col items-center justify-center text-slate-200">
                  <Home size={120} className="mb-4 opacity-50" />
                  <span className="text-xl font-black uppercase tracking-[0.2em]">Asset Visualization</span>
               </div>
             )}
             <div className="absolute bottom-8 left-8">
                <span className="px-6 py-2.5 rounded-2xl bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl border border-white/50">
                   Room: {product.room || 'General'}
                </span>
             </div>
          </div>

          {/* Intelligence Side */}
          <div className="lg:w-1/2 p-12 overflow-y-auto max-h-[90vh]">
             <div className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                   <div className="h-2 w-2 rounded-full bg-violet-600 shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Neural Asset ID: {product.id.split('-')[0].toUpperCase()}</span>
                </div>
                <h2 className="text-4xl font-black text-slate-950 tracking-tight leading-tight mb-2">{product.name}</h2>
                <p className="text-[11px] font-black text-violet-600 uppercase tracking-widest italic">{product.sku || 'SKU UNALLOCATED'}</p>
             </div>

             <div className="flex items-end gap-3 mb-10">
                <span className="text-4xl font-black text-slate-950 italic tracking-tighter">₹{Number(product.price || 0).toLocaleString('en-IN')}</span>
                {product.mrp > product.price && (
                  <span className="text-lg text-slate-300 line-through font-bold mb-1">₹{product.mrp.toLocaleString('en-IN')}</span>
                )}
             </div>

             <div className="grid grid-cols-1 gap-4 mb-10">
                <div className="p-6 rounded-[32px] bg-slate-50 border border-slate-100/50 flex items-center gap-6 group hover:bg-white hover:border-slate-200 transition-all duration-300 shadow-sm">
                   <div className="h-12 w-12 rounded-2xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-100">
                      <Layers size={22} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Inventory Level</p>
                      <p className={cn("text-lg font-black tracking-tight", product.stock < 10 ? 'text-rose-500' : 'text-slate-900')}>
                         {product.stock} Units Available
                      </p>
                   </div>
                </div>

                <div className="p-6 rounded-[32px] bg-slate-50 border border-slate-100/50 flex items-center gap-6 group hover:bg-white hover:border-slate-200 transition-all duration-300 shadow-sm">
                   <div className="h-12 w-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                      <ShieldCheck size={22} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Asset Status</p>
                      <p className="text-lg font-black text-slate-900 tracking-tight">
                         Protocol Active
                      </p>
                   </div>
                </div>

                <div className="p-6 rounded-[32px] bg-slate-50 border border-slate-100/50 flex items-center gap-6 group hover:bg-white hover:border-slate-200 transition-all duration-300 shadow-sm">
                   <div className="h-12 w-12 rounded-2xl bg-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-100">
                      <Box size={22} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Strategic Room</p>
                      <p className="text-lg font-black text-slate-900 tracking-tight">
                         {product.room || 'General Selection'}
                      </p>
                   </div>
                </div>
             </div>

             <div className="flex gap-4">
                <button className="flex-1 h-16 rounded-[24px] bg-slate-950 text-white font-black uppercase text-[11px] tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-slate-950/20">
                   Modify Config
                </button>
                <button 
                  onClick={onClose}
                  className="px-8 h-16 rounded-[24px] bg-slate-100 text-slate-600 font-black uppercase text-[11px] tracking-[0.2em] hover:bg-slate-200 transition-all active:scale-95"
                >
                   Exit Preview
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
