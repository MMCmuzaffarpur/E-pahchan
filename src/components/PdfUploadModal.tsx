import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  FileUp,
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Database,
  RefreshCw,
  ClipboardPaste,
  ShieldCheck,
  Building2,
  Users,
  Trash2,
  Plus,
} from 'lucide-react';
import { EmployeeRecord, ParsedPdfResult } from '../types';
import { extractTextFromPdf, parsePdfTranscript, getSamplePdfDemoData, isValidIpNumber } from '../utils/pdfParser';
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
  const [activeTab, setActiveTab] = useState<'columns' | 'raw' | 'paste'>('columns');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState('');

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
      
      // Clean up family member names from stray OCR/PDF table header artifacts
      if (parsed.fields.familyMembers) {
        parsed.fields.familyMembers = parsed.fields.familyMembers.map((fam) => ({
          ...fam,
          name: fam.name
            .replace(/^(?:ith|is|residing|with|ip|ar|ding|r)\s+/i, '')
            .replace(/(?:with\s*ip|is\s*residing)/gi, '')
            .trim(),
        }));
      }

      setParsedResult(parsed);
      setFormFields(parsed.fields);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Could not read PDF. You can also paste the transcript text directly in the Paste tab.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessPastedText = () => {
    if (!pastedText.trim()) {
      setErrorMsg('Please paste the transcript text from your PDF or OCR tool.');
      return;
    }
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const parsed = parsePdfTranscript(pastedText, 'Pasted_Transcript.pdf');
      if (parsed.fields.familyMembers) {
        parsed.fields.familyMembers = parsed.fields.familyMembers.map((fam) => ({
          ...fam,
          name: fam.name
            .replace(/^(?:ith|is|residing|with|ip|ar|ding|r)\s+/i, '')
            .replace(/(?:with\s*ip|is\s*residing)/gi, '')
            .trim(),
        }));
      }
      setParsedResult(parsed);
      setFormFields(parsed.fields);
      setSelectedFile(new File([pastedText], 'Pasted_Transcript.pdf', { type: 'application/pdf' }));
      setActiveTab('columns');
    } catch (err: any) {
      setErrorMsg('Error parsing transcript text: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadSampleDemo = (index: number) => {
    setIsProcessing(true);
    setErrorMsg(null);
    setTimeout(() => {
      const sample = getSamplePdfDemoData(index);
      if (sample.fields.familyMembers) {
        sample.fields.familyMembers = sample.fields.familyMembers.map((fam) => ({
          ...fam,
          name: fam.name
            .replace(/^(?:ith|is|residing|with|ip|ar|ding|r)\s+/i, '')
            .replace(/(?:with\s*ip|is\s*residing)/gi, '')
            .trim(),
        }));
      }
      setParsedResult(sample);
      setFormFields(sample.fields);
      setSelectedFile(
        new File(
          ['Sample PDF content'],
          sample.fields.sourcePdfName || 'ESIC_ePehchan_Sample.pdf',
          { type: 'application/pdf' }
        )
      );
      setIsProcessing(false);
    }, 300);
  };

  const handleFieldChange = (field: keyof EmployeeRecord, value: any) => {
    setFormFields((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handler to update specific family member details
  const handleFamilyMemberChange = (index: number, key: string, value: string) => {
    const updatedFamily = [...(formFields.familyMembers || [])];
    updatedFamily[index] = {
      ...updatedFamily[index],
      [key]: value,
    };
    setFormFields((prev) => ({ ...prev, familyMembers: updatedFamily }));
  };

  const handleAddFamilyMember = () => {
    const updatedFamily = [...(formFields.familyMembers || []), { name: '', relation: 'Dependant', dob: '' }];
    setFormFields((prev) => ({ ...prev, familyMembers: updatedFamily }));
  };

  const handleRemoveFamilyMember = (index: number) => {
    const updatedFamily = (formFields.familyMembers || []).filter((_, i) => i !== index);
    setFormFields((prev) => ({ ...prev, familyMembers: updatedFamily }));
  };

  const handleSaveToDatabase = () => {
    if (!formFields.name?.trim()) {
      setErrorMsg('Please enter Employee Full Name (कर्मचारी का नाम).');
      return;
    }

    if (!formFields.insuranceNo || !isValidIpNumber(formFields.insuranceNo)) {
      setErrorMsg('Please enter a valid 10-digit Insurance / IP Number. e.g. 4216776008');
      return;
    }

    const employeeToSave: Omit<EmployeeRecord, 'id' | 'createdAt' | 'updatedAt'> = {
      insuranceNo: formFields.insuranceNo.trim(),
      name: formFields.name || 'New Employee',
      gender: formFields.gender || 'Male',
      fatherOrHusbandName: formFields.fatherOrHusbandName || '',
      relationType: formFields.relationType || (formFields.gender === 'Female' ? 'Husband' : 'Father'),
      dob: formFields.dob || '',
      mobileNo: formFields.mobileNo || '',
      registrationDate: formFields.registrationDate || '',
      address: formFields.address || '',
      city: formFields.city || 'Muzaffarpur',
      state: formFields.state || 'Bihar',
      pincode: formFields.pincode || '842001',
      employerName: formFields.employerName || 'MUZAFFARPUR MUNICIPAL CORPORATION',
      employerCode: formFields.employerCode || '42001884020000908',
      employerAddress: formFields.employerAddress || '',
      appointmentDate: formFields.appointmentDate || '',
      dispensary: formFields.dispensary || 'Kalambagh Chowk, BH (ESIS Disp.)',
      branchOffice: formFields.branchOffice || '',
      familyMembers: formFields.familyMembers,
      nominee: formFields.nominee || { name: 'NITU KUMARI', relation: 'Spouse', percentage: 100 },
      employeePhoto: formFields.employeePhoto,
      familyPhoto: formFields.familyPhoto,
      employeeSignature: formFields.employeeSignature,
      sourcePdfName: selectedFile?.name || 'Uploaded_Document.pdf',
      transcriptData: formFields.transcriptData,
    };

    onSaveEmployee(employeeToSave);

    try {
      confetti({
        particleCount: 70,
        spread: 70,
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
    setPastedText('');
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-4 max-h-[94vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-700 border border-amber-400/40 flex items-center justify-center text-white shadow-md shadow-amber-900/30">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Government PDF Transcript & IP Data Extractor
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                  ESIC e-Pehchan Spec
                </span>
              </div>
              <p className="text-xs text-slate-400">
                PDF अपलोड करें &bull; सभी डेटा टेक्स्ट बॉक्स में शो होगा, जिसे आप एडिट करके सेव कर सकते हैं
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
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('columns')}
                  className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab !== 'paste'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileUp className="w-4 h-4" />
                  <span>Upload PDF File (PDF चुनें)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('paste')}
                  className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'paste'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ClipboardPaste className="w-4 h-4" />
                  <span>Paste Transcript Text (टेक्स्ट पेस्ट करें)</span>
                </button>
              </div>

              {activeTab !== 'paste' ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-amber-500 rounded-3xl p-8 text-center cursor-pointer transition-all bg-slate-950/60 hover:bg-amber-950/10 group"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,application/pdf"
                    className="hidden"
                  />
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                    <FileText className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">
                    Click to Browse or Drag & Drop ESIC PDF File
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Supports official ESIC e-Pehchan cards (e.g. Shashi Bhushan Kumar PDF specification).
                  </p>
                  <div className="inline-flex items-center gap-1.5 mt-4 px-3.5 py-1.5 rounded-full bg-slate-800 text-[11px] font-semibold text-amber-300 border border-slate-700">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Auto Extract & Fully Editable
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <label className="block text-xs font-semibold text-slate-300">
                    Paste raw text copied from ESIC PDF below:
                  </label>
                  <textarea
                    rows={6}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder={`Name of IP : SHASHI BHUSHAN KUMAR\nInsurance No. : 4216776008\nDate of Birth : 15/01/1989\nGender : Male\nMobile Number : 9939776272\nName of Father / Husband : SRI SHIVCHANDRA PASWAN`}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 font-mono focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleProcessPastedText}
                    disabled={isProcessing}
                    className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/30"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Extract Data & Edit Fields</span>
                  </button>
                </div>
              )}

              {/* Sample PDF buttons */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">
                      Instant Test Government Samples / सैंपल चुनें:
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">1-Click Auto Extract</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleLoadSampleDemo(0)}
                    className="p-3 rounded-xl bg-amber-950/30 hover:bg-amber-950/70 border border-amber-700/60 text-left transition-all cursor-pointer"
                  >
                    <p className="text-xs font-bold text-amber-300 truncate">📄 Shashi Bhushan Kumar (4216776008)</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Muzaffarpur Municipal Corporation &bull; Family & Nominee</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSampleDemo(1)}
                    className="p-3 rounded-xl bg-slate-900 hover:bg-blue-950/60 border border-slate-800 text-left transition-all cursor-pointer"
                  >
                    <p className="text-xs font-bold text-slate-200 truncate">📄 Abdul Mogani Ansari (4216789178)</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Muzaffarpur Municipal Corporation</p>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Parsed & Fully Editable Form Fields */
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-700 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-emerald-200">
                        PDF Parsed Successfully! Now Edit Any Field Below Before Saving:
                      </p>
                    </div>
                    <p className="text-[11px] text-emerald-300/80 mt-0.5">
                      File: {selectedFile?.name} &bull; All text boxes are fully editable
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 text-xs rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700 flex items-center gap-1.5 cursor-pointer font-medium"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Upload Another</span>
                </button>
              </div>

              {/* View Switcher */}
              <div className="flex border-b border-slate-800 gap-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('columns')}
                  className={`pb-2 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'columns' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400'
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Editable Form Textboxes (सभी डेटा टेक्स्ट बॉक्स में एडिट करें)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('raw')}
                  className={`pb-2 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'raw' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Raw Transcript</span>
                </button>
              </div>

              {activeTab === 'columns' ? (
                <div className="space-y-4">
                  {/* IP Number & Name Header Card */}
                  <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/40 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-amber-300 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                          <span>Insurance No / IP Number (बीमा संख्या - 10 अंक) *</span>
                        </label>
                        {isValidIpNumber(formFields.insuranceNo) ? (
                          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Valid
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> 10 Digits Required
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        maxLength={10}
                        value={formFields.insuranceNo || ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          handleFieldChange('insuranceNo', val);
                        }}
                        className="w-full bg-slate-950 border-2 border-emerald-500/80 text-emerald-300 rounded-xl px-3 py-2 text-sm font-mono font-bold focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-200 mb-1">
                        Employee Full Name / Name of IP *
                      </label>
                      <input
                        type="text"
                        value={formFields.name || ''}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold"
                      />
                    </div>
                  </div>

                  {/* Personal & Registration Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Gender</label>
                      <select
                        value={formFields.gender || 'Male'}
                        onChange={(e) => handleFieldChange('gender', e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Relation Type</label>
                      <select
                        value={formFields.relationType || 'Father'}
                        onChange={(e) => handleFieldChange('relationType', e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      >
                        <option value="Father">Father</option>
                        <option value="Husband">Husband</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Father / Husband Name</label>
                      <input
                        type="text"
                        value={formFields.fatherOrHusbandName || ''}
                        onChange={(e) => handleFieldChange('fatherOrHusbandName', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Date of Birth</label>
                      <input
                        type="text"
                        value={formFields.dob || ''}
                        onChange={(e) => handleFieldChange('dob', e.target.value)}
                        placeholder="DD/MM/YYYY"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Mobile Number</label>
                      <input
                        type="text"
                        value={formFields.mobileNo || ''}
                        onChange={(e) => handleFieldChange('mobileNo', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Registration Date</label>
                      <input
                        type="text"
                        value={formFields.registrationDate || ''}
                        onChange={(e) => handleFieldChange('registrationDate', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Residential Address</label>
                    <textarea
                      rows={2}
                      value={formFields.address || ''}
                      onChange={(e) => handleFieldChange('address', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  {/* Employer Section */}
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                      <Building2 className="w-4 h-4" />
                      <span>Current Employer Details</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Employer Name</label>
                        <input
                          type="text"
                          value={formFields.employerName || ''}
                          onChange={(e) => handleFieldChange('employerName', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Employer Code</label>
                        <input
                          type="text"
                          value={formFields.employerCode || ''}
                          onChange={(e) => handleFieldChange('employerCode', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Dispensary</label>
                        <input
                          type="text"
                          value={formFields.dispensary || ''}
                          onChange={(e) => handleFieldChange('dispensary', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Appointment Date</label>
                        <input
                          type="text"
                          value={formFields.appointmentDate || ''}
                          onChange={(e) => handleFieldChange('appointmentDate', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Fully Editable Family Members Section */}
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                        <Users className="w-4 h-4" />
                        <span>Family Members ({formFields.familyMembers?.length || 0}) - Editable</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddFamilyMember}
                        className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 rounded-lg text-amber-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Member</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {formFields.familyMembers && formFields.familyMembers.map((fam, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                          <div className="sm:col-span-5">
                            <label className="block text-[10px] text-slate-400 mb-0.5">Name</label>
                            <input
                              type="text"
                              value={fam.name}
                              onChange={(e) => handleFamilyMemberChange(idx, 'name', e.target.value)}
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-semibold"
                            />
                          </div>
                          <div className="sm:col-span-4">
                            <label className="block text-[10px] text-slate-400 mb-0.5">Relationship</label>
                            <input
                              type="text"
                              value={fam.relation}
                              onChange={(e) => handleFamilyMemberChange(idx, 'relation', e.target.value)}
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] text-slate-400 mb-0.5">DOB</label>
                            <input
                              type="text"
                              value={fam.dob || ''}
                              onChange={(e) => handleFamilyMemberChange(idx, 'dob', e.target.value)}
                              placeholder="DD/MM/YYYY"
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                            />
                          </div>
                          <div className="sm:col-span-1 flex items-end justify-center pt-4 sm:pt-0">
                            <button
                              type="button"
                              onClick={() => handleRemoveFamilyMember(idx)}
                              className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/60 cursor-pointer"
                              title="Remove"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Nominee Section */}
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Nominee Details</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Nominee Name</label>
                        <input
                          type="text"
                          value={formFields.nominee?.name || ''}
                          onChange={(e) => setFormFields(prev => ({ ...prev, nominee: { ...(prev.nominee || { relation: '', percentage: 100 }), name: e.target.value } }))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Relationship</label>
                        <input
                          type="text"
                          value={formFields.nominee?.relation || ''}
                          onChange={(e) => setFormFields(prev => ({ ...prev, nominee: { ...(prev.nominee || { name: '', percentage: 100 }), relation: e.target.value } }))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Share %</label>
                        <input
                          type="number"
                          value={formFields.nominee?.percentage || 100}
                          onChange={(e) => setFormFields(prev => ({ ...prev, nominee: { ...(prev.nominee || { name: '', relation: '' }), percentage: Number(e.target.value) } }))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 max-h-72 overflow-y-auto whitespace-pre-wrap leading-relaxed">
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
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Database className="w-4 h-4 text-amber-300" />
              <span>Save & Generate Smart ID Card (डेटा सेव करें)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
