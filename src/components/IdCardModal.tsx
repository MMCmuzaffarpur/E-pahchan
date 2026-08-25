import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  X,
  RotateCw,
  Printer,
  Download,
  Edit3,
  Building2,
  Phone,
  Calendar,
  User,
  ShieldCheck,
  QrCode,
  Sparkles,
  MapPin,
  HeartHandshake,
  Layers,
} from 'lucide-react';
import { EmployeeRecord, GlobalSettings } from '../types';
import html2canvas from 'html2canvas';

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
  const [viewMode, setViewMode] = useState<'3d-flip' | 'dual-side'>('3d-flip');
  const [isDownloading, setIsDownloading] = useState(false);

  const frontCardRef = useRef<HTMLDivElement>(null);
  const backCardRef = useRef<HTMLDivElement>(null);
  const dualContainerRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !employee) return null;

  const handleDownload = async (target: 'front' | 'back' | 'both') => {
    setIsDownloading(true);
    try {
      let elementToCapture: HTMLElement | null = null;
      let filename = `ID_Card_${employee.insuranceNo}_${employee.name.replace(/\s+/g, '_')}`;

      if (target === 'front' && frontCardRef.current) {
        elementToCapture = frontCardRef.current;
        filename += '_FRONT.png';
      } else if (target === 'back' && backCardRef.current) {
        elementToCapture = backCardRef.current;
        filename += '_BACK.png';
      } else if (dualContainerRef.current) {
        elementToCapture = dualContainerRef.current;
        filename += '_COMBINED.png';
      }

      if (elementToCapture) {
        const canvas = await html2canvas(elementToCapture, {
          scale: 3, // High DPI for crystal clear print/export
          useCORS: true,
          backgroundColor: '#0f172a',
        });
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = filename;
        link.click();
      }
    } catch (err) {
      console.error('Download error:', err);
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Smart Employee ID Card</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800">
                  IP: {employee.insuranceNo}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {employee.name} &bull; {employee.employerName}
              </p>
            </div>
          </div>

          {/* Top Controls */}
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="hidden sm:flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
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
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Center Area (Card Stage) */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-slate-950/70 relative min-h-[460px]">
          {viewMode === '3d-flip' ? (
            /* 3D Flippable Card Stage */
            <div className="perspective-1000 w-full flex flex-col items-center">
              <div
                className={`relative w-full max-w-[500px] aspect-[85.6/54] transition-all duration-700 transform-style-3d cursor-pointer ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                {/* Front Side */}
                <div
                  ref={frontCardRef}
                  className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden shadow-2xl border border-blue-400/30"
                >
                  <FrontCardView employee={employee} settings={settings} />
                </div>

                {/* Back Side */}
                <div
                  ref={backCardRef}
                  className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl overflow-hidden shadow-2xl border border-blue-400/30"
                >
                  <BackCardView employee={employee} settings={settings} />
                </div>
              </div>

              {/* Flip Helper Hint */}
              <div className="flex items-center gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5 text-blue-400" />
                  <span>
                    {isFlipped ? 'Flip to Front Side (आगे का भाग)' : 'Flip to Back Side (पीछे का भाग)'}
                  </span>
                </button>
                <span className="text-[11px] text-slate-500">
                  (Card par click karke bhi flip kar sakte hain)
                </span>
              </div>
            </div>
          ) : (
            /* Dual Side View (Front & Back Side-by-Side) */
            <div
              ref={dualContainerRef}
              className="w-full flex flex-col lg:flex-row items-center justify-center gap-6 py-2"
            >
              {/* Front Card Container */}
              <div className="w-full max-w-[460px] aspect-[85.6/54] rounded-2xl overflow-hidden shadow-2xl border border-blue-400/30">
                <FrontCardView employee={employee} settings={settings} />
              </div>

              {/* Back Card Container */}
              <div className="w-full max-w-[460px] aspect-[85.6/54] rounded-2xl overflow-hidden shadow-2xl border border-blue-400/30">
                <BackCardView employee={employee} settings={settings} />
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(employee)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-400" />
              <span>Edit Details & Photos</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Download dropdown / buttons */}
            <button
              onClick={() => handleDownload('front')}
              disabled={isDownloading}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Front PNG</span>
            </button>

            <button
              onClick={() => handleDownload('back')}
              disabled={isDownloading}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Back PNG</span>
            </button>

            {/* Print Button with A4 side-by-side print preview */}
            <button
              onClick={() => onOpenPrintPreview(employee)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>A4 Print Preview (Front Right & Back Left)</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/* =========================================================================
   FRONT CARD VIEW COMPONENT (Ultra-Stylish Gold/Blue Sovereign Government Spec)
   ========================================================================= */
export const FrontCardView: React.FC<{
  employee: EmployeeRecord;
  settings: GlobalSettings;
}> = ({ employee, settings }) => {
  return (
    <div className="w-full h-full bg-gradient-to-br from-[#0c2340] via-[#103058] to-[#0a1c33] text-white flex flex-col justify-between p-3.5 sm:p-4 select-none relative overflow-hidden font-sans">
      {/* Background Guilloche Security Texture Lines */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
      <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-48 h-48 rounded-full bg-blue-400/10 blur-2xl pointer-events-none" />

      {/* Top Header Section */}
      <div className="relative z-10">
        <div className="flex items-center justify-between border-b border-amber-400/30 pb-2">
          <div className="flex items-center gap-2.5">
            <img
              src={settings.organizationLogo}
              alt="Logo"
              className="w-8 h-8 rounded-full shadow-md bg-white p-0.5 shrink-0"
            />
            <div>
              <p className="text-[9px] sm:text-[10px] font-extrabold text-amber-400 uppercase tracking-wider leading-tight">
                {settings.organizationName}
              </p>
              <p className="text-[7.5px] sm:text-[8.5px] text-slate-300 font-semibold tracking-wide">
                e-Pehchan Smart Identity Card / पहचान पत्र
              </p>
            </div>
          </div>

          {/* Hologram Badge */}
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-300 via-amber-100 to-amber-400 p-0.5 shadow-md flex items-center justify-center shrink-0">
            <div className="w-full h-full rounded-full bg-[#0c2340] flex items-center justify-center text-[7px] font-black text-amber-400 border border-amber-300/40">
              ESIC
            </div>
          </div>
        </div>
      </div>

      {/* Center Body: Photo on Left + Column Details on Right */}
      <div className="relative z-10 flex gap-3.5 my-auto items-center">
        {/* Left: Employee Photo & Smart Chip */}
        <div className="flex flex-col items-center shrink-0">
          <div className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden ring-2 ring-amber-400/60 shadow-xl bg-slate-800">
            <img
              src={
                employee.employeePhoto ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
              }
              alt={employee.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 inset-x-0 bg-blue-950/90 text-center py-0.5 text-[7px] font-bold text-amber-300 uppercase tracking-wider">
              VERIFIED
            </div>
          </div>
        </div>

        {/* Right: Key Employee Columns */}
        <div className="flex-1 space-y-1 text-slate-200 text-[9.5px] sm:text-[10.5px]">
          {/* Insurance / IP Number Banner */}
          <div className="bg-amber-400/15 border border-amber-400/40 rounded-lg px-2 py-0.5 flex items-center justify-between mb-1.5">
            <span className="text-[8px] sm:text-[9px] font-bold text-amber-300 uppercase">
              Insurance No (IP No)
            </span>
            <span className="font-mono font-black text-[11px] sm:text-[12px] text-amber-400 tracking-wider">
              {employee.insuranceNo}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-0.5">
            <div className="flex items-baseline gap-1">
              <span className="text-slate-400 text-[8px] sm:text-[9px] w-20 shrink-0 font-medium">
                Name (नाम):
              </span>
              <span className="font-bold text-white text-[10.5px] sm:text-[11.5px] truncate">
                {employee.name}
              </span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-slate-400 text-[8px] sm:text-[9px] w-20 shrink-0 font-medium">
                Gender / लिंग:
              </span>
              <span className="font-semibold text-slate-100">{employee.gender}</span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-slate-400 text-[8px] sm:text-[9px] w-20 shrink-0 font-medium truncate">
                {employee.relationType === 'Husband' ? "Husband's Name:" : "Father's Name:"}
              </span>
              <span className="font-semibold text-slate-100 truncate">
                {employee.fatherOrHusbandName}
              </span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-slate-400 text-[8px] sm:text-[9px] w-20 shrink-0 font-medium">
                Date of Birth:
              </span>
              <span className="font-semibold text-slate-100">{employee.dob}</span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-slate-400 text-[8px] sm:text-[9px] w-20 shrink-0 font-medium">
                Mobile Number:
              </span>
              <span className="font-mono font-semibold text-amber-300">
                {employee.mobileNo}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Micro Barcode & Security Strip */}
      <div className="relative z-10 pt-1.5 border-t border-slate-700/60 flex items-center justify-between text-[7.5px] sm:text-[8px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <div className="font-mono text-[7px] text-slate-400">
            |||| ||||| |||| |||||||| ||||
          </div>
          <span>Validity: Ongoing</span>
        </div>
        <div className="flex items-center gap-1 text-amber-400 font-semibold">
          <ShieldCheck className="w-2.5 h-2.5" />
          <span>Govt of India / e-Pehchan</span>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   BACK CARD VIEW COMPONENT (Address, Employer, Family Photo, Dual Signatures)
   ========================================================================= */
export const BackCardView: React.FC<{
  employee: EmployeeRecord;
  settings: GlobalSettings;
}> = ({ employee, settings }) => {
  return (
    <div className="w-full h-full bg-gradient-to-br from-[#0a1c33] via-[#0f284a] to-[#08172b] text-white flex flex-col justify-between p-3.5 sm:p-4 select-none relative overflow-hidden font-sans">
      {/* Background Guilloche Security Texture */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

      {/* Back Top: Address & Employer info */}
      <div className="relative z-10 space-y-1.5 text-[8px] sm:text-[9px]">
        {/* Address */}
        <div className="bg-slate-950/60 border border-slate-700/60 rounded-lg p-1.5">
          <div className="flex items-center gap-1 text-amber-400 font-bold text-[8px]">
            <MapPin className="w-2.5 h-2.5 shrink-0" />
            <span>RESIDENTIAL ADDRESS / आवासीय पता:</span>
          </div>
          <p className="text-slate-200 text-[8.5px] sm:text-[9.5px] font-medium leading-tight mt-0.5">
            {employee.address}, {employee.city}, {employee.state} - {employee.pincode}
          </p>
        </div>

        {/* Employer Info */}
        <div className="bg-slate-950/60 border border-slate-700/60 rounded-lg p-1.5 flex justify-between gap-2">
          <div className="truncate">
            <div className="flex items-center gap-1 text-blue-300 font-bold text-[8px]">
              <Building2 className="w-2.5 h-2.5 shrink-0" />
              <span>EMPLOYER DETAILS / नियोक्ता विवरण:</span>
            </div>
            <p className="text-white text-[9px] font-bold truncate mt-0.5">
              {employee.employerName}
            </p>
            <p className="text-[7.5px] text-slate-400 truncate">
              Code: <span className="font-mono text-amber-300">{employee.employerCode || '10000984520001001'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Back Middle/Bottom: Family Photo + Dual Signatures */}
      <div className="relative z-10 grid grid-cols-3 gap-2 items-end pt-1">
        {/* 1. Family Photo Box */}
        <div className="flex flex-col items-center">
          <div className="w-full aspect-[4/3] rounded-lg overflow-hidden ring-1 ring-slate-600 bg-slate-900 shadow-md relative">
            <img
              src={
                employee.familyPhoto ||
                'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=300&auto=format&fit=crop&q=80'
              }
              alt="Family"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-[7px] sm:text-[7.5px] text-slate-300 font-semibold mt-0.5">
            Family / परिवार
          </span>
        </div>

        {/* 2. Employee Signature */}
        <div className="flex flex-col items-center">
          <div className="w-full aspect-[4/3] rounded-lg border border-slate-700 bg-slate-950/80 flex items-center justify-center p-1 overflow-hidden">
            {employee.employeeSignature ? (
              <img
                src={employee.employeeSignature}
                alt="Employee Sign"
                className="max-h-full max-w-full object-contain filter invert opacity-90"
              />
            ) : (
              <span className="text-[7px] text-slate-500 italic">Signature</span>
            )}
          </div>
          <span className="text-[7px] sm:text-[7.5px] text-slate-300 font-semibold mt-0.5 truncate max-w-full">
            Emp. Sign / हस्ताक्षर
          </span>
        </div>

        {/* 3. Common Employer Signature (Sign.jpg) + Official Stamp */}
        <div className="flex flex-col items-center relative">
          <div className="w-full aspect-[4/3] rounded-lg border border-slate-700 bg-slate-950/80 flex items-center justify-center p-1 overflow-hidden relative">
            {/* Stamp watermark background */}
            {settings.employerStamp && (
              <img
                src={settings.employerStamp}
                alt="Stamp"
                className="absolute inset-0 w-full h-full object-contain opacity-35 filter invert"
              />
            )}
            {/* Common Sign.jpg on top */}
            <img
              src={settings.employerSignature}
              alt="Employer Sign (Sign.jpg)"
              className="max-h-full max-w-full object-contain filter invert opacity-95 relative z-10"
            />
          </div>
          <span className="text-[7px] sm:text-[7.5px] text-amber-300 font-bold mt-0.5 truncate max-w-full">
            Employer Sign (Sign.jpg)
          </span>
        </div>
      </div>

      {/* Back Footer Helpline */}
      <div className="relative z-10 pt-1 border-t border-slate-800 flex items-center justify-between text-[7px] sm:text-[7.5px] text-slate-400">
        <span>Toll-Free Helpline: {settings.helplineNo}</span>
        <span className="text-slate-500 font-mono">esic.gov.in</span>
      </div>
    </div>
  );
};
