import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, description, variant = 'default', duration = 5000 }) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, title, description, variant, duration }]);
    
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} {...t} onRemove={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ id, title, description, variant, onRemove }) => {
  const variants = {
    default: "bg-white border-slate-200 text-slate-900",
    destructive: "bg-red-50 border-red-200 text-red-900",
    success: "bg-emerald-50 border-emerald-200 text-emerald-900",
    warning: "bg-amber-50 border-amber-200 text-amber-900",
    info: "bg-blue-50 border-blue-200 text-blue-900",
  };

  const icons = {
    default: <Info size={20} className="text-slate-400" />,
    destructive: <AlertCircle size={20} className="text-red-500" />,
    success: <CheckCircle2 size={20} className="text-emerald-500" />,
    warning: <AlertTriangle size={20} className="text-amber-500" />,
    info: <Info size={20} className="text-blue-500" />,
  };

  return (
    <div className={`pointer-events-auto flex w-full items-start gap-4 rounded-xl border p-4 shadow-lg animate-in slide-in-from-right-full duration-300 ${variants[variant] || variants.default}`}>
      <div className="mt-0.5">{icons[variant] || icons.default}</div>
      <div className="flex-1 space-y-1">
        {title && <p className="text-sm font-bold leading-none">{title}</p>}
        {description && <p className="text-xs opacity-90 leading-relaxed">{description}</p>}
      </div>
      <button onClick={onRemove} className="shrink-0 opacity-50 hover:opacity-100 transition-opacity">
        <X size={16} />
      </button>
    </div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
