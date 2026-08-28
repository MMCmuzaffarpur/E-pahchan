import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  UserCheck,
  Sparkles,
  Building2,
  FileText,
  CheckCircle2,
  KeyRound,
  AlertCircle,
  Phone,
  Globe,
  Award,
} from 'lucide-react';
import { PortalUser } from '../types';
import { loginApi } from '../utils/api';
import { NATIONAL_EMBLEM_SVG, ESIC_OFFICIAL_LOGO } from '../utils/defaultAssets';

interface LoginPageProps {
  onLoginSuccess: (user: PortalUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('Admin');
  const [password, setPassword] = useState('Admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<'Admin' | 'User'>('Admin');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePresetSelect = (preset: 'Admin' | 'User') => {
    setSelectedPreset(preset);
    setErrorMsg(null);
    if (preset === 'Admin') {
      setIdentifier('Admin');
      setPassword('Admin123');
    } else {
      setIdentifier('user@portal.gov.in');
      setPassword('User123');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await loginApi(identifier, password);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMsg(res.message || 'Invalid username/email or password.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#071426] flex flex-col justify-between items-center relative overflow-hidden font-sans text-slate-100">
      {/* Top Sovereign Tricolor Ribbon */}
      <div className="w-full h-2 flex z-30 shadow-md">
        <div className="w-1/3 h-full bg-[#ff9933]" />
        <div className="w-1/3 h-full bg-[#ffffff]" />
        <div className="w-1/3 h-full bg-[#138808]" />
      </div>

      {/* Background ambient lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a25_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Top Official Government Banner */}
      <header className="w-full max-w-5xl mx-auto px-4 py-4 z-20">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-700/60 pb-3">
          <div className="flex items-center gap-3">
            <img
              src={NATIONAL_EMBLEM_SVG}
              alt="National Emblem"
              className="w-9 h-11 object-contain drop-shadow"
            />
            <div>
              <p className="text-[11px] font-black text-amber-400 tracking-wider">
                भारत सरकार / Government of India
              </p>
              <p className="text-[9px] text-slate-300 font-semibold">
                श्रम एवं रोजगार मंत्रालय / Ministry of Labour & Employment
              </p>
              <p className="text-[8px] text-slate-400">
                कर्मचारी राज्य बीमा निगम / Employees' State Insurance Corporation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700/80">
            <img
              src={ESIC_OFFICIAL_LOGO}
              alt="ESIC"
              className="w-8 h-8 rounded-full bg-white p-0.5"
            />
            <div className="text-right">
              <span className="text-xs font-black text-white block leading-tight">
                e-Pehchan Portal
              </span>
              <span className="text-[9px] text-amber-300 font-bold block">
                ई-पहचान स्मार्ट आईडी सिस्टम
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Login Center Card */}
      <main className="w-full max-w-md px-4 py-4 z-20 flex-1 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full bg-[#0c2038]/95 border-2 border-amber-500/40 rounded-3xl shadow-2xl p-6 sm:p-7 backdrop-blur-xl relative"
        >
          {/* Card Top Pill */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/40 text-[11px] font-bold text-amber-300 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Official Government Portal Authentication</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              पोर्टल लॉगिन / Portal Sign In
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              PDF Transcript, IP Extraction & Employee Smart ID System
            </p>
          </div>

          {/* Quick Credential Switcher (Admin / User) */}
          <div className="mb-4 bg-[#07172b] border border-slate-700/80 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Quick 1-Click Roles / तुरंत लॉगिन चुनें:</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Admin Preset */}
              <button
                type="button"
                onClick={() => handlePresetSelect('Admin')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedPreset === 'Admin'
                    ? 'bg-amber-950/60 border-amber-400 text-white shadow-lg ring-1 ring-amber-400'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin / एडमिन</span>
                </div>
                <p className="text-[10px] text-slate-200 mt-1 font-mono">User: <b>Admin</b></p>
                <p className="text-[10px] text-slate-300 font-mono">Pass: <b>Admin123</b></p>
                <span className="text-[8.5px] text-emerald-400 font-bold block mt-0.5">
                  ★ Full Portal & User Auth
                </span>
              </button>

              {/* User / Operator Preset */}
              <button
                type="button"
                onClick={() => handlePresetSelect('User')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedPreset === 'User'
                    ? 'bg-blue-950/70 border-blue-400 text-white shadow-lg ring-1 ring-blue-400'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Operator / यूजर</span>
                </div>
                <p className="text-[10px] text-slate-200 mt-1 font-mono truncate">User: <b>user@portal</b></p>
                <p className="text-[10px] text-slate-300 font-mono">Pass: <b>User123</b></p>
                <span className="text-[8.5px] text-blue-300 font-bold block mt-0.5">
                  🔒 Authorized Cards Only
                </span>
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-xs text-rose-200 flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Authentication Failed</p>
                <p className="text-[11px] text-rose-300 mt-0.5">{errorMsg}</p>
              </div>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Username / Email ID (उपयोगकर्ता नाम / ईमेल)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. Admin or user@portal.gov.in"
                  className="w-full bg-[#07172b] border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Password (पासवर्ड)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#07172b] border border-slate-700 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-sm shadow-xl shadow-amber-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-70 cursor-pointer uppercase tracking-wider"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <>
                  <span>Sign In &bull; पोर्टल लॉगिन करें</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Micro Security Notice */}
          <div className="mt-4 pt-3 border-t border-slate-800 text-center text-[10.5px] text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secure 256-Bit SSL Encrypted Government Portal Session</span>
          </div>
        </motion.div>
      </main>

      {/* Official Government Footer */}
      <footer className="w-full max-w-5xl mx-auto px-4 py-3 z-20 text-center border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <span>Toll-Free Helpline:</span>
          <strong className="text-amber-300 font-mono">1800 11 2526</strong>
          <span>(ESIC Helpdesk)</span>
        </div>

        <div>
          <span>Designed & Maintained for Government e-Pehchan &bull; </span>
          <span className="text-slate-300 font-semibold">Muzaffarpur Municipal Corporation</span>
        </div>
      </footer>
    </div>
  );
};
