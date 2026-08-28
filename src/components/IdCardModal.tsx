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
  Award,
  CheckCircle2,
} from 'lucide-react';
import { EmployeeRecord, GlobalSettings } from '../types';
import { NATIONAL_EMBLEM_SVG, ESIC_OFFICIAL_LOGO } from '../utils/defaultAssets';
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
      let filename = `ESIC_Govt_Card_${employee.insuranceNo}_${employee.name.replace(/\s+/g, '_')}`;

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
          backgroundColor: '#0c2340',
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-700 flex items-center justify-center text-white shadow-md shadow-amber-900/20 border border-amber-400/40">
              <ShieldCheck className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Government e-Pehchan Smart ID Card
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400 text-slate-950 shadow">
                  IP No: {employee.insuranceNo}
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
                className={`relative w-full max-w-[520px] aspect-[85.6/54] transition-all duration-700 transform-style-3d cursor-pointer ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                {/* Front Side */}
                <div
                  ref={frontCardRef}
                  className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden shadow-2xl border border-amber-400/40"
                >
                  <FrontCardView employee={employee} settings={settings} />
                </div>

                {/* Back Side */}
                <div
                  ref={backCardRef}
                  className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl overflow-hidden shadow-2xl border border-amber-400/40"
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
                  <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {isFlipped
                      ? 'Flip to Front Side (कार्ड के आगे का भाग देखें)'
                      : 'Flip to Back Side (कार्ड के पीछे का भाग देखें)'}
                  </span>
                </button>
                <span className="text-[11px] text-slate-400">
                  (Click card to flip 3D view)
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
              <div className="w-full max-w-[480px] aspect-[85.6/54] rounded-2xl overflow-hidden shadow-2xl border border-amber-400/40">
                <FrontCardView employee={employee} settings={settings} />
              </div>

              {/* Back Card Container */}
              <div className="w-full max-w-[480px] aspect-[85.6/54] rounded-2xl overflow-hidden shadow-2xl border border-amber-400/40">
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
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Edit Details & Signatures</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleDownload('front')}
              disabled={isDownloading}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Front Card PNG</span>
            </button>

            <button
              onClick={() => handleDownload('back')}
              disabled={isDownloading}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Back Card PNG</span>
            </button>

            {/* Print Button with A4 side-by-side print preview */}
            <button
              onClick={() => onOpenPrintPreview(employee)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>A4 Print Sheet (Back Left & Front Right)</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/* =========================================================================
   FRONT CARD VIEW COMPONENT (Government of India / ESIC Sovereign Style)
   ========================================================================= */
export const FrontCardView: React.FC<{
  employee: EmployeeRecord;
  settings: GlobalSettings;
}> = ({ employee, settings }) => {
  return (
    <div className="w-full h-full bg-gradient-to-br from-[#0c2340] via-[#10325c] to-[#0a1c33] text-white flex flex-col justify-between p-3 sm:p-3.5 select-none relative overflow-hidden font-sans border-2 border-amber-400/50">
      {/* Sovereign Indian Tricolor Micro Ribbon Header Accent */}
      <div className="absolute top-0 inset-x-0 h-1.5 flex pointer-events-none z-20">
        <div className="w-1/3 h-full bg-[#ff9933]" />
        <div className="w-1/3 h-full bg-[#ffffff]" />
        <div className="w-1/3 h-full bg-[#138808]" />
      </div>

      {/* Guilloche Security Watermark Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:10px_10px] pointer-events-none" />
      <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 w-44 h-44 rounded-full bg-blue-400/10 blur-2xl pointer-events-none" />

      {/* 1. TOP HEADER: Ashoka Stambh + Bilingual ESIC Title + Official Logo */}
      <div className="relative z-10 pt-1 pb-1 border-b border-amber-400/40">
        <div className="flex items-center justify-between gap-2">
          {/* National Emblem of India */}
          <div className="flex items-center gap-2">
            <img
              src={NATIONAL_EMBLEM_SVG}
              alt="Government Emblem"
              className="w-7 h-9 object-contain drop-shadow"
            />
            <div>
              <p className="text-[8.5px] sm:text-[9.5px] font-black text-amber-400 tracking-wide leading-tight">
                कर्मचारी राज्य बीमा निगम
              </p>
              <p className="text-[7px] sm:text-[8px] font-extrabold text-white tracking-wide uppercase leading-tight">
                EMPLOYEES' STATE INSURANCE CORPORATION
              </p>
              <p className="text-[6px] sm:text-[7px] text-slate-300 font-medium leading-none mt-0.5">
                श्रम एवं रोजगार मंत्रालय, भारत सरकार / Ministry of Labour & Employment, Govt. of India
              </p>
            </div>
          </div>

          {/* Official ESIC Emblem */}
          <div className="shrink-0 flex items-center">
            <img
              src={ESIC_OFFICIAL_LOGO}
              alt="ESIC Seal"
              className="w-8 h-8 rounded-full shadow-md bg-white p-0.5"
            />
          </div>
        </div>

        {/* e-Pehchan Subheading Bar */}
        <div className="mt-1 bg-amber-400/20 border border-amber-400/40 rounded px-2 py-0.5 flex items-center justify-between">
          <span className="text-[7.5px] sm:text-[8.5px] font-bold text-amber-300 uppercase tracking-wide">
            ई-पहचान स्मार्ट कार्ड / e-Pehchan Smart Identity Card
          </span>
          <span className="text-[7px] font-mono text-slate-200">
            Reg Date: {employee.registrationDate || employee.appointmentDate || '18/05/2023'}
          </span>
        </div>
      </div>

      {/* 2. CENTER BODY: Employee Photo (Left) + Prominent IP No & Columns (Right) */}
      <div className="relative z-10 flex gap-3 my-auto items-center py-0.5">
        {/* Left: Photo with Golden Dual Border & Attestation Seal */}
        <div className="flex flex-col items-center shrink-0">
          <div className="relative w-[78px] h-[98px] sm:w-[90px] sm:h-[110px] rounded-lg overflow-hidden ring-2 ring-amber-400 shadow-xl bg-slate-900">
            <img
              src={
                employee.employeePhoto ||
                (employee.gender === 'Female'
                  ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80'
                  : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80')
              }
              alt={employee.name}
              className="w-full h-full object-cover"
            />
            {/* Holographic Verification Banner */}
            <div className="absolute bottom-0 inset-x-0 bg-amber-400 text-slate-950 text-center py-0.5 text-[6.5px] sm:text-[7px] font-black uppercase tracking-wider">
              ★ सत्यापित / VERIFIED ★
            </div>
          </div>
        </div>

        {/* Right: IP Number Box & Demographic Columns */}
        <div className="flex-1 space-y-1 text-slate-200 text-[9px] sm:text-[10px]">
          {/* Prominent Gold IP Number Banner */}
          <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 rounded-lg px-2 py-1 flex items-center justify-between shadow-md">
            <span className="text-[7.5px] sm:text-[8.5px] font-black uppercase tracking-wide">
              बीमा संख्या / IP NO:
            </span>
            <span className="font-mono font-black text-[12px] sm:text-[13px] tracking-wider">
              {employee.insuranceNo}
            </span>
          </div>

          {/* Demographic Field Grid */}
          <div className="bg-slate-950/60 rounded-lg p-1.5 border border-slate-700/60 space-y-0.5">
            <div className="flex items-baseline gap-1">
              <span className="text-amber-300 text-[7.5px] sm:text-[8.5px] w-24 shrink-0 font-bold">
                नाम / Name:
              </span>
              <span className="font-bold text-white text-[10px] sm:text-[11px] truncate uppercase">
                {employee.name}
              </span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-slate-400 text-[7.5px] sm:text-[8.5px] w-24 shrink-0 font-medium">
                {employee.relationType === 'Husband' ? 'पति / Husband:' : 'पिता / Father:'}
              </span>
              <span className="font-semibold text-slate-100 truncate uppercase">
                {employee.fatherOrHusbandName}
              </span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-slate-400 text-[7.5px] sm:text-[8.5px] w-24 shrink-0 font-medium">
                जन्म तिथि / DOB:
              </span>
              <span className="font-semibold text-slate-100 font-mono">
                {employee.dob}
              </span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-slate-400 text-[7.5px] sm:text-[8.5px] w-24 shrink-0 font-medium">
                लिंग / Gender:
              </span>
              <span className="font-semibold text-slate-100">
                {employee.gender === 'Male' ? 'Male (पुरुष)' : employee.gender === 'Female' ? 'Female (महिला)' : 'Other'}
              </span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-slate-400 text-[7.5px] sm:text-[8.5px] w-24 shrink-0 font-medium">
                मोबाइल / Mobile:
              </span>
              <span className="font-mono font-bold text-amber-300">
                {employee.mobileNo}
              </span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-slate-400 text-[7.5px] sm:text-[8.5px] w-24 shrink-0 font-medium">
                नियुक्ति / Appt. Date:
              </span>
              <span className="font-mono text-slate-200">
                {employee.appointmentDate || '10/05/2023'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM FOOTER: Security Barcode / QR Info & Microtext */}
      <div className="relative z-10 pt-1 border-t border-slate-700/70 flex items-center justify-between text-[7px] sm:text-[7.5px] text-slate-400">
        <div className="flex items-center gap-2">
          <div className="font-mono text-[7px] text-amber-300 font-bold">
            ||| | ||||| || |||||||| ||||
          </div>
          <span className="text-slate-300">Validity: Active / वैध</span>
        </div>

        <div className="flex items-center gap-1 text-amber-400 font-bold">
          <ShieldCheck className="w-2.5 h-2.5" />
          <span>GOVT OF INDIA • भारत सरकार</span>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   BACK CARD VIEW COMPONENT (Government Official Back Side Spec)
   ========================================================================= */
export const BackCardView: React.FC<{
  employee: EmployeeRecord;
  settings: GlobalSettings;
}> = ({ employee, settings }) => {
  return (
    <div className="w-full h-full bg-gradient-to-br from-[#0a1c33] via-[#0e2747] to-[#071626] text-white flex flex-col justify-between p-3 sm:p-3.5 select-none relative overflow-hidden font-sans border-2 border-amber-400/50">
      {/* Sovereign Indian Tricolor Micro Ribbon Header Accent */}
      <div className="absolute top-0 inset-x-0 h-1.5 flex pointer-events-none z-20">
        <div className="w-1/3 h-full bg-[#ff9933]" />
        <div className="w-1/3 h-full bg-[#ffffff]" />
        <div className="w-1/3 h-full bg-[#138808]" />
      </div>

      {/* Security Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:10px_10px] pointer-events-none" />

      {/* 1. TOP SECTION: Residential Address & Employer Details */}
      <div className="relative z-10 space-y-1.5 text-[8px] sm:text-[8.5px] pt-1">
        {/* Residential Address Box */}
        <div className="bg-slate-950/70 border border-slate-700/80 rounded-lg p-1.5">
          <div className="flex items-center justify-between text-amber-400 font-bold text-[7.5px] sm:text-[8px]">
            <div className="flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5 shrink-0" />
              <span>RESIDENTIAL ADDRESS / आवासीय पता:</span>
            </div>
            <span className="text-[7px] text-slate-400 font-mono">PIN: {employee.pincode || '842002'}</span>
          </div>
          <p className="text-slate-100 text-[8px] sm:text-[9px] font-medium leading-snug mt-0.5 uppercase">
            {employee.address}, {employee.city}, {employee.state} - {employee.pincode}
          </p>
        </div>

        {/* Employer & Dispensary Info */}
        <div className="bg-slate-950/70 border border-slate-700/80 rounded-lg p-1.5 flex justify-between gap-2">
          <div className="truncate flex-1">
            <div className="flex items-center gap-1 text-blue-300 font-bold text-[7.5px]">
              <Building2 className="w-2.5 h-2.5 shrink-0" />
              <span>EMPLOYER DETAILS / नियोक्ता विवरण:</span>
            </div>
            <p className="text-white text-[8.5px] sm:text-[9.5px] font-black truncate mt-0.5 uppercase">
              {employee.employerName}
            </p>
            <p className="text-[7px] text-slate-300">
              Est. Code: <span className="font-mono text-amber-300 font-bold">{employee.employerCode || '42001884020000908'}</span>
            </p>
          </div>

          <div className="truncate text-right border-l border-slate-700/60 pl-2">
            <span className="text-amber-300 font-bold text-[7px] block">DISPENSARY / औषधालय:</span>
            <p className="text-[7.5px] text-slate-200 font-medium truncate max-w-[130px]">
              {employee.dispensary || 'Kalambagh Chowk, BH (ESIS)'}
            </p>
            <p className="text-[6.5px] text-slate-400 truncate max-w-[130px]">
              BO: {employee.branchOffice || 'DCBO Muzaffarpur'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE/BOTTOM: Family Photo + Employee Sign + Employer Authorized Sign & Seal */}
      <div className="relative z-10 grid grid-cols-3 gap-2 items-end py-1">
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
          <span className="text-[6.5px] sm:text-[7.5px] text-slate-300 font-semibold mt-0.5">
            Family / परिवार
          </span>
        </div>

        {/* 2. Employee Signature / Thumb Impression */}
        <div className="flex flex-col items-center">
          <div className="w-full aspect-[4/3] rounded-lg border border-slate-700 bg-slate-950/80 flex items-center justify-center p-1 overflow-hidden">
            {employee.employeeSignature ? (
              <img
                src={employee.employeeSignature}
                alt="Employee Sign"
                className="max-h-full max-w-full object-contain filter invert opacity-95"
              />
            ) : (
              <span className="text-[7px] text-slate-500 italic">कर्मचारी हस्ताक्षर / LTI</span>
            )}
          </div>
          <span className="text-[6.5px] sm:text-[7.5px] text-slate-300 font-semibold mt-0.5 truncate max-w-full">
            Emp. Sign / हस्ताक्षर
          </span>
        </div>

        {/* 3. Authorized Employer Signature (Sign.jpg) + Official Stamp */}
        <div className="flex flex-col items-center relative">
          <div className="w-full aspect-[4/3] rounded-lg border border-slate-700 bg-slate-950/80 flex items-center justify-center p-1 overflow-hidden relative">
            {/* Stamp watermark */}
            {settings.employerStamp && (
              <img
                src={settings.employerStamp}
                alt="Stamp"
                className="absolute inset-0 w-full h-full object-contain opacity-40 filter invert"
              />
            )}
            {/* Common Sign.jpg on top */}
            <img
              src={settings.employerSignature}
              alt="Sign.jpg"
              className="max-h-full max-w-full object-contain filter invert opacity-95 relative z-10"
            />
          </div>
          <span className="text-[6.5px] sm:text-[7.5px] text-amber-300 font-bold mt-0.5 truncate max-w-full">
            अधिकृत हस्ताक्षर / Sign.jpg
          </span>
        </div>
      </div>

      {/* 3. FOOTER: Toll-Free Helpline & Official Disclaimer */}
      <div className="relative z-10 pt-1 border-t border-slate-800 flex items-center justify-between text-[6.5px] sm:text-[7.5px] text-slate-400">
        <span>Toll-Free Helpline: 1800-11-2526 / 011-23234092</span>
        <span className="text-amber-400 font-mono font-bold">www.esic.gov.in</span>
      </div>
    </div>
  );
};
