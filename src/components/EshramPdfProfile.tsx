import React from 'react';
import { Printer, ArrowLeft, ShieldCheck } from 'lucide-react';
import { EmployeeRecord, GlobalSettings } from '../types';

interface EshramPdfProfileProps {
  employee: EmployeeRecord;
  settings: GlobalSettings;
  onBack: () => void;
}

export const EshramPdfProfile: React.FC<EshramPdfProfileProps> = ({ employee, settings, onBack }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-900 py-6 px-4 flex flex-col items-center font-sans text-slate-800">
      {/* Top Navigation / Action Bar */}
      <div className="w-full max-w-3xl flex items-center justify-between mb-6 no-print">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border border-slate-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to App</span>
        </button>

        <button
          onClick={handlePrint}
          className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save PDF</span>
        </button>
      </div>

      {/* PDF Document Container (Matches uploaded ESIC e-Pehchan format) */}
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl p-8 border border-slate-200 print:shadow-none print:border-none print:w-full print:max-w-none">
        {/* PDF Header */}
        <div className="border-b-2 border-blue-900 pb-4 mb-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-blue-900" />
              <h1 className="text-sm font-bold text-blue-900 uppercase tracking-wide">
                EMPLOYEES' STATE INSURANCE CORPORATION
              </h1>
            </div>
            <p className="text-[10px] text-slate-600 font-semibold mt-0.5">
              पंचादीप भवन, सी.आई.जी. मार्ग, नई दिल्ली-110 002 / Panchdeep Bhawan, C.I.G. Marg, New Delhi-110 002
            </p>
          </div>
          <div className="text-right">
            <span className="px-3 py-1 bg-blue-900 text-white text-xs font-mono font-bold rounded">
              e-Pehchan Card
            </span>
          </div>
        </div>

        {/* Document Title */}
        <div className="text-center my-3 bg-slate-100 py-1.5 rounded border border-slate-200">
          <h2 className="text-xs font-bold tracking-wider text-slate-800 uppercase">
            Certificate of Registration under ESI Scheme
          </h2>
        </div>

        {/* Section 1: Personal Details */}
        <div className="mb-4">
          <h3 className="text-[11px] font-bold bg-blue-900 text-white px-2 py-1 uppercase tracking-wide mb-2 rounded-t">
            Personal & Registration Details
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11px] px-2">
            <div className="flex justify-between border-b border-slate-100 py-1">
              <span className="font-semibold text-slate-600">Name of IP:</span>
              <span className="font-bold uppercase text-slate-900">{employee.name}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1">
              <span className="font-semibold text-slate-600">Insurance No:</span>
              <span className="font-mono font-bold text-blue-900">{employee.insuranceNo}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1">
              <span className="font-semibold text-slate-600">Date of Birth:</span>
              <span className="font-mono text-slate-800">{employee.dob}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1">
              <span className="font-semibold text-slate-600">Gender / Marital Status:</span>
              <span className="text-slate-800">{employee.gender || 'Male'} / {employee.maritalStatus || 'Unmarried'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1">
              <span className="font-semibold text-slate-600">Father / Husband Name:</span>
              <span className="font-semibold uppercase text-slate-800">{employee.fatherOrHusbandName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1">
              <span className="font-semibold text-slate-600">Mobile Number:</span>
              <span className="font-mono text-slate-800">{employee.mobileNo || 'NA'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1 col-span-2">
              <span className="font-semibold text-slate-600">Permanent Address:</span>
              <span className="text-slate-800 text-right max-w-[400px]">{employee.address || `${employee.city}, ${employee.state}`}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1 col-span-2">
              <span className="font-semibold text-slate-600">Dispensary:</span>
              <span className="text-slate-800">{employee.dispensary || 'Kalambagh Chowk, BH (ESIS Disp.)'}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Current Employer Details */}
        <div className="mb-4">
          <h3 className="text-[11px] font-bold bg-blue-900 text-white px-2 py-1 uppercase tracking-wide mb-2 rounded-t">
            Current Employer Details
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11px] px-2">
            <div className="flex justify-between border-b border-slate-100 py-1">
              <span className="font-semibold text-slate-600">Name of Employer:</span>
              <span className="font-bold uppercase text-slate-900">{employee.employerName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1">
              <span className="font-semibold text-slate-600">Employer's Code No:</span>
              <span className="font-mono text-slate-800">{employee.employerCode || '42001884020000908'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1">
              <span className="font-semibold text-slate-600">Date of Appointment:</span>
              <span className="font-mono text-slate-800">{employee.appointmentDate || '01/05/2023'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1">
              <span className="font-semibold text-slate-600">Branch Office:</span>
              <span className="text-slate-800">DCBO - Muzaffarpur, ESIC</span>
            </div>
          </div>
        </div>

        {/* Section 3: Family Details Table */}
        <div className="mb-4">
          <h3 className="text-[11px] font-bold bg-blue-900 text-white px-2 py-1 uppercase tracking-wide mb-2 rounded-t">
            Family Details
          </h3>
          <table className="w-full text-[10px] border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <th className="p-1.5 text-left border-r border-slate-300">Family Member Name</th>
                <th className="p-1.5 text-left border-r border-slate-300">Relationship</th>
                <th className="p-1.5 text-left border-r border-slate-300 font-mono">Date of Birth</th>
                <th className="p-1.5 text-left">Residing with IP</th>
              </tr>
            </thead>
            <tbody>
              {employee.familyMembers && employee.familyMembers.length > 0 ? (
                employee.familyMembers.map((fam, idx) => (
                  <tr key={idx} className="border-b border-slate-200">
                    <td className="p-1.5 font-semibold border-r border-slate-300">{fam.name}</td>
                    <td className="p-1.5 border-r border-slate-300">{fam.relation}</td>
                    <td className="p-1.5 font-mono border-r border-slate-300">{fam.dob || 'NA'}</td>
                    <td className="p-1.5 font-medium text-emerald-700">Yes</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-2 text-center text-slate-400 italic">No family members registered</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Section 4: Nominee Details */}
        <div className="mb-6">
          <h3 className="text-[11px] font-bold bg-blue-900 text-white px-2 py-1 uppercase tracking-wide mb-2 rounded-t">
            Nominee Details
          </h3>
          <div className="grid grid-cols-3 gap-4 text-[11px] px-2 bg-slate-50 p-2.5 rounded border border-slate-200">
            <div>
              <span className="text-slate-500 block text-[9px] font-semibold">Name of Nominee</span>
              <span className="font-bold text-slate-900">{employee.nominee?.name || 'TULSI KUMARI'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] font-semibold">Relationship</span>
              <span className="font-semibold text-slate-800">{employee.nominee?.relation || 'Spouse'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] font-semibold">Percentage Share</span>
              <span className="font-bold font-mono text-blue-900">100%</span>
            </div>
          </div>
        </div>

        {/* Footer Notes & Signatures */}
        <div className="text-[9px] text-slate-600 space-y-2 border-t border-slate-200 pt-4">
          <p className="italic">
            Note: This e-Pehchan card affixed with photograph of family & duly attested by the Employer/e-Pehchan Staff shall be produced for availing cash/medical benefits. e-Pehchan card is a proof of registration under ESI scheme[cite: 2].
          </p>

          <div className="flex justify-between items-end pt-8 mt-4 text-[10px] font-semibold text-slate-800">
            <div className="text-center">
              <div className="h-10 flex items-end justify-center">
                <span className="text-[9px] text-slate-400 italic">Signed electronically</span>
              </div>
              <div className="border-t border-slate-400 pt-1 w-40">
                Signature/LTI of Employee / IP[cite: 2]
              </div>
            </div>

            <div className="text-center">
              <div className="h-10 flex items-end justify-center">
                <span className="text-[9px] text-slate-400 italic">Authorized</span>
              </div>
              <div className="border-t border-slate-400 pt-1 w-40">
                Signature / Stamp of Employer[cite: 2]
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
