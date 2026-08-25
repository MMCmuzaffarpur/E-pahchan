import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Lock, Mail, ArrowRight, Eye, EyeOff, UserCheck, Sparkles, Building2, FileText, CheckCircle2 } from 'lucide-react';
import { PortalUser } from '../types';
import { getPortalUsers } from '../utils/storage';

interface LoginPageProps {
  onLoginSuccess: (user: PortalUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@portal.gov.in');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRolePreset, setSelectedRolePreset] = useState<'Admin' | 'User'>('Admin');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePresetSelect = (role: 'Admin' | 'User') => {
    setSelectedRolePreset(role);
    if (role === 'Admin') {
      setEmail('admin@portal.gov.in');
      setPassword('admin123');
    } else {
      setEmail('user@portal.gov.in');
      setPassword('user123');
    }
    setErrorMsg(null);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    setTimeout(() => {
      const users = getPortalUsers();
      const matchedUser = users.find(
        (u) => u.email.trim().toLowerCase() === email.trim().toLowerCase()
      );

      if (!matchedUser) {
        // Allow demo login if user created it or default fallback
        if (email === 'admin@portal.gov.in' || email === 'user@portal.gov.in') {
          const fallbackUser: PortalUser = {
            id: 'user-' + (selectedRolePreset === 'Admin' ? 'admin-1' : 'staff-2'),
            name: selectedRolePreset === 'Admin' ? 'Chief Portal Admin' : 'Operator Staff',
            email: email,
            role: selectedRolePreset,
            isActive: true,
            createdAt: new Date().toISOString(),
            lastLogin: 'Just now',
          };
          setIsLoading(false);
          onLoginSuccess(fallbackUser);
          return;
        }
        setIsLoading(false);
        setErrorMsg('Invalid email or password. Please check your credentials.');
        return;
      }

      if (!matchedUser.isActive) {
        setIsLoading(false);
        setErrorMsg('Your account has been deactivated by the Administrator. Please contact support.');
        return;
      }

      setIsLoading(false);
      onLoginSuccess(matchedUser);
    }, 600);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col justify-center items-center relative overflow-hidden p-4">
      {/* Background ambient lighting effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-8 backdrop-blur-xl relative z-10"
      >
        {/* Header with Emblem */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/20 mb-4 border border-blue-400/30">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            e-Pehchan Smart ID Portal
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 uppercase tracking-wider font-medium">
            PDF Transcript & Employee ID Card Generation System
          </p>
          <div className="inline-flex items-center gap-1.5 mt-2.5 px-2.5 py-0.5 rounded-full bg-blue-950/60 border border-blue-800/60 text-[11px] font-medium text-blue-300">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            2 Role Access: Admin & Operator
          </div>
        </div>

        {/* Quick Role Switcher Buttons */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Select Role / तुरंत लॉगिन रोल चुनें:
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => handlePresetSelect('Admin')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                selectedRolePreset === 'Admin'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin (Full Control)
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('User')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                selectedRolePreset === 'User'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              User (Operator)
            </button>
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 p-3 bg-rose-950/70 border border-rose-800/80 rounded-xl text-xs text-rose-200"
          >
            {errorMsg}
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@portal.gov.in"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <label className="flex items-center gap-2 cursor-pointer hover:text-slate-300">
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0"
              />
              Remember session
            </label>
            <span className="text-slate-500">Auto-saved to browser</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-70 cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Authenticating...
              </span>
            ) : (
              <>
                <span>Enter Portal / पोर्टल में प्रवेश करें</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Feature highlight badges */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-[10px] text-slate-400">
          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/50 flex flex-col items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>PDF Transcript</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/50 flex flex-col items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Smart ID Card</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/50 flex flex-col items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>A4 Print Ready</span>
          </div>
        </div>
      </motion.div>

      {/* Footer copyright */}
      <p className="mt-6 text-xs text-slate-500 text-center">
        e-Pehchan & ESIC ID Card Automation Engine &bull; Secure Administrative Access
      </p>
    </div>
  );
};
