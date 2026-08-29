import React, { useState } from 'react';
import {
  FileUp,
  Search,
  Eye,
  Edit3,
  Trash2,
  Printer,
  Sparkles,
  User,
  Building2,
  Phone,
  Calendar,
  Filter,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Check,
  X as CloseIcon,
} from 'lucide-react';
import { EmployeeRecord, GlobalSettings } from '../types';
import { isValidIpNumber } from '../utils/pdfParser';

interface EmployeeListViewProps {
  employees: EmployeeRecord[];
  settings: GlobalSettings;
  onOpenPdfUpload: () => void;
  onViewCard: (emp: EmployeeRecord) => void;
  onEditEmployee: (emp: EmployeeRecord) => void;
  onDeleteEmployee: (id: string, name: string) => void;
  onOpenPrintPreview: (emp: EmployeeRecord) => void;
  onUpdateEmployee?: (id: string, updates: Partial<EmployeeRecord>) => void;
}

export const EmployeeListView: React.FC<EmployeeListViewProps> = ({
  employees,
  settings,
  onOpenPdfUpload,
  onViewCard,
  onEditEmployee,
  onDeleteEmployee,
  onOpenPrintPreview,
  onUpdateEmployee,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<'All' | 'Male' | 'Female'>('All');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Inline Quick Edit for IP Number
  const [editingIpEmpId, setEditingIpEmpId] = useState<string | null>(null);
  const [editingIpValue, setEditingIpValue] = useState<string>('');

  const handleStartEditIp = (emp: EmployeeRecord) => {
    setEditingIpEmpId(emp.id);
    setEditingIpValue(emp.insuranceNo === '0000000000' ? '' : emp.insuranceNo);
  };

  const handleSaveInlineIp = (empId: string) => {
    const cleaned = editingIpValue.trim();
    if (cleaned && onUpdateEmployee) {
      onUpdateEmployee(empId, { insuranceNo: cleaned });
    }
    setEditingIpEmpId(null);
  };

  const handleCancelInlineIp = () => {
    setEditingIpEmpId(null);
    setEditingIpValue('');
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.insuranceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.mobileNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchGender = genderFilter === 'All' || emp.gender === genderFilter;

    return matchSearch && matchGender;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner with Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Employee Records & ID Card Registry
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-950 text-blue-300 border border-blue-800">
              {employees.length} Records
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            PDF से एक्सट्रैक्टेड ट्रांसक्रिप्ट डेटाबेस &bull; View, Edit (Photo/Signature) व A4 Print सुविधा
          </p>
        </div>

        <button
          onClick={onOpenPdfUpload}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer shrink-0"
        >
          <FileUp className="w-4 h-4 text-amber-300" />
          <span>+ Upload PDF Transcript (PDF अपलोड करें)</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Employee Name, Insurance IP No, Mobile, Employer..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            {(['All', 'Male', 'Female'] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGenderFilter(g)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  genderFilter === g
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Employee List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Employee Photo & Name</th>
                <th className="py-3.5 px-4 font-mono">Insurance No (IP)</th>
                <th className="py-3.5 px-4">Gender & DOB</th>
                <th className="py-3.5 px-4">Father / Husband</th>
                <th className="py-3.5 px-4">Mobile & Address</th>
                <th className="py-3.5 px-4">Employer Details</th>
                <th className="py-3.5 px-4 text-center">Actions (व्यू / एडिट / डिलीट)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEmployees.map((emp) => (
                <tr
                  key={emp.id}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Photo & Name */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-xl overflow-hidden ring-1 ring-blue-500/40 bg-slate-800 shrink-0">
                        <img
                          src={
                            emp.employeePhoto ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                          }
                          alt={emp.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-white text-xs">{emp.name}</p>
                        {emp.sourcePdfName && (
                          <p className="text-[10px] text-slate-400 flex items-center gap-1 truncate max-w-[140px]">
                            <FileText className="w-2.5 h-2.5 text-blue-400" />
                            <span>{emp.sourcePdfName}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Insurance No */}
                  <td className="py-3.5 px-4">
                    {editingIpEmpId === emp.id ? (
                      <div className="flex items-center gap-1.5 min-w-[150px]">
                        <input
                          type="text"
                          maxLength={10}
                          value={editingIpValue}
                          onChange={(e) => setEditingIpValue(e.target.value)}
                          placeholder="10-digit IP No"
                          className="w-28 bg-slate-950 border-2 border-amber-400 rounded-lg px-2 py-1 text-xs font-mono font-bold text-amber-300 focus:outline-none"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveInlineIp(emp.id);
                            if (e.key === 'Escape') handleCancelInlineIp();
                          }}
                        />
                        <button
                          onClick={() => handleSaveInlineIp(emp.id)}
                          title="Save IP Number"
                          className="p-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={handleCancelInlineIp}
                          title="Cancel"
                          className="p-1 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 cursor-pointer"
                        >
                          <CloseIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 group/ip">
                        {!isValidIpNumber(emp.insuranceNo) || emp.insuranceNo === '0000000000' ? (
                          <button
                            type="button"
                            onClick={() => handleStartEditIp(emp)}
                            title="Click to fix IP Number (आईपी नंबर दर्ज करें)"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-mono font-bold text-rose-300 bg-rose-950/80 border border-rose-600/80 text-xs hover:border-amber-400 hover:text-amber-300 transition-all cursor-pointer shadow animate-pulse"
                          >
                            <AlertTriangle className="w-3 h-3 text-rose-400" />
                            <span>{emp.insuranceNo || 'Fix IP No'}</span>
                            <Edit3 className="w-2.5 h-2.5 ml-0.5 text-amber-400" />
                          </button>
                        ) : (
                          <span
                            onClick={() => handleStartEditIp(emp)}
                            title="Click to edit IP Number"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-mono font-bold text-amber-300 bg-amber-950/60 border border-amber-800/60 text-xs hover:border-amber-400 transition-all cursor-pointer"
                          >
                            <span>{emp.insuranceNo}</span>
                            <Edit3 className="w-2.5 h-2.5 opacity-0 group-hover/ip:opacity-100 text-amber-400 transition-opacity" />
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Gender & DOB */}
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-200">{emp.gender}</p>
                    <p className="text-[11px] text-slate-400">DOB: {emp.dob}</p>
                  </td>

                  {/* Father/Husband */}
                  <td className="py-3.5 px-4">
                    <p className="text-slate-200 font-medium">{emp.fatherOrHusbandName}</p>
                    <span className="text-[10px] text-slate-400">({emp.relationType})</span>
                  </td>

                  {/* Mobile & Address */}
                  <td className="py-3.5 px-4">
                    <p className="font-mono text-blue-300 font-semibold">{emp.mobileNo}</p>
                    <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
                      {emp.address}
                    </p>
                  </td>

                  {/* Employer */}
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-200 truncate max-w-[160px]">
                      {emp.employerName}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {emp.employerCode || 'Est. Code: N/A'}
                    </p>
                  </td>

                  {/* ACTION ICONS: View, Edit, Delete, Print */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* VIEW ICON (ID Card Modal) */}
                      <button
                        onClick={() => onViewCard(emp)}
                        title="View Smart ID Card (आईडी कार्ड देखें)"
                        className="p-2 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 transition-all cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* EDIT ICON (Edit Details, Photo, Signature) */}
                      <button
                        onClick={() => onEditEmployee(emp)}
                        title="Edit Details & Upload Photos/Signature (संपादित करें)"
                        className="p-2 rounded-xl bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/30 transition-all cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* PRINT ICON (A4 Side-by-Side Dual Print) */}
                      <button
                        onClick={() => onOpenPrintPreview(emp)}
                        title="A4 Print Preview (A4 प्रिंट प्रीव्यू)"
                        className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 transition-all cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {/* DELETE ICON */}
                      <button
                        onClick={() => setDeleteConfirmId(emp.id)}
                        title="Delete Record (रिकॉर्ड हटाएं)"
                        className="p-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <p className="text-sm font-semibold mb-1">No employee records match your search.</p>
                    <p className="text-xs">Click "Upload PDF Transcript" to parse and save employee data.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-800 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Delete Employee Record?</h3>
                <p className="text-xs text-slate-400">यह रिकॉर्ड डेटाबेस से हमेशा के लिए हट जाएगा।</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const emp = employees.find((e) => e.id === deleteConfirmId);
                  onDeleteEmployee(deleteConfirmId, emp?.name || 'Employee');
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-md shadow-rose-600/30 transition-all cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
