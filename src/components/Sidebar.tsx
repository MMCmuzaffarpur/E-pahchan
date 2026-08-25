import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Settings,
  FileUp,
  CreditCard,
  Printer,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import { PortalUser } from '../types';

export type NavTab = 'dashboard' | 'employees' | 'users' | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  currentUser: PortalUser;
  employeeCount: number;
  userCount: number;
  onOpenPdfUpload: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  employeeCount,
  userCount,
  onOpenPdfUpload,
}) => {
  const isAdmin = currentUser.role === 'Admin';

  const menuItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      hindiLabel: 'डैशबोर्ड व सांख्यिकी',
      icon: LayoutDashboard,
      badge: null,
      adminOnly: false,
    },
    {
      id: 'employees' as NavTab,
      label: 'Employee Menu',
      hindiLabel: 'कर्मचारी सूची व ID कार्ड्स',
      icon: CreditCard,
      badge: employeeCount,
      adminOnly: false,
    },
    {
      id: 'users' as NavTab,
      label: 'User Menu',
      hindiLabel: 'यूजर प्रबंधन (Admin/User)',
      icon: Users,
      badge: userCount,
      adminOnly: true, // Only admin can access user management
    },
    {
      id: 'settings' as NavTab,
      label: 'Portal Settings',
      hindiLabel: 'Employer Signature (Sign.jpg)',
      icon: Settings,
      badge: null,
      adminOnly: false,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 shrink-0">
      <div className="space-y-6">
        {/* Navigation list */}
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Main Navigation / मुख्य मेनू
          </p>
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              const isLocked = item.adminOnly && !isAdmin;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (!isLocked) onSelectTab(item.id);
                  }}
                  disabled={isLocked}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : isLocked
                      ? 'opacity-40 cursor-not-allowed text-slate-500 bg-slate-950/40'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive
                          ? 'text-white'
                          : isLocked
                          ? 'text-slate-600'
                          : 'text-blue-400'
                      }`}
                    />
                    <div>
                      <p className="text-xs font-semibold leading-tight">{item.label}</p>
                      <p
                        className={`text-[10px] ${
                          isActive ? 'text-blue-100' : 'text-slate-400'
                        }`}
                      >
                        {item.hindiLabel}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.badge !== null && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {isLocked && (
                      <span
                        title="Admin role required"
                        className="text-[9px] px-1 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-800"
                      >
                        Admin
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Upload Action Callout */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-950/60 to-indigo-950/60 border border-blue-800/40 text-slate-200">
          <div className="flex items-center gap-2 mb-1.5">
            <FileUp className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-white">Upload New PDF</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
            PDF से सभी कॉलम डाटा ऑटोमैटिक ट्रांसक्रिप्ट कर डेटाबेस में सेव करें।
          </p>
          <button
            onClick={onOpenPdfUpload}
            className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <span>+ Upload PDF</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Info capsule */}
      <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <div>
          <p className="font-semibold text-slate-300">e-Pehchan v2.4</p>
          <p className="text-[10px]">A4 Side-by-Side Dual Print</p>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      </div>
    </aside>
  );
};
