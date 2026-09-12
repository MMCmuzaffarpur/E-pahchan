import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  X,
  RotateCw,
  Printer,
  Download,
  Edit3,
  ShieldCheck,
  QrCode,
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
  onViewProfilePDF?: (emp: EmployeeRecord) => void;
}

export const IdCardModal: React.FC<IdCardModalProps> = ({
  isOpen,
  onClose,
  employee,
  settings,
  onEdit,
  onOpenPrintPreview,
  onViewProfilePDF,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewMode, setViewMode] = useState<'3d-flip' | 'dual-side'>('dual-side');
  const [isDownloading, setIsDownloading] = useState(false);

  const frontCardRef = useRef<HTMLDivElement>(null);
  const backCardRef = useRef<HTMLDivElement>(null);
  const dualFrontRef = useRef<HTMLDivElement>(null);
  const dualBackRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !employee) return null;

  // 100% Reliable Combined PNG Exporter
  const handleDownloadCombined = async () => {
    setIsDownloading(true);
    try {
      const frontEl = dualFrontRef.current || frontCardRef.current;
      const backEl = dualBackRef.current || backCardRef.current;

      if (!frontEl || !backEl) {
        throw new Error('Card elements not found');
      }

      const captureOptions = {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc: Document) => {
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            if (htmlEl.style) {
              const comp = window.getComputedStyle(htmlEl);
              if (comp.color && comp.color.includes('oklch')) htmlEl.style.color = '#0f172a';
              if (comp.backgroundColor && comp.backgroundColor.includes('oklch')) htmlEl.style.backgroundColor = '#ffffff';
              if (comp.borderColor && comp.borderColor.includes('oklch')) htmlEl.style.borderColor = '#cbd5e1';
            }
          });
        },
      };

      const canvasFront = await html2canvas(frontEl, captureOptions);
      const canvasBack = await html2canvas(backEl, captureOptions);

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
        ctx.drawImage(canvasFront, padding, padding);
        ctx.drawImage(canvasBack, padding + canvasFront.width + gap, padding);

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
                  viewMode === 'dual-side' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Dual Side View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('3d-flip')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  viewMode === '3d-flip' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
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
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-slate-950/60 relative min-h-[460px]">
          {viewMode === '3d-flip' ? (
            <div className="perspective-1000 w-full flex flex-col items-center">
              <div
                className={`relative w-full max-w-[470px] aspect-[85.6/54] transition-all duration-700 transform-style-3d cursor-pointer ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div
                  ref={frontCardRef}
                  className="absolute inset-0 backface-hidden rounded-xl overflow-hidden shadow-2xl"
                  style={{ border: '1px solid #cbd5e1' }}
                >
                  <FrontCardView employee={employee} settings={settings} onViewProfilePDF={onViewProfilePDF} />
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
            <div className="w-full flex flex-col xl:flex-row items-center justify-center gap-5 py-2">
              <div
                ref={dualFrontRef}
                className="w-full max-w-[465px] aspect-[85.6/54] rounded-xl overflow-hidden shadow-2xl shrink-0"
                style={{ border: '1px solid #cbd5e1' }}
              >
                <FrontCardView employee={employee} settings={settings} onViewProfilePDF={onViewProfilePDF} />
              </div>

              <div
                ref={dualBackRef}
                className="w-full max-w-[465px] aspect-[85.6/54] rounded-xl overflow-hidden shadow-2xl shrink-0"
                style={{ border: '1px solid #cbd5e1' }}
              >
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

            {onViewProfilePDF && (
              <button
                onClick={() => onViewProfilePDF(employee)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-xs font-semibold text-emerald-300 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                <span>View Scan PDF Profile</span>
              </button>
            )}
          </div>

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
   FRONT CARD VIEW COMPONENT (Bigger Clean Barcode - No Text Below)
   ========================================================================= */
export const FrontCardView: React.FC<{
  employee: EmployeeRecord;
  settings: GlobalSettings;
  onViewProfilePDF?: (emp: EmployeeRecord) => void;
}> = ({ employee, onViewProfilePDF }) => {
  // Generate a bigger, bolder, premium authentic barcode pattern (No text below)
  const ipStr = employee.insuranceNo || '4216832815';
  const barcodeBars = [];
  
  for (let i = 0; i < 54; i++) {
    const charCode = ipStr.charCodeAt(i % ipStr.length);
    const isDark = (charCode + i) % 2 === 0;
    const width = ((charCode + i) % 4 === 0) ? '3px' : (((charCode + i) % 2 === 0) ? '2px' : '1px');
    barcodeBars.push(
      <div
        key={i}
        style={{
          width,
          height: '32px', // Taller height
          backgroundColor: isDark ? '#000000' : '#1e293b',
        }}
      />
    );
  }

  const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=ESIC-IP-${employee.insuranceNo}`;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        userSelect: 'none',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#ffffff',
        color: '#000000',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. TOP HEADER */}
      <div
        style={{
          height: '14%',
          minHeight: '38px',
          padding: '2px 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          backgroundColor: '#0b3c75',
          color: '#ffffff',
          borderBottom: '2.5px solid #00b4d8',
          zIndex: 10,
          boxSizing: 'border-box',
        }}
      >
        <div style={{ flex: 1, textAlign: 'left' }}>
          <p style={{ fontSize: '9px', fontWeight: 'bold', lineHeight: 1.15, color: '#ffffff', margin: 0 }}>
            कर्मचारी राज्य बीमा निगम
          </p>
          <p style={{ fontSize: '6.5px', lineHeight: 1.15, marginTop: '2px', color: '#bfdbfe', margin: 0 }}>
            पंचदीप भवन, सी.आई.जी. मार्ग, नई दिल्ली-110 002
          </p>
        </div>

        <div style={{ flexShrink: 0, padding: '0 6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src={ESIC_EMBEDDED_LOGO}
            alt="ESIC"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              objectFit: 'contain',
              backgroundColor: '#ffffff',
              padding: '1.5px',
            }}
          />
        </div>

        <div style={{ flex: 1, textAlign: 'right' }}>
          <p style={{ fontSize: '8.5px', fontWeight: 'bold', lineHeight: 1.15, color: '#ffffff', margin: 0 }}>
            Employees' State Insurance Corporation
          </p>
          <p style={{ fontSize: '6.5px', lineHeight: 1.15, marginTop: '2px', color: '#bfdbfe', margin: 0 }}>
            Panchdeep Bhawan, C.I.G. Marg, New Delhi-110 002
          </p>
        </div>
      </div>

      {/* BACKGROUND WATERMARK */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '40px',
          bottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        <img
          src={ESIC_EMBEDDED_LOGO}
          alt=""
          style={{
            width: '160px',
            height: '160px',
            objectFit: 'contain',
            opacity: 0.14,
            filter: 'blur(0.8px)',
          }}
        />
      </div>

      {/* 2. CARD BODY */}
      <div
        style={{
          flex: 1,
          padding: '6px 12px',
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          position: 'relative',
          zIndex: 10,
          boxSizing: 'border-box',
        }}
      >
        {/* Left Demographics Details */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '9px', color: '#000000' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, width: '90px', flexShrink: 0, color: '#0b3c75' }}>IP No. :</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '11px', color: '#0b3c75' }}>
              {employee.insuranceNo}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, width: '90px', flexShrink: 0, color: '#1e293b' }}>Name :</span>
            <span style={{ fontWeight: 900, textTransform: 'uppercase', color: '#000000' }}>
              {employee.name}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, width: '90px', flexShrink: 0, color: '#1e293b' }}>D. O. B. :</span>
            <span style={{ fontWeight: 700, fontFamily: 'monospace', color: '#0f172a' }}>
              {employee.dob}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, width: '90px', flexShrink: 0, color: '#1e293b' }}>Father / Husband :</span>
            <span style={{ fontWeight: 700, textTransform: 'uppercase', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '155px' }}>
              {employee.fatherOrHusbandName}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, width: '90px', flexShrink: 0, color: '#1e293b' }}>Mobile :</span>
            <span style={{ fontWeight: 700, fontFamily: 'monospace', color: '#0f172a' }}>
              {employee.mobileNo || 'NA'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <span style={{ fontWeight: 800, width: '90px', flexShrink: 0, color: '#1e293b' }}>Perm. Address :</span>
            <span style={{ fontWeight: 600, fontSize: '7.5px', lineHeight: 1.15, color: '#0f172a', maxHeight: '20px', overflow: 'hidden' }}>
              {employee.address || `${employee.city}, ${employee.state}`}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, width: '90px', flexShrink: 0, color: '#1e293b' }}>Nominee :</span>
            <span style={{ fontWeight: 700, fontSize: '7.5px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '155px' }}>
              {employee.nominee?.name || 'TULSI KUMARI'} ({employee.nominee?.relation || 'Spouse'}) - 100%
            </span>
          </div>

          {/* BIGGER CLEAN BARCODE (NO TEXT BELOW) */}
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '3px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1px', backgroundColor: '#ffffff', padding: '1px 2px' }}>
              {barcodeBars}
            </div>
          </div>
        </div>

        {/* Right Column: Landscape Family Photo Frame + Google Lens Scannable QR Code */}
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          {/* Family Photo Frame */}
          <div
            style={{
              width: '135px',
              height: '80px',
              borderRadius: '3px',
              border: '1px solid #94a3b8',
              backgroundColor: 'rgba(255,255,255,0.75)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box',
            }}
          >
            <span style={{ fontSize: '7px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', lineHeight: 1.2, color: '#64748b' }}>
              AFFIX FAMILY<br />PHOTOGRAPH HERE
            </span>
          </div>

          {/* Google Lens Scannable QR Code */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (onViewProfilePDF) onViewProfilePDF(employee);
            }}
            title="Scan to view e-Pehchan PDF Profile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '3px',
              padding: '2px 4px',
              cursor: 'pointer',
            }}
          >
            <img
              src={qrDataUrl}
              alt="Scan QR"
              style={{ width: '26px', height: '26px', objectFit: 'contain' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '6px', fontWeight: 800, color: '#0b3c75' }}>SCAN PROFILE</span>
              <span style={{ fontSize: '5px', color: '#475569' }}>Google Lens</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. FOOTER */}
      <div
        style={{
          height: '22px',
          padding: '0 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '7px',
          backgroundColor: '#f1f5f9',
          borderTop: '1px solid #e2e8f0',
          color: '#475569',
          position: 'relative',
          zIndex: 10,
          boxSizing: 'border-box',
        }}
      >
        <span style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
          Reg Date: {employee.registrationDate || employee.appointmentDate || '18/05/2023'}
        </span>
        <span style={{ fontWeight: 600, color: '#334155', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px', padding: '0 4px' }}>
          Disp: {employee.dispensary || 'Kalambagh Chowk, BH (ESIS Disp.)'}
        </span>
        <span style={{ fontWeight: 'bold', color: '#0b3c75', whiteSpace: 'nowrap' }}>
          सामाजिक सुरक्षा / SOCIAL SECURITY
        </span>
      </div>
    </div>
  );
};

