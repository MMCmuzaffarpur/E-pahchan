import React from 'react';
import { ShieldCheck, UserCheck, LogOut, Bell, Search, Sparkles, Building2 } from 'lucide-react';
import { PortalUser, GlobalSettings } from '../types';

interface NavbarProps {
  currentUser: PortalUser;
  settings: GlobalSettings;
  onLogout: () => void;
  onNavigate: (tab: 'dashboard' | 'employees' | 'users' | 'settings') => void;
  onOpenPdfUpload: () => void;
  employeeCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  settings,
  onLogout,
  onOpenPdfUpload,
  employeeCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 border border-blue-400/30 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base text-white tracking-tight leading-none">
                {settings.portalTitle.split('&')[0].trim()}
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 border border-emerald-800 text-emerald-300">
                Live Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium truncate max-w-[280px] sm:max-w-md mt-0.5">
              {settings.organizationName} &bull; Total ID: {employeeCount}
            </p>
          </div>
        </div>

        {/* Right action controls & user badge */}
        <div className="flex items-center gap-3">
          {/* Quick PDF upload trigger */}
          <button
            onClick={onOpenPdfUpload}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/25 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Upload PDF Transcript</span>
          </button>

          {/* User profile capsule */}
          <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-800">
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full ring-2 ring-blue-500/40 object-cover"
            />
            <div className="hidden md:block text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-100">{currentUser.name}</span>
                <span
                  className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    currentUser.role === 'Admin'
                      ? 'bg-blue-900/60 text-blue-300 border border-blue-700/50'
                      : 'bg-indigo-900/60 text-indigo-300 border border-indigo-700/50'
                  }`}
                >
                  {currentUser.role === 'Admin' ? (
                    <ShieldCheck className="w-2.5 h-2.5 mr-0.5" />
                  ) : (
                    <UserCheck className="w-2.5 h-2.5 mr-0.5" />
                  )}
                  {currentUser.role}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate max-w-[140px]">
                {currentUser.email}
              </p>
            </div>

            {/* Logout button */}
            <button
              onClick={onLogout}
              title="Sign Out / लॉगआउट करें"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl transition-all border border-transparent hover:border-rose-900/50 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
