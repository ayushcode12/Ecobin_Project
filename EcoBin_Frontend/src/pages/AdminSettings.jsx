import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Settings, 
    Save, 
    ShieldAlert, 
    Zap, 
    Target, 
    Database, 
    Bell,
    Globe,
    Cpu,
    Trash2
} from 'lucide-react';

const AdminSettings = () => {
    const [config, setConfig] = useState({
        systemMaintenance: false,
        aiScanningEnabled: true,
        reportingEnabled: true,
        xpMultiplier: 1.0,
        retentionPeriod: 30,
        dailyScanLimit: 50,
        enableGlobalLeaderboard: true
    });

    const [saving, setSaving] = useState(false);

    const handleToggle = (key) => {
        setConfig(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            alert('System configurations synchronized successfully.');
        }, 800);
    };

    return (
        <div className="page-shell space-y-8">
            <section className="section-head">
                <div>
                    <span className="section-kicker mb-4">System Control</span>
                    <h1 className="page-title"><Settings size={28} className="mr-3 inline-block" />System Settings</h1>
                    <p className="page-subtitle">Configure global platform behavior, AI scanning parameters, and community variables.</p>
                </div>
                <button className="btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? <Database size={15} className="animate-spin" /> : <Save size={15} />}
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Engine Controls */}
                <motion.section 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="surface-card p-6 space-y-6"
                >
                    <div className="flex items-center gap-3 mb-2 border-b border-white/5 pb-4">
                        <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                            <Cpu size={20} />
                        </div>
                        <h2 className="text-lg font-black text-white">System Parameters</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="row space p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                            <div>
                                <div className="text-sm font-bold text-slate-100">AI Scanning Engine</div>
                                <div className="help-text">Allow users to use the live AI camera</div>
                            </div>
                            <button 
                                onClick={() => handleToggle('aiScanningEnabled')}
                                className={`h-6 w-11 rounded-full relative transition-colors ${config.aiScanningEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
                            >
                                <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${config.aiScanningEnabled ? 'left-6' : 'left-1'}`} />
                            </button>
                        </div>

                        <div className="row space p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                            <div>
                                <div className="text-sm font-bold text-slate-100">Reporting System</div>
                                <div className="help-text">Allow field waste reports to be submitted</div>
                            </div>
                            <button 
                                onClick={() => handleToggle('reportingEnabled')}
                                className={`h-6 w-11 rounded-full relative transition-colors ${config.reportingEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
                            >
                                <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${config.reportingEnabled ? 'left-6' : 'left-1'}`} />
                            </button>
                        </div>

                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 stack-sm">
                            <div className="row space">
                                <div className="text-sm font-bold text-slate-100">Global XP Multiplier</div>
                                <span className="badge warning">Bonus Active</span>
                            </div>
                            <input 
                                type="range" 
                                min="1" 
                                max="5" 
                                step="0.5" 
                                className="w-full mt-4 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                value={config.xpMultiplier}
                                onChange={(e) => setConfig({...config, xpMultiplier: e.target.value})}
                            />
                            <div className="row space mt-2">
                                <span className="text-[10px] font-black text-slate-500">1.0x (Standard)</span>
                                <span className="text-sm font-black text-amber-400">{config.xpMultiplier}x</span>
                                <span className="text-[10px] font-black text-slate-500">5.0x (Ultra)</span>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Security & Maintenance */}
                <motion.section 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="surface-card p-6 space-y-6"
                >
                    <div className="flex items-center gap-3 mb-2 border-b border-white/5 pb-4">
                        <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
                            <ShieldAlert size={20} />
                        </div>
                        <h2 className="text-lg font-black text-white">Security & Maintenance</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="row space p-4 rounded-2xl bg-red-500/5 border border-red-500/10">
                            <div>
                                <div className="text-sm font-bold text-red-400">System Maintenance Mode</div>
                                <div className="help-text">Block all non-admin access to the app</div>
                            </div>
                            <button 
                                onClick={() => handleToggle('systemMaintenance')}
                                className={`h-6 w-11 rounded-full relative transition-colors ${config.systemMaintenance ? 'bg-red-500' : 'bg-slate-700'}`}
                            >
                                <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${config.systemMaintenance ? 'left-6' : 'left-1'}`} />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 stack-xs">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Data Retention</span>
                                <div className="row gap-2">
                                    <Database size={14} className="text-blue-400" />
                                    <input 
                                        type="number" 
                                        className="bg-transparent border-none text-white font-black text-lg w-full focus:ring-0" 
                                        value={config.retentionPeriod}
                                        onChange={(e) => setConfig({...config, retentionPeriod: e.target.value})}
                                    />
                                    <span className="text-[10px] font-bold text-slate-500">DAYS</span>
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 stack-xs">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Daily Scan Limit</span>
                                <div className="row gap-2">
                                    <Target size={14} className="text-emerald-400" />
                                    <input 
                                        type="number" 
                                        className="bg-transparent border-none text-white font-black text-lg w-full focus:ring-0" 
                                        value={config.dailyScanLimit}
                                        onChange={(e) => setConfig({...config, dailyScanLimit: e.target.value})}
                                    />
                                    <span className="text-[10px] font-bold text-slate-500">SCANS</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/[0.02] stack-sm">
                            <div className="text-sm font-bold text-red-400 flex items-center gap-2">
                                <Trash2 size={16} /> Danger Zone
                            </div>
                            <p className="text-[10px] text-slate-500">Permanently delete all system logs older than 90 days. This action cannot be undone.</p>
                            <button className="btn-ghost text-red-400 border-red-500/20 hover:bg-red-500/10 w-full mt-2 py-2">Purge Old Logs</button>
                        </div>
                    </div>
                </motion.section>
            </div>
        </div>
    );
};

export default AdminSettings;
