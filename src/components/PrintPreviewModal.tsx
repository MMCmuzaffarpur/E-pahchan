import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Printer,
  X,
  Scissors,
  Layers,
  Sparkles,
  Info,
  Maximize2,
  CheckCircle2,
} from 'lucide-react';
import { EmployeeRecord, GlobalSettings } from '../types';
import { FrontCardView, BackCardView } from './IdCardModal';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: EmployeeRecord | null;
  settings: GlobalSettings;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  employee,
  settings,
}) => {
  const [showCutMarks, setShowCutMarks] = useState(true);
  const [cardScale, setCardScale] = useState<'100%' | '105%' | '95%'>('100%');

  if (!isOpen || !employee) return null;

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-4 flex flex-col max-h-[96vh]"
      >
        {/* Modal Header (Hidden during actual print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">A4 ID Card Print Preview</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                  Left: Back Side &bull; Right: Front Side
                </span>
              </div>
              <p className="text-xs text-slate-400">
                A4 साइज पेज पर कार्ड के साइज में Back Side Left में और Front Side Right में सेट है
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Cut Marks Toggle */}
            <button
              onClick={() => setShowCutMarks(!showCutMarks)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                showCutMarks
                  ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Cut Lines {showCutMarks ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={handleTriggerPrint}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>Print Now / A4 प्रिंट करें</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: A4 Paper Representation */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-slate-950 flex flex-col items-center justify-start min-h-[500px]">
          {/* Print Guide Message */}
          <div className="no-print w-full max-w-3xl mb-4 p-3 rounded-xl bg-blue-950/40 border border-blue-800/50 text-blue-200 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-400 shrink-0" />
              <span>
                Standard CR-80 card size (85.6mm × 54mm) formatted side-by-side for seamless folding and lamination.
              </span>
            </div>
            <span className="text-[11px] font-semibold text-amber-300 shrink-0">
              A4 Ready 300 DPI
            </span>
          </div>

          {/* Simulated A4 Paper (Printed via standard window.print) */}
          <div
            id="printable-a4-sheet"
            className="w-full max-w-[800px] bg-white text-slate-900 rounded-xl shadow-2xl p-6 sm:p-10 border border-slate-300 relative min-h-[520px] flex flex-col justify-start"
          >
            {/* Top Sheet Identification (Light Header) */}
            <div className="border-b border-slate-300 pb-3 mb-8 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {settings.organizationName} &bull; e-Pehchan Official ID Sheet
                </p>
                <p className="text-[10px] text-slate-500">
                  Insured Person: <strong className="text-slate-700">{employee.name}</strong> | IP No: <strong className="text-slate-700 font-mono">{employee.insuranceNo}</strong>
                </p>
              </div>
              <div className="text-right text-[10px] text-slate-500 font-mono">
                Date: {new Date().toLocaleDateString()}
              </div>
            </div>

            {/* THE CORE LAYOUT: Back Side on LEFT, Front Side on RIGHT (As requested!) */}
            <div className="my-auto py-4">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative">
                {/* 1. BACK SIDE (LEFT) */}
                <div className="flex flex-col items-center">
                  <span className="no-print text-[10px] font-bold text-slate-500 mb-1 flex items-center gap-1">
                    <span>BACK SIDE (बायाँ भाग)</span>
                  </span>
                  
                  <div
                    className={`relative w-[340px] h-[214px] rounded-xl overflow-hidden shadow-lg border border-slate-400 ${
                      showCutMarks ? 'ring-1 ring-dashed ring-slate-400' : ''
                    }`}
                  >
                    <BackCardView employee={employee} settings={settings} />
                  </div>
                </div>

                {/* Center Fold/Cut Guidelines */}
                {showCutMarks && (
                  <div className="hidden sm:flex flex-col items-center justify-center px-1 text-slate-400 h-[214px]">
                    <div className="h-full border-r-2 border-dashed border-slate-400 flex flex-col justify-between py-2">
                      <Scissors className="w-3.5 h-3.5 text-slate-400 -mr-[7px]" />
                      <span className="text-[8px] text-slate-400 transform -rotate-90 origin-center whitespace-nowrap">
                        Fold / Cut Line
                      </span>
                      <Scissors className="w-3.5 h-3.5 text-slate-400 -mr-[7px]" />
                    </div>
                  </div>
                )}

                {/* 2. FRONT SIDE (RIGHT) */}
                <div className="flex flex-col items-center">
                  <span className="no-print text-[10px] font-bold text-slate-500 mb-1 flex items-center gap-1">
                    <span>FRONT SIDE (दायाँ भाग)</span>
                  </span>

                  <div
                    className={`relative w-[340px] h-[214px] rounded-xl overflow-hidden shadow-lg border border-slate-400 ${
                      showCutMarks ? 'ring-1 ring-dashed ring-slate-400' : ''
                    }`}
                  >
                    <FrontCardView employee={employee} settings={settings} />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Instructions on A4 Sheet */}
            <div className="border-t border-slate-300 pt-4 mt-8 flex flex-col sm:flex-row items-center justify-between text-[9px] text-slate-500 gap-2">
              <div>
                <p className="font-semibold text-slate-700">Printing & Lamination Instructions:</p>
                <p>1. Print on high-quality 250+ GSM Photo Paper or PVC Sheet.</p>
                <p>2. Cut along the outer dashed border, fold along center line and laminate for PVC finish.</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-700">Official Sign & Seal:</p>
                <p>Pre-authorized electronically via e-Pehchan system.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="no-print px-6 py-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Card Format: 85.6mm × 54mm Dual Sided (CR80 PVC spec)
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-all cursor-pointer"
            >
              Close / बंद करें
            </button>
            <button
              onClick={handleTriggerPrint}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print A4 Sheet</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
