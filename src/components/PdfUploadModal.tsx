import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileUp,
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Database,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { EmployeeRecord, ParsedPdfResult } from '../types';
import { extractTextFromPdf, parsePdfTranscript, getSamplePdfDemoData } from '../utils/pdfParser';
import confetti from 'canvas-confetti';

interface PdfUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveEmployee: (employeeData: Omit<EmployeeRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const PdfUploadModal: React.FC<PdfUploadModalProps> = ({
  isOpen,
  onClose,
  onSaveEmployee,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedPdfResult | null>(null);
  const [activeTab, setActiveTab] = useState<'columns' | 'raw'>('columns');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Editable fields in preview
  const [formFields, setFormFields] = useState<Partial<EmployeeRecord>>({});

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processPdfFile(file);
  };

  const processPdfFile = async (file: File) => {
    setSelectedFile(file);
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const rawText = await extractTextFromPdf(file);
      const parsed = parsePdfTranscript(rawText, file.name);
      setParsedResult(parsed);
      setFormFields(parsed.fields);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Could not read PDF. You can also try our built-in sample demo PDFs below.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadSampleDemo = (index: number) => {
    setIsProcessing(true);
    setErrorMsg(null);
    setTimeout(() => {
      const sample = getSamplePdfDemoData(index);
      setParsedResult(sample);
      setFormFields(sample.fields);
      setSelectedFile(new File(['Sample PDF content'], sample.fields.sourcePdfName || 'ESIC_Pehchan_Sample.pdf', { type: 'application/pdf' }));
      setIsProcessing(false);
    }, 400);
  };

  const handleFieldChange = (field: keyof EmployeeRecord, value: string) => {
    setFormFields((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveToDatabase = () => {
    if (!formFields.name || !formFields.insuranceNo) {
      setErrorMsg('Please ensure Name and Insurance No are populated before saving.');
      return;
    }

    const employeeToSave: Omit<EmployeeRecord, 'id' | 'createdAt' | 'updatedAt'> = {
      insuranceNo: formFields.insuranceNo || '3100000000',
      name: formFields.name || 'New Employee',
      gender: formFields.gender || 'Male',
      fatherOrHusbandName: formFields.fatherOrHusbandName || '',
      relationType: formFields.relationType || 'Father',
      dob: formFields.dob || '1990-01-01',
      mobileNo: formFields.mobileNo || '',
      address: formFields.address || '',
      city: formFields.city || 'Muzaffarpur',
      state: formFields.state || 'Bihar',
      pincode: formFields.pincode || '842001',
      employerName: formFields.employerName || 'Official Enterprise',
      employerCode: formFields.employerCode || '10000000000000000',
      employerAddress: formFields.employerAddress || '',
      appointmentDate: formFields.appointmentDate || new Date().toISOString().split('T')[0],
      dispensary: formFields.dispensary || 'ESIC Dispensary',
      branchOffice: formFields.branchOffice || 'ESIC Branch Office',
      employeePhoto: formFields.employeePhoto,
      familyPhoto: formFields.familyPhoto,
      employeeSignature: formFields.employeeSignature,
      sourcePdfName: selectedFile?.name || 'Uploaded_Document.pdf',
      transcriptData: formFields.transcriptData,
    };

    onSaveEmployee(employeeToSave);

    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e) {}

    handleReset();
    onClose();
  };

  const handleReset = () => {
    setSelectedFile(null);
    setParsedResult(null);
    setFormFields({});
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Upload PDF & Auto Extract Transcript
              </h2>
              <p className="text-xs text-slate-400">
                PDF अपलोड करें &bull; सभी कॉलम वाइज डाटा (IP No, Name, DOB, Address) ऑटोमैटिक ट्रांसक्रिप्ट करें
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-950/70 border border-rose-800 rounded-xl text-xs text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!parsedResult ? (
            /* Upload Dropzone + Sample PDF selector */
            <div className="space-y-6">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl p-8 text-center cursor-pointer transition-all bg-slate-950/50 hover:bg-blue-950/10 group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,application/pdf"
                  className="hidden"
                />
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <FileText className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">
                  Click to Browse or Drag & Drop PDF File
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Supports ESIC e-Pehchan documents, Pehchan cards, employee registration PDFs,
                  or insurance certificates.
                </p>
                <div className="inline-flex items-center gap-1.5 mt-4 px-3 py-1 rounded-full bg-slate-800 text-[11px] font-semibold text-slate-300">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Auto Transcript Engine
                </div>
              </div>

              {/* Instant One-Click Demo PDFs */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">
                      Instant Sample Test PDFs / तुरंत टेस्ट करने हेतु सैंपल चुनें:
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">One-click test extract</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleLoadSampleDemo(0)}
                    className="p-3 rounded-xl bg-blue-950/40 hover:bg-blue-950/80 border border-blue-800/80 hover:border-blue-500 text-left transition-all group cursor-pointer"
                  >
                    <p className="text-xs font-bold text-amber-300 group-hover:text-amber-200">
                      📄 Baby Devi (ESIC).pdf
                    </p>
                    <p className="text-[10px] text-slate-300 mt-0.5">
                      IP: 4216776809 &bull; Female
                    </p>
                    <p className="text-[9px] text-slate-400 truncate">
                      Muzaffarpur Municipal Corp
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLoadSampleDemo(1)}
                    className="p-3 rounded-xl bg-slate-900 hover:bg-blue-950/60 border border-slate-800 hover:border-blue-700/60 text-left transition-all group cursor-pointer"
                  >
                    <p className="text-xs font-bold text-slate-200 group-hover:text-blue-300">
                      📄 Ramesh Verma ESIC.pdf
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      IP: 3109845621 &bull; Male
                    </p>
                    <p className="text-[9px] text-slate-500 truncate">
                      Bharat Logistics Corp
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLoadSampleDemo(2)}
                    className="p-3 rounded-xl bg-slate-900 hover:bg-blue-950/60 border border-slate-800 hover:border-blue-700/60 text-left transition-all group cursor-pointer"
                  >
                    <p className="text-xs font-bold text-slate-200 group-hover:text-blue-300">
                      📄 Sunita Devi Pehchan.pdf
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      IP: 3114589632 &bull; Female
                    </p>
                    <p className="text-[9px] text-slate-500 truncate">
                      Tirhut Textile & Garments
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLoadSampleDemo(3)}
                    className="p-3 rounded-xl bg-slate-900 hover:bg-blue-950/60 border border-slate-800 hover:border-blue-700/60 text-left transition-all group cursor-pointer"
                  >
                    <p className="text-xs font-bold text-slate-200 group-hover:text-blue-300">
                      📄 Amitabh Singh Pehchan.pdf
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      IP: 3123654789 &bull; Male
                    </p>
                    <p className="text-[9px] text-slate-500 truncate">
                      Global Secure Facility
                    </p>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Parsed Transcript Preview & Column Editor */
            <div className="space-y-5">
              {/* Success Banner */}
              <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-emerald-200">
                      PDF Successfully Extracted & Transcripted!
                    </p>
                    <p className="text-[11px] text-emerald-300/80">
                      File: {selectedFile?.name} &bull; All required column fields detected
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleReset}
                  className="px-3 py-1 text-xs rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Upload Another</span>
                </button>
              </div>

              {/* View Switcher: Column Wise Form vs Raw PDF Transcript */}
              <div className="flex border-b border-slate-800 gap-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('columns')}
                  className={`pb-2 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'columns'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Column Wise Data Preview (कॉलम डेटा)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('raw')}
                  className={`pb-2 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'raw'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Full PDF Raw Transcript (ट्रांसक्रिप्ट टेक्स्ट)</span>
                </button>
              </div>

              {activeTab === 'columns' ? (
                /* Editable Grid of Extracted Columns */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Insurance No / IP No (बीमा संख्या) *
                    </label>
                    <input
                      type="text"
                      value={formFields.insuranceNo || ''}
                      onChange={(e) => handleFieldChange('insuranceNo', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Employee Full Name (कर्मचारी का नाम) *
                    </label>
                    <input
                      type="text"
                      value={formFields.name || ''}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Gender (लिंग)
                    </label>
                    <select
                      value={formFields.gender || 'Male'}
                      onChange={(e) => handleFieldChange('gender', e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500"
                    >
                      <option value="Male">Male (पुरुष)</option>
                      <option value="Female">Female (महिला)</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Relation Type (संबंध प्रकार)
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={formFields.relationType || 'Father'}
                        onChange={(e) => handleFieldChange('relationType', e.target.value as any)}
                        className="w-1/3 bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white focus:border-blue-500"
                      >
                        <option value="Father">Father</option>
                        <option value="Husband">Husband</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Father / Husband Name"
                        value={formFields.fatherOrHusbandName || ''}
                        onChange={(e) => handleFieldChange('fatherOrHusbandName', e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Date of Birth / DOB (जन्म तिथि)
                    </label>
                    <input
                      type="date"
                      value={formFields.dob || ''}
                      onChange={(e) => handleFieldChange('dob', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Mobile Number (मोबाइल नंबर)
                    </label>
                    <input
                      type="text"
                      value={formFields.mobileNo || ''}
                      onChange={(e) => handleFieldChange('mobileNo', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Residential Address (आवासीय पता)
                    </label>
                    <textarea
                      rows={2}
                      value={formFields.address || ''}
                      onChange={(e) => handleFieldChange('address', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Employer Name (नियोक्ता का नाम)
                    </label>
                    <input
                      type="text"
                      value={formFields.employerName || ''}
                      onChange={(e) => handleFieldChange('employerName', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Employer Code (नियोक्ता कोड)
                    </label>
                    <input
                      type="text"
                      value={formFields.employerCode || ''}
                      onChange={(e) => handleFieldChange('employerCode', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>
              ) : (
                /* Raw text transcript preview */
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 max-h-72 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {parsedResult.rawText}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-all cursor-pointer"
          >
            Cancel / बंद करें
          </button>

          {parsedResult && (
            <button
              onClick={handleSaveToDatabase}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Database className="w-4 h-4 text-amber-300" />
              <span>Save Transcript to Database (डेटाबेस में सेव करें)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
