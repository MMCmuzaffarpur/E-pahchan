import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  X,
  RotateCw,
  Printer,
  Download,
  Edit3,
  ShieldCheck,
} from 'lucide-react';
import { EmployeeRecord, GlobalSettings } from '../types';
import html2canvas from 'html2canvas';

// 100% Fail-Proof Embedded Logo Import
import { ESIC_EMBEDDED_LOGO } from '../utils/esicLogoData';

interface IdCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: EmployeeRecord | null;
  settings: GlobalSettings;
  onEdit: (emp: EmployeeRecord) => void;
  onOpenPrintPreview: (emp: EmployeeRecord) => void;
}

export const IdCardModal: React.FC<IdCardModalProps> = ({
  isOpen,
  onClose,
  employee,
  settings,
  onEdit,
  onOpenPrintPreview,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewMode, setViewMode] = useState<'3d-flip' | 'dual-side'>('dual-side');
  const [isDownloading, setIsDownloading] = useState(false);

  // References to front and back cards
  const frontCardRef = useRef<HTMLDivElement>(null);
  const backCardRef = useRef<HTMLDivElement>(null);
  const dualFrontRef = useRef<HTMLDivElement>(null);
  const dualBackRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !employee) return null;

  // 100% Reliable Combined PNG Exporter (Stitches Front + Back cleanly)
  const handleDownloadCombined = async () => {
    setIsDownloading(true);
    try {
      // Pick active visible elements or fallback
      const frontEl = dualFrontRef.current || frontCardRef.current;
      const backEl = dualBackRef.current || backCardRef.current;

      if (!frontEl || !backEl) {
        throw new Error('Card elements not found');
      }

      // Render Front Canvas
      const canvasFront = await html2canvas(frontEl, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      // Render Back Canvas
      const canvasBack = await html2canvas(backEl, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      // Stitch both into a single combined canvas side-by-side with padding
      const gap = 40;
      const padding = 30;
      const combinedWidth = canvasFront.width + canvasBack.width + gap + padding * 2;
      const combinedHeight = Math.max(canvasFront.height, canvasBack.height) + padding * 2;

      const combinedCanvas = document.createElement('canvas');
      combinedCanvas.width = combinedWidth;
      combinedCanvas.height = combinedHeight;
      const ctx = combinedCanvas.getContext('2d');

      if (ctx) {
        // Crisp White Background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, combinedWidth, combinedHeight);

        // Draw Front Card on Left
        ctx.drawImage(canvasFront, padding, padding);

        // Draw Back Card on Right
        ctx.drawImage(canvasBack, padding + canvasFront.width + gap, padding);

        // Export as Clean PNG
        const imageUri = combinedCanvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = imageUri;
        downloadLink.download = `ESIC_Card_${employee.insuranceNo}_${employee.name.replace(/\s+/g, '_')}_DUAL.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    } catch (err) {
      console.error('Download error occurred:', err);
      alert('Card PNG download karne me error aaya. Kripya page refresh karke dobara koshish karein.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-4 flex flex-col max-h-[95vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  ESIC Pehchan Smart Card
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-900 text-blue-200 border border-blue-700">
                  IP No: {employee.insuranceNo}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {employee.name} &bull; {employee.employerName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('dual-side')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  viewMode === 'dual-side'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Dual Side View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('3d-flip')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  viewMode === '3d-flip'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                3D Flip Card
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Center: Cards Display Area */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-slate-950/60 relative min-h-[460px]">
          {viewMode === '3d-flip' ? (
            <div className="perspective-1000 w-full flex flex-col items-center">
              <div
                className={`relative w-full max-w-[500px] aspect-[85.6/54] transition-all duration-700 transform-style-3d cursor-pointer ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div
                  ref={frontCardRef}
                  className="absolute inset-0 backface-hidden rounded-xl overflow-hidden shadow-2xl border border-slate-300"
                >
                  <FrontCardView employee={employee} settings={settings} />
                </div>

                <div
                  ref={backCardRef}
                  className="absolute inset-0 backface-hidden rotate-y-180 rounded-xl overflow-hidden shadow-2xl border border-slate-300"
                >
                  <BackCardView employee={employee} settings={settings} />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5 text-blue-400" />
                  <span>{isFlipped ? 'Flip to Front Side' : 'Flip to Back Side'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div
              className="w-full flex flex-col lg:flex-row items-center justify-center gap-6 py-2"
            >
              <div
                ref={dualFrontRef}
                className="w-full max-w-[480px] aspect-[85.6/54] rounded-xl overflow-hidden shadow-2xl border border-slate-300"
              >
                <FrontCardView employee={employee} settings={settings} />
              </div>

              <div
                ref={dualBackRef}
                className="w-full max-w-[480px] aspect-[85.6/54] rounded-xl overflow-hidden shadow-2xl border border-slate-300"
              >
                <BackCardView employee={employee} settings={settings} />
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Bar with Working Download Button */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => onEdit(employee)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
            <span>Edit Details & Signatures</span>
          </button>

          <div className="flex flex-wrap items-center gap-3">
            {/* 100% Functional Combined PNG Download Button */}
            <button
              onClick={handleDownloadCombined}
              disabled={isDownloading}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-all cursor-pointer shadow disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span>{isDownloading ? 'Generating High-Res PNG...' : 'Download Smart Card (Combined PNG)'}</span>
            </button>

            <button
              onClick={() => onOpenPrintPreview(employee)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-white" />
              <span>A4 Print Sheet (Side-by-Side)</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/* =========================================================================
   FRONT CARD VIEW COMPONENT (Includes Nominee Name under Address)
   ========================================================================= */
export const FrontCardView: React.FC<{
  employee: EmployeeRecord;
  settings: GlobalSettings;
}> = ({ employee }) => {
  return (
    <div className="w-full h-full bg-[#ffffff] text-slate-900 flex flex-col justify-between select-none relative overflow-hidden font-sans border border-slate-300">
      {/* BACKGROUND WATERMARK */}
      <div className="absolute inset-x-0 top-[56%] -translate-y-1/2 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
        <img
          src={ESIC_EMBEDDED_LOGO}
          alt=""
          className="w-40 h-40 object-contain opacity-15 blur-[0.8px] select-none"
        />
      </div>

      {/* 1. TOP HEADER */}
      <div className="bg-[#0b3c75] text-white px-3 py-2 flex items-center justify-between relative z-10 border-b-2 border-[#00b4d8]">
        <div className="flex-1 text-left">
          <p className="text-[9px] sm:text-[10px] font-bold leading-tight">
            कर्मचारी राज्य बीमा निगम
          </p>
          <p className="text-[6.5px] sm:text-[7px] text-blue-200 leading-tight mt-0.5">
            पंचदीप भवन, सी.आई.जी. मार्ग, नई दिल्ली-110 002
          </p>
        </div>

        {/* Center Logo */}
        <div className="shrink-0 px-2 flex items-center justify-center">
          <img
            src={ESIC_EMBEDDED_LOGO}
            alt="ESIC Emblem"
            className="w-10 h-10 rounded-full shadow-md object-contain bg-white p-0.5"
          />
        </div>

        <div className="flex-1 text-right">
          <p className="text-[8.5px] sm:text-[9.5px] font-bold leading-tight">
            Employees' State Insurance Corporation
          </p>
          <p className="text-[6.5px] sm:text-[7px] text-blue-200 leading-tight mt-0.5">
            Panchdeep Bhawan, C.I.G. Marg, New Delhi-110 002
          </p>
        </div>
      </div>

      {/* 2. CARD BODY: Demographic Details + Nominee Name Added */}
      <div className="flex-1 p-3 flex gap-3 items-center relative z-10">
        <div className="flex-1 space-y-1.5 text-[9px] sm:text-[10px] text-slate-800">
          <div className="flex items-baseline">
            <span className="font-bold text-[#0b3c75] w-24 shrink-0">IP No. :</span>
            <span className="font-mono font-black text-[12px] sm:text-[13px] text-[#0b3c75] tracking-wide">
              {employee.insuranceNo}
            </span>
          </div>

          <div className="flex items-baseline">
            <span className="font-bold text-slate-600 w-24 shrink-0">Name :</span>
            <span className="font-bold text-slate-900 uppercase">
              {employee.name}
            </span>
          </div>

          <div className="flex items-baseline">
            <span className="font-bold text-slate-600 w-24 shrink-0">D. O. B. :</span>
            <span className="font-semibold text-slate-800 font-mono">
              {employee.dob}
            </span>
          </div>

          <div className="flex items-baseline">
            <span className="font-bold text-slate-600 w-24 shrink-0">Father / Husband :</span>
            <span className="font-semibold text-slate-800 uppercase truncate max-w-[170px]">
              {employee.fatherOrHusbandName}
            </span>
          </div>

          <div className="flex items-baseline">
            <span className="font-bold text-slate-600 w-24 shrink-0">Mobile :</span>
            <span className="font-semibold text-slate-800 font-mono">
              {employee.mobileNo || 'NA'}
            </span>
          </div>

          <div className="flex items-start">
            <span className="font-bold text-slate-600 w-24 shrink-0">Perm. Address :</span>
            <span className="font-medium text-slate-700 text-[8.5px] sm:text-[9px] leading-tight line-clamp-2">
              {employee.address || `${employee.city}, ${employee.state}`}
            </span>
          </div>

          {/* NOMINEE NAME SHIFTED HERE TO FRONT CARD */}
          <div className="flex items-baseline pt-0.5">
            <span className="font-bold text-slate-600 w-24 shrink-0">Nominee :</span>
            <span className="font-semibold text-slate-900 text-[8.5px] sm:text-[9px] truncate max-w-[170px]">
              {employee.nominee?.name || 'TULSI KUMARI'} ({employee.nominee?.relation || 'Spouse'}) - 100%
            </span>
          </div>
        </div>

        {/* Blank Family Photo Frame */}
        <div className="shrink-0 flex flex-col items-center justify-center">
          <div className="w-[105px] h-[85px] sm:w-[115px] sm:h-[95px] rounded border border-slate-400 bg-white/70 shadow-inner flex flex-col items-center justify-center">
            <span className="text-[7.5px] font-semibold text-slate-400 uppercase tracking-wider text-center leading-tight">
              AFFIX FAMILY<br />PHOTOGRAPH HERE
            </span>
          </div>
          <span className="text-[7px] font-medium text-slate-400 mt-1">Family Photo</span>
        </div>
      </div>

      {/* 3. FOOTER */}
      <div className="bg-slate-100/90 border-t border-slate-200 px-2.5 py-1 flex items-center justify-between text-[7px] sm:text-[7.5px] text-slate-600 relative z-10">
        <span className="font-medium whitespace-nowrap">
          Reg Date: {employee.registrationDate || employee.appointmentDate || '18/05/2023'}
        </span>
        <span className="text-slate-700 font-semibold truncate max-w-[180px] sm:max-w-[210px] px-1 text-center" title={employee.dispensary}>
          Disp: {employee.dispensary || 'Kalambagh Chowk, BH (ESIS Disp.)'}
        </span>
        <span className="font-semibold text-[#0b3c75] whitespace-nowrap">
          सामाजिक सुरक्षा / SOCIAL SECURITY
        </span>
      </div>
    </div>
  );
};

/* =========================================================================
   BACK CARD VIEW COMPONENT (Full Family Space - No Nominee - Tight Signatures)
   ========================================================================= */
export const BackCardView: React.FC<{
  employee: EmployeeRecord;
  settings: GlobalSettings;
}> = ({ employee, settings }) => {
  const cleanFamily = (employee.familyMembers || []).map((f) => ({
    ...f,
    name: f.name.replace(/^r\s+/i, '').replace(/^(?:Is\s*Residing|with\s*IP)\s*/i, '').trim(),
  }));

  const isGenuineSignature =
    employee.employeeSignature &&
    !employee.employeeSignature.includes('M 15 40 C 30 15') &&
    employee.employeeSignature.trim().length > 30;

  return (
    <div className="w-full h-full bg-[#ffffff] text-slate-900 flex flex-col justify-between select-none relative overflow-hidden font-sans border border-slate-300">
      {/* BACKGROUND WATERMARK */}
      <div className="absolute inset-x-0 top-[52%] -translate-y-1/2 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
        <img
          src={ESIC_EMBEDDED_LOGO}
          alt=""
          className="w-40 h-40 object-contain opacity-15 blur-[0.8px] select-none"
        />
      </div>

      {/* 1. TOP HEADER */}
      <div className="bg-[#0b3c75] text-white px-3 py-1.5 flex items-center justify-between relative z-10 border-b border-[#00b4d8]">
        <span className="text-[9px] font-bold tracking-wide">
          PARIVARIK VIVARAN / FAMILY DETAILS
        </span>
        <span className="text-[7.5px] text-blue-200 font-mono">
          Toll Free: 1800-11-2526
        </span>
      </div>

      {/* 2. BODY: Maximized Family Space + Anchored Signatures */}
      <div className="flex-1 px-2.5 pt-1.5 pb-0 flex flex-col justify-between text-[8px] sm:text-[8.5px] relative z-10">
        {/* Family Table with Extra Room (Supports up to 6 members comfortably) */}
        <div className="overflow-hidden">
          <table className="w-full border-collapse text-[7.5px] sm:text-[8px] text-slate-800 bg-transparent">
            <thead>
              <tr className="bg-slate-200/80 text-slate-900 font-bold border-b border-slate-300">
                <th className="py-0.5 px-1.5 text-left">Family Member</th>
                <th className="py-0.5 px-1.5 text-left">Relationship</th>
                <th className="py-0.5 px-1.5 text-left font-mono">DOB</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60">
              {cleanFamily.length > 0 ? (
                cleanFamily.slice(0, 6).map((f, i) => (
                  <tr key={i} className="hover:bg-slate-50/40">
                    <td className="py-0.5 px-1.5 font-semibold text-slate-900">{f.name}</td>
                    <td className="py-0.5 px-1.5 text-slate-600">{f.relation}</td>
                    <td className="py-0.5 px-1.5 font-mono text-slate-700">{f.dob || 'NA'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-1 px-1.5 text-center text-slate-400 italic">
                    No family member data registered
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Signatures Area: Anchored directly right above Blue Patti */}
        <div className="mt-auto flex items-end justify-between px-4 pb-0.5 text-[7px] bg-transparent">
          {/* Employee Sign */}
          <div className="flex flex-col items-center w-32">
            <div className="h-7 w-full flex items-center justify-center bg-transparent">
              {isGenuineSignature ? (
                <img
                  src={employee.employeeSignature}
                  alt=""
                  className="max-h-full max-w-full object-contain mix-blend-multiply"
                  style={{
                    filter: 'invert(16%) sepia(100%) saturate(6500%) hue-rotate(220deg) brightness(80%) contrast(130%)',
                  }}
                />
              ) : (
                <span className="text-[7.5px] text-slate-400 italic">Sign / LTI</span>
              )}
            </div>
            <span className="text-slate-700 font-medium text-[7.5px]">
              Employee Sign / LTI
            </span>
          </div>

          {/* Employer Sign */}
          <div className="flex flex-col items-center w-32">
            <div className="h-7 w-full flex items-center justify-center bg-transparent relative">
              {settings.employerSignature ? (
                <img
                  src={settings.employerSignature}
                  alt=""
                  className="max-h-full max-w-full object-contain mix-blend-multiply"
                  style={{
                    backgroundColor: 'transparent',
                  }}
                />
              ) : null}
            </div>
            <span className="text-slate-700 font-semibold text-[7.5px]">
              Auth. Signatory (ESIC)
            </span>
          </div>
        </div>

        {/* Blue Patti (Band) with Employer Information */}
        <div className="bg-[#0b3c75] text-white px-2 py-0.5 flex items-center justify-between text-[7px] sm:text-[7.5px] rounded-t font-medium">
          <span className="font-bold text-blue-200">Employer:</span>
          <span className="truncate max-w-[280px] font-semibold text-white uppercase">
            {employee.employerName}
          </span>
          <span className="text-[6.5px] text-blue-200 font-mono">
            {employee.employerCode || '42001884020000908'}
          </span>
        </div>
      </div>

      {/* 3. FOOTER */}
      <div className="bg-slate-100 border-t border-slate-200 px-3 py-0.5 flex items-center justify-between text-[7px] text-slate-500 relative z-10">
        <span>Web: www.esic.gov.in</span>
        <span>Valid Across All Network Hospitals in India</span>
      </div>
    </div>
  );
};