/* =========================================================================
   BACK CARD VIEW COMPONENT
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
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        userSelect: 'none',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#ffffff',
        color: '#0f172a',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. TOP HEADER */}
      <div
        style={{
          height: '14%',
          minHeight: '38px',
          padding: '2px 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          backgroundColor: '#0b3c75',
          color: '#ffffff',
          borderBottom: '1.5px solid #00b4d8',
          zIndex: 10,
          boxSizing: 'border-box',
        }}
      >
        <span style={{ fontSize: '8.5px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
          PARIVARIK VIVARAN / FAMILY DETAILS
        </span>
        <span style={{ fontSize: '7px', fontFamily: 'monospace', color: '#bfdbfe' }}>
          Toll Free: 1800-11-2526
        </span>
      </div>

      {/* BACKGROUND WATERMARK */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '40px',
          bottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        <img
          src={ESIC_EMBEDDED_LOGO}
          alt=""
          style={{
            width: '160px',
            height: '160px',
            objectFit: 'contain',
            opacity: 0.14,
            filter: 'blur(0.8px)',
          }}
        />
      </div>

      {/* 2. BODY */}
      <div
        style={{
          flex: 1,
          padding: '4px 8px 0 8px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 10,
          boxSizing: 'border-box',
        }}
      >
        {/* Family Table */}
        <div style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '7.5px', color: '#1e293b' }}>
            <thead>
              <tr style={{ backgroundColor: '#e2e8f0', borderBottom: '1px solid #cbd5e1' }}>
                <th style={{ padding: '2px 4px', textAlign: 'left', fontWeight: 'bold', color: '#0f172a' }}>Family Member</th>
                <th style={{ padding: '2px 4px', textAlign: 'left', fontWeight: 'bold', color: '#0f172a' }}>Relationship</th>
                <th style={{ padding: '2px 4px', textAlign: 'left', fontWeight: 'bold', color: '#0f172a', fontFamily: 'monospace' }}>DOB</th>
              </tr>
            </thead>
            <tbody>
              {cleanFamily.length > 0 ? (
                cleanFamily.slice(0, 5).map((f, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '2px 4px', fontWeight: 600, color: '#0f172a' }}>{f.name}</td>
                    <td style={{ padding: '2px 4px', color: '#475569' }}>{f.relation}</td>
                    <td style={{ padding: '2px 4px', fontFamily: 'monospace', color: '#334155' }}>{f.dob || 'NA'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} style={{ padding: '4px', textAlign: 'center', fontStyle: 'italic', color: '#94a3b8' }}>
                    No family member data registered
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* BOTTOM CONTAINER: Signatures + Blue Patti Directly Connected */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column' }}>
          {/* Signatures */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 16px 1px 16px', fontSize: '7px' }}>
            {/* Employee Sign Box */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '110px' }}>
              <div style={{ height: '24px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isGenuineSignature ? (
                  <img
                    src={employee.employeeSignature}
                    alt=""
                    style={{
                      maxHeight: '100%',
                      maxWidth: '100%',
                      objectFit: 'contain',
                      mixBlendMode: 'multiply',
                      filter: 'invert(16%) sepia(100%) saturate(6500%) hue-rotate(220deg) brightness(80%) contrast(130%)',
                    }}
                  />
                ) : (
                  <span style={{ fontSize: '7.5px', fontStyle: 'italic', color: '#94a3b8' }}>Sign / LTI</span>
                )}
              </div>
              <span style={{ fontWeight: 500, color: '#334155', lineHeight: 1.1 }}>
                Employee Sign / LTI
              </span>
            </div>

            {/* Employer Sign Box */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '110px' }}>
              <div style={{ height: '24px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {settings.employerSignature ? (
                  <img
                    src={settings.employerSignature}
                    alt=""
                    style={{
                      maxHeight: '100%',
                      maxWidth: '100%',
                      objectFit: 'contain',
                      mixBlendMode: 'multiply',
                    }}
                  />
                ) : null}
              </div>
              <span style={{ fontWeight: 'bold', color: '#334155', lineHeight: 1.1 }}>
                Auth. Signatory (ESIC)
              </span>
            </div>
          </div>

          {/* Blue Patti */}
          <div
            style={{
              height: '18px',
              padding: '0 6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '7px',
              backgroundColor: '#0b3c75',
              color: '#ffffff',
              borderTopLeftRadius: '3px',
              borderTopRightRadius: '3px',
              boxSizing: 'border-box',
            }}
          >
            <span style={{ fontWeight: 'bold', color: '#bfdbfe' }}>Employer:</span>
            <span style={{ fontWeight: 600, textTransform: 'uppercase', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '250px' }}>
              {employee.employerName}
            </span>
            <span style={{ fontSize: '6.5px', fontFamily: 'monospace', color: '#bfdbfe' }}>
              {employee.employerCode || '42001884020000908'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. FOOTER */}
      <div
        style={{
          height: '22px',
          padding: '0 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '7px',
          backgroundColor: '#f1f5f9',
          borderTop: '1px solid #e2e8f0',
          color: '#64748b',
          position: 'relative',
          zIndex: 10,
          boxSizing: 'border-box',
        }}
      >
        <span>Web: www.esic.gov.in</span>
        <span>Valid Across All Network Hospitals in India</span>
      </div>
    </div>
  );
};
