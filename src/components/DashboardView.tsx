import React from 'react';
import {
  Users,
  CreditCard,
  FileCheck,
  ShieldCheck,
  ArrowUpRight,
  Sparkles,
  Printer,
  CheckCircle2,
  Clock,
  Building,
  UserPlus,
  Eye,
  FileText,
} from 'lucide-react';
import { EmployeeRecord, PortalUser, GlobalSettings } from '../types';

interface DashboardViewProps {
  employees: EmployeeRecord[];
  users: PortalUser[];
  settings: GlobalSettings;
  currentUser: PortalUser;
  onNavigate: (tab: 'dashboard' | 'employees' | 'users' | 'settings') => void;
  onOpenPdfUpload: () => void;
  onViewCard: (emp: EmployeeRecord) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  employees,
  users,
  settings,
  currentUser,
  onNavigate,
  onOpenPdfUpload,
  onViewCard,
}) => {
  const activeUsersCount = users.filter((u) => u.isActive).length;
  const recentEmployees = employees.slice(0, 4);

  const stats = [
    {
      label: 'Total Employees (कुल कर्मचारी)',
      value: employees.length,
      subtext: 'Database Saved Records',
      icon: CreditCard,
      color: 'from-blue-600 to-indigo-600',
      textColor: 'text-blue-400',
      bgColor: 'bg-blue-950/40 border-blue-800/50',
    },
    {
      label: 'Active Portal Users (सक्रिय यूजर)',
      value: activeUsersCount,
      subtext: `${users.length} Total Registered`,
      icon: Users,
      color: 'from-emerald-600 to-teal-600',
      textColor: 'text-emerald-400',
      bgColor: 'bg-emerald-950/40 border-emerald-800/50',
    },
    {
      label: 'PDFs Processed (ट्रांसक्रिप्टेड फाइल्स)',
      value: employees.filter((e) => e.sourcePdfName).length,
      subtext: 'Auto Parsed Column Data',
      icon: FileCheck,
      color: 'from-amber-600 to-orange-600',
      textColor: 'text-amber-400',
      bgColor: 'bg-amber-950/40 border-amber-800/50',
    },
    {
      label: 'Global Employer Sign (हस्ताक्षर)',
      value: 'Configured',
      subtext: 'Sign.jpg Active on all cards',
      icon: ShieldCheck,
      color: 'from-purple-600 to-pink-600',
      textColor: 'text-purple-400',
      bgColor: 'bg-purple-950/40 border-purple-800/50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/80 to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-900/60 border border-blue-700/60 text-blue-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Smart Automated System Active</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Welcome, {currentUser.name} ({currentUser.role})
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Upload employee PDF documents to automatically transcript column data, generate
              stylish front/back ID cards, and print dual-sided cards on A4 paper.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenPdfUpload}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4 text-amber-300" />
              <span>Upload PDF Transcript</span>
            </button>
            <button
              onClick={() => onNavigate('employees')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-blue-400" />
              <span>View Employee Cards</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className={`p-5 rounded-2xl border ${stat.bgColor} backdrop-blur-sm transition-all hover:translate-y-[-2px]`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-300">{stat.label}</span>
                <div
                  className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${stat.color} flex items-center justify-center text-white shadow-md`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{stat.value}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{stat.subtext}</p>
            </div>
          );
        })}
      </div>

      {/* Two Column Section: Recent Processed Employees + System Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Employees Extracted */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Recent PDF Employee Transcripts</h3>
              <p className="text-xs text-slate-400">
                हाल ही में ट्रांसक्रिप्ट किए गए कर्मचारी और उनके ID कार्ड्स
              </p>
            </div>
            <button
              onClick={() => onNavigate('employees')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>View All ({employees.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentEmployees.map((emp) => (
              <div
                key={emp.id}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={
                      emp.employeePhoto ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                    }
                    alt={emp.name}
                    className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-700"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-white">{emp.name}</p>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800">
                        IP: {emp.insuranceNo}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[260px] sm:max-w-xs">
                      {emp.employerName} &bull; {emp.gender} &bull; DOB: {emp.dob}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => onViewCard(emp)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View ID Card</span>
                  </button>
                </div>
              </div>
            ))}

            {recentEmployees.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-xs">
                No employee records found. Upload a PDF to get started!
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Quick Workflow Guides & System Specs */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-1">System Operational Workflow</h3>
            <p className="text-xs text-slate-400 mb-4">ऑटोमेशन प्रक्रिया विवरण:</p>

            <div className="space-y-3 text-xs">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-600/20 border border-blue-500 text-blue-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                  1
                </div>
                <div>
                  <p className="font-semibold text-slate-200">Upload PDF Transcript</p>
                  <p className="text-[11px] text-slate-400">
                    PDF का संपूर्ण टेक्स्ट कॉलम वाइज (IP No, Name, DOB, Address) डेटाबेस में सेव होता है।
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-600/20 border border-indigo-500 text-indigo-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                  2
                </div>
                <div>
                  <p className="font-semibold text-slate-200">Edit Photos & Signatures</p>
                  <p className="text-[11px] text-slate-400">
                    कर्मचारी फोटो, फैमिली फोटो व सिग्नेचर अपलोड करें। कॉमन Employer Sign स्वतः जुड़ेगा।
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-600/20 border border-emerald-500 text-emerald-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                  3
                </div>
                <div>
                  <p className="font-semibold text-slate-200">A4 Side-by-Side Dual Print</p>
                  <p className="text-[11px] text-slate-400">
                    प्रिंट प्रीव्यू में A4 पेज पर Back Side (Left) और Front Side (Right) एक साथ प्रिंट हेतु तैयार।
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-950/50 to-slate-900 border border-indigo-900/40 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Building className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-bold text-white">Employer Signature & Seal</h4>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Common signature <code className="text-amber-300">Sign.jpg</code> is synchronized across all employee cards.
            </p>
            <button
              onClick={() => onNavigate('settings')}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-all cursor-pointer"
            >
              Configure Employer Sign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
