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
                            initial={{ opacity: 0, x: 20, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                            className={`pointer-events-auto relative flex items-center gap-4 px-5 py-4 rounded-2xl border shadow-2xl backdrop-blur-2xl min-w-[320px] max-w-[440px] overflow-hidden ${
                                toast.type === 'error' 
                                ? 'bg-red-500/10 border-red-500/20 text-red-100 shadow-red-500/5' 
                                : toast.type === 'info'
                                ? 'bg-blue-500/10 border-blue-500/20 text-blue-100 shadow-blue-500/5'
                                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-50 shadow-emerald-500/5'
                            }`}
                        >
                            {/* Diagnostic Pulse Effect */}
                            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                            
                            <div className="shrink-0">
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                                    toast.type === 'error' ? 'bg-red-500/20' : 
                                    toast.type === 'info' ? 'bg-blue-500/20' : 
                                    'bg-emerald-500/20'
                                }`}>
                                    {toast.type === 'error' ? <AlertCircle size={20} className="text-red-400" /> : 
                                     toast.type === 'info' ? <Info size={20} className="text-blue-400" /> : 
                                     <CheckCircle2 size={20} className="text-emerald-400" />}
                                </div>
                            </div>
                            <div className="flex-1 text-sm font-bold tracking-tight leading-tight">
                                {toast.message}
                            </div>
                            <button 
                                onClick={() => removeToast(toast.id)}
                                className="shrink-0 h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-white/30 hover:text-white transition-all"
                            >
                                <X size={16} />
                            </button>
                            
                            {/* High-Fidelity Progress Bar */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/[0.03]">
                                <motion.div 
                                    initial={{ width: '100%' }}
                                    animate={{ width: '0%' }}
                                    transition={{ duration: 4, ease: 'linear' }}
                                    className={`h-full ${
                                        toast.type === 'error' ? 'bg-red-500/50' : 
                                        toast.type === 'info' ? 'bg-blue-500/50' : 
                                        'bg-emerald-500/50'
                                    }`}
                                />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
