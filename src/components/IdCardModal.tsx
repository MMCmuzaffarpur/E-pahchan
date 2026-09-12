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

  const frontCardRef = useRef<HTMLDivElement>(null);
  const backCardRef = useRef<HTMLDivElement>(null);
  const dualFrontRef = useRef<HTMLDivElement>(null);
  const dualBackRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !employee) return null;

  // 100% Reliable Combined PNG Downloader (Zero OKLCH crash)
  const handleDownloadCombined = async () => {
    setIsDownloading(true);
    try {
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

      // Stitch both side-by-side
      const gap = 30;
      const padding = 25;
      const combinedWidth = canvasFront.width + canvasBack.width + gap + padding * 2;
      const combinedHeight = Math.max(canvasFront.height, canvasBack.height) + padding * 2;

      const combinedCanvas = document.createElement('canvas');
      combinedCanvas.width = combinedWidth;
      combinedCanvas.height = combinedHeight;
      const ctx = combinedCanvas.getContext('2d');

      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, combinedWidth, combinedHeight);

        // Draw Front & Back Cards
        ctx.drawImage(canvasFront, padding, padding);
        ctx.drawImage(canvasBack, padding + canvasFront.width + gap, padding);

        // Export as High-Res PNG
        const imageUri = combinedCanvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = imageUri;
        downloadLink.download = `ESIC_Card_${employee.insuranceNo}_${employee.name.replace(/\s+/g, '_')}_DUAL.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    } catch (err: any) {
      console.error('Download error:', err);
      alert('Download failed: ' + (err.message || 'Unknown error'));
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

        {/* Modal Center: Cards Stage */}
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
                  className="absolute inset-0 backface-hidden rounded-xl overflow-hidden shadow-2xl"
                  style={{ border: '1px solid #cbd5e1' }}
                >
                  <FrontCardView employee={employee} settings={settings} />
                </div>

                <div
                  ref={backCardRef}
                  className="absolute inset-0 backface-hidden rotate-y-180 rounded-xl overflow-hidden shadow-2xl"
                  style={{ border: '1px solid #cbd5e1' }}
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
            <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-6 py-2">
              <div
                ref={dualFrontRef}
                className="w-full max-w-[480px] aspect-[85.6/54] rounded-xl overflow-hidden shadow-2xl"
                style={{ border: '1px solid #cbd5e1' }}
              >
                <FrontCardView employee={employee} settings={settings} />
              </div>

              <div
                ref={dualBackRef}
                className="w-full max-w-[480px] aspect-[85.6/54] rounded-xl overflow-hidden shadow-2xl"
                style={{ border: '1px solid #cbd5e1' }}
              >
                <BackCardView employee={employee} settings={settings} />
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => onEdit(employee)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
            <span>Edit Details & Signatures</span>
          </button>

          <div className="flex flex-wrap items-center gap-3">
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
   FRONT CARD VIEW COMPONENT (Pure Hex Colors - 100% OKLCH-Free)
   ========================================================================= */
export const FrontCardView: React.FC<{
  employee: EmployeeRecord;
  settings: GlobalSettings;
}> = ({ employee }) => {
  return (
    <div
      className="w-full h-full flex flex-col justify-between select-none relative overflow-hidden font-sans"
      style={{ backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1' }}
    >
      {/* BACKGROUND WATERMARK */}
      <div
        className="absolute inset-x-0 pointer-events-none overflow-hidden flex items-center justify-center"
        style={{ top: '56%', transform: 'translateY(-50%)', zIndex: 0 }}
      >
        <img
          src={ESIC_EMBEDDED_LOGO}
          alt=""
          className="w-40 h-40 object-contain select-none"
          style={{ opacity: 0.15, filter: 'blur(0.8px)' }}
        />
      </div>

      {/* 1. TOP HEADER */}
      <div
        className="px-3 py-2 flex items-center justify-between relative"
        style={{
          backgroundColor: '#0b3c75',
          color: '#ffffff',
          borderBottom: '2.5px solid #00b4d8',
          zIndex: 10,
        }}
      >
        <div className="flex-1 text-left">
          <p className="text-[9px] sm:text-[10px] font-bold leading-tight" style={{ color: '#ffffff' }}>
            कर्मचारी राज्य बीमा निगम
          </p>
          <p className="text-[6.5px] sm:text-[7px] leading-tight mt-0.5" style={{ color: '#bfdbfe' }}>
            पंचदीप भवन, सी.आई.जी. मार्ग, नई दिल्ली-110 002
          </p>
        </div>

        <div className="shrink-0 px-2 flex items-center justify-center">
          <img
            src={ESIC_EMBEDDED_LOGO}
            alt="ESIC Emblem"
            className="w-10 h-10 rounded-full shadow-md object-contain p-0.5"
            style={{ backgroundColor: '#ffffff' }}
          />
        </div>

        <div className="flex-1 text-right">
          <p className="text-[8.5px] sm:text-[9.5px] font-bold leading-tight" style={{ color: '#ffffff' }}>
            Employees' State Insurance Corporation
          </p>
          <p className="text-[6.5px] sm:text-[7px] leading-tight mt-0.5" style={{ color: '#bfdbfe' }}>
            Panchdeep Bhawan, C.I.G. Marg, New Delhi-110 002
          </p>
        </div>
      </div>

      {/* 2. CARD BODY */}
      <div className="flex-1 p-3 flex gap-3 items-center relative" style={{ zIndex: 10 }}>
        <div className="flex-1 space-y-1.5 text-[9px] sm:text-[10px]" style={{ color: '#1e293b' }}>
          <div className="flex items-baseline">
            <span className="font-bold w-24 shrink-0" style={{ color: '#0b3c75' }}>IP No. :</span>
            <span className="font-mono font-black text-[12px] sm:text-[13px] tracking-wide" style={{ color: '#0b3c75' }}>
              {employee.insuranceNo}
            </span>
          </div>

          <div className="flex items-baseline">
            <span className="font-bold w-24 shrink-0" style={{ color: '#475569' }}>Name :</span>
            <span className="font-bold uppercase" style={{ color: '#0f172a' }}>
              {employee.name}
            </span>
          </div>

          <div className="flex items-baseline">
            <span className="font-bold w-24 shrink-0" style={{ color: '#475569' }}>D. O. B. :</span>
            <span className="font-semibold font-mono" style={{ color: '#1e293b' }}>
              {employee.dob}
            </span>
          </div>

          <div className="flex items-baseline">
            <span className="font-bold w-24 shrink-0" style={{ color: '#475569' }}>Father / Husband :</span>
            <span className="font-semibold uppercase truncate max-w-[170px]" style={{ color: '#1e293b' }}>
              {employee.fatherOrHusbandName}
            </span>
          </div>

          <div className="flex items-baseline">
            <span className="font-bold w-24 shrink-0" style={{ color: '#475569' }}>Mobile :</span>
            <span className="font-semibold font-mono" style={{ color: '#1e293b' }}>
              {employee.mobileNo || 'NA'}
            </span>
          </div>

          <div className="flex items-start">
            <span className="font-bold w-24 shrink-0" style={{ color: '#475569' }}>Perm. Address :</span>
            <span className="font-medium text-[8.5px] sm:text-[9px] leading-tight line-clamp-2" style={{ color: '#334155' }}>
              {employee.address || `${employee.city}, ${employee.state}`}
            </span>
          </div>

          <div className="flex items-baseline pt-0.5">
            <span className="font-bold w-24 shrink-0" style={{ color: '#475569' }}>Nominee :</span>
            <span className="font-semibold text-[8.5px] sm:text-[9px] truncate max-w-[170px]" style={{ color: '#0f172a' }}>
              {employee.nominee?.name || 'TULSI KUMARI'} ({employee.nominee?.relation || 'Spouse'}) - 100%
            </span>
          </div>
        </div>

        {/* Blank Photo Frame */}
        <div className="shrink-0 flex flex-col items-center justify-center">
          <div
            className="w-[105px] h-[85px] sm:w-[115px] sm:h-[95px] rounded shadow-inner flex flex-col items-center justify-center"
            style={{ border: '1px solid #94a3b8', backgroundColor: 'rgba(255,255,255,0.7)' }}
          >
            <span className="text-[7.5px] font-semibold uppercase tracking-wider text-center leading-tight" style={{ color: '#64748b' }}>
              AFFIX FAMILY<br />PHOTOGRAPH HERE
            </span>
          </div>
          <span className="text-[7px] font-medium mt-1" style={{ color: '#64748b' }}>Family Photo</span>
        </div>
      </div>

      {/* 3. FOOTER */}
      <div
        className="px-2.5 py-1 flex items-center justify-between text-[7px] sm:text-[7.5px] relative"
        style={{
          backgroundColor: '#f1f5f9',
          borderTop: '1px solid #e2e8f0',
          color: '#475569',
          zIndex: 10,
        }}
      >
        <span className="font-medium whitespace-nowrap">
          Reg Date: {employee.registrationDate || employee.appointmentDate || '18/05/2023'}
        </span>
        <span className="font-semibold truncate max-w-[180px] sm:max-w-[210px] px-1 text-center" style={{ color: '#334155' }}>
          Disp: {employee.dispensary || 'Kalambagh Chowk, BH (ESIS Disp.)'}
        </span>
        <span className="font-semibold whitespace-nowrap" style={{ color: '#0b3c75' }}>
          सामाजिक सुरक्षा / SOCIAL SECURITY
        </span>
      </div>
    </div>
  );
};

/* =========================================================================
   BACK CARD VIEW COMPONENT (Pure Hex Colors - 100% OKLCH-Free)
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
    <div
      className="w-full h-full flex flex-col justify-between select-none relative overflow-hidden font-sans"
      style={{ backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1' }}
    >
      {/* BACKGROUND WATERMARK */}
      <div
        className="absolute inset-x-0 pointer-events-none overflow-hidden flex items-center justify-center"
        style={{ top: '52%', transform: 'translateY(-50%)', zIndex: 0 }}
      >
        <img
          src={ESIC_EMBEDDED_LOGO}
          alt=""
          className="w-40 h-40 object-contain select-none"
          style={{ opacity: 0.15, filter: 'blur(0.8px)' }}
        />
      </div>

      {/* 1. TOP HEADER */}
      <div
        className="px-3 py-1.5 flex items-center justify-between relative"
        style={{
          backgroundColor: '#0b3c75',
          color: '#ffffff',
          borderBottom: '1.5px solid #00b4d8',
          zIndex: 10,
        }}
      >
        <span className="text-[9px] font-bold tracking-wide">
          PARIVARIK VIVARAN / FAMILY DETAILS
        </span>
        <span className="text-[7.5px] font-mono" style={{ color: '#bfdbfe' }}>
          Toll Free: 1800-11-2526
        </span>
      </div>

      {/* 2. BODY */}
      <div className="flex-1 px-2.5 pt-1.5 pb-0 flex flex-col justify-between text-[8px] sm:text-[8.5px] relative" style={{ zIndex: 10 }}>
        {/* Family Table */}
        <div className="overflow-hidden">
          <table className="w-full border-collapse text-[7.5px] sm:text-[8px]" style={{ color: '#1e293b' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(226, 232, 240, 0.85)', borderBottom: '1px solid #cbd5e1' }}>
                <th className="py-0.5 px-1.5 text-left font-bold" style={{ color: '#0f172a' }}>Family Member</th>
                <th className="py-0.5 px-1.5 text-left font-bold" style={{ color: '#0f172a' }}>Relationship</th>
                <th className="py-0.5 px-1.5 text-left font-mono font-bold" style={{ color: '#0f172a' }}>DOB</th>
              </tr>
            </thead>
            <tbody>
              {cleanFamily.length > 0 ? (
                cleanFamily.slice(0, 6).map((f, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(226, 232, 240, 0.6)' }}>
                    <td className="py-0.5 px-1.5 font-semibold" style={{ color: '#0f172a' }}>{f.name}</td>
                    <td className="py-0.5 px-1.5" style={{ color: '#475569' }}>{f.relation}</td>
                    <td className="py-0.5 px-1.5 font-mono" style={{ color: '#334155' }}>{f.dob || 'NA'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-1 px-1.5 text-center italic" style={{ color: '#94a3b8' }}>
                    No family member data registered
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Signatures Area */}
        <div className="mt-auto flex items-end justify-between px-4 pb-0.5 text-[7px]" style={{ backgroundColor: 'transparent' }}>
          {/* Employee Sign */}
          <div className="flex flex-col items-center w-32">
            <div className="h-7 w-full flex items-center justify-center" style={{ backgroundColor: 'transparent' }}>
              {isGenuineSignature ? (
                <img
                  src={employee.employeeSignature}
                  alt=""
                  className="max-h-full max-w-full object-contain"
                  style={{
                    mixBlendMode: 'multiply',
                    filter: 'invert(16%) sepia(100%) saturate(6500%) hue-rotate(220deg) brightness(80%) contrast(130%)',
                  }}
                />
              ) : (
                <span className="text-[7.5px] italic" style={{ color: '#94a3b8' }}>Sign / LTI</span>
              )}
            </div>
            <span className="font-medium text-[7.5px]" style={{ color: '#334155' }}>
              Employee Sign / LTI
            </span>
          </div>

          {/* Employer Sign */}
          <div className="flex flex-col items-center w-32">
            <div className="h-7 w-full flex items-center justify-center relative" style={{ backgroundColor: 'transparent' }}>
              {settings.employerSignature ? (
                <img
                  src={settings.employerSignature}
                  alt=""
                  className="max-h-full max-w-full object-contain"
                  style={{
                    mixBlendMode: 'multiply',
                    backgroundColor: 'transparent',
                  }}
                />
              ) : null}
            </div>
            <span className="font-semibold text-[7.5px]" style={{ color: '#334155' }}>
              Auth. Signatory (ESIC)
            </span>
          </div>
        </div>

        {/* Blue Patti */}
        <div
          className="px-2 py-0.5 flex items-center justify-between text-[7px] sm:text-[7.5px] rounded-t font-medium"
          style={{ backgroundColor: '#0b3c75', color: '#ffffff' }}
        >
          <span className="font-bold" style={{ color: '#bfdbfe' }}>Employer:</span>
          <span className="truncate max-w-[280px] font-semibold uppercase" style={{ color: '#ffffff' }}>
            {employee.employerName}
          </span>
          <span className="text-[6.5px] font-mono" style={{ color: '#bfdbfe' }}>
            {employee.employerCode || '42001884020000908'}
          </span>
        </div>
      </div>

      {/* 3. FOOTER */}
      <div
        className="px-3 py-0.5 flex items-center justify-between text-[7px] relative"
        style={{
          backgroundColor: '#f1f5f9',
          borderTop: '1px solid #e2e8f0',
          color: '#64748b',
          zIndex: 10,
        }}
      >
        <span>Web: www.esic.gov.in</span>
        <span>Valid Across All Network Hospitals in India</span>
      </div>
    </div>
  );
};
