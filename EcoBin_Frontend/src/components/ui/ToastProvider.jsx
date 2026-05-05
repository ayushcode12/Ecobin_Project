import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 20, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            className={`pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-2xl backdrop-blur-xl min-w-[300px] max-w-[420px] ${
                                toast.type === 'error' 
                                ? 'bg-red-500/10 border-red-500/20 text-red-200' 
                                : toast.type === 'info'
                                ? 'bg-blue-500/10 border-blue-500/20 text-blue-200'
                                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-100'
                            }`}
                        >
                            <div className="shrink-0">
                                {toast.type === 'error' ? <AlertCircle size={20} className="text-red-400" /> : 
                                 toast.type === 'info' ? <Info size={20} className="text-blue-400" /> : 
                                 <CheckCircle2 size={20} className="text-emerald-400" />}
                            </div>
                            <div className="flex-1 text-sm font-bold tracking-tight leading-snug">
                                {toast.message}
                            </div>
                            <button 
                                onClick={() => removeToast(toast.id)}
                                className="shrink-0 text-white/20 hover:text-white/40 transition-colors"
                            >
                                <X size={16} />
                            </button>
                            <motion.div 
                                initial={{ width: '100%' }}
                                animate={{ width: '0%' }}
                                transition={{ duration: 4, ease: 'linear' }}
                                className={`absolute bottom-0 left-0 h-1 rounded-full ${
                                    toast.type === 'error' ? 'bg-red-500/40' : toast.type === 'info' ? 'bg-blue-500/40' : 'bg-emerald-500/40'
                                }`}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
