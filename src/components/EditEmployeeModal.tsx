import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Upload,
  User,
  Users,
  PenTool,
  Save,
  CheckCircle2,
  Trash2,
  Camera,
  Image as ImageIcon,
  RotateCcw,
} from 'lucide-react';
import { EmployeeRecord } from '../types';

interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: EmployeeRecord | null;
  onSave: (id: string, updates: Partial<EmployeeRecord>) => void;
}

export const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  isOpen,
  onClose,
  employee,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<EmployeeRecord>>({});
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [familyPhotoPreview, setFamilyPhotoPreview] = useState<string>('');
  const [signaturePreview, setSignaturePreview] = useState<string>('');
  const [activeSignMode, setActiveSignMode] = useState<'upload' | 'draw'>('upload');

  // Refs for file inputs
  const photoInputRef = useRef<HTMLInputElement>(null);
  const familyPhotoInputRef = useRef<HTMLInputElement>(null);
  const signInputRef = useRef<HTMLInputElement>(null);

  // Canvas for signature drawing
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({ ...employee });
      setPhotoPreview(employee.employeePhoto || '');
      setFamilyPhotoPreview(employee.familyPhoto || '');
      setSignaturePreview(employee.employeeSignature || '');
    }
  }, [employee]);

  // Handle canvas drawing setup
  useEffect(() => {
    if (activeSignMode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [activeSignMode]);

  if (!isOpen || !employee) return null;

  const handleInputChange = (field: keyof EmployeeRecord, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Convert uploaded image to Base64 data URL
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'photo' | 'family' | 'sign'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      if (type === 'photo') {
        setPhotoPreview(base64);
        handleInputChange('employeePhoto', base64);
      } else if (type === 'family') {
        setFamilyPhotoPreview(base64);
        handleInputChange('familyPhoto', base64);
      } else if (type === 'sign') {
        setSignaturePreview(base64);
        handleInputChange('employeeSignature', base64);
      }
    };
    reader.readAsDataURL(file);
  };

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      setSignaturePreview(dataUrl);
      handleInputChange('employeeSignature', dataUrl);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      setSignaturePreview('');
      handleInputChange('employeeSignature', '');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(employee.id, formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-4 flex flex-col max-h-[94vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Edit Employee Details & Upload Photos / Signatures
              </h2>
              <p className="text-xs text-slate-400">
                IP No: <strong className="text-blue-400 font-mono">{employee.insuranceNo}</strong> &bull; Photo, Family Photo व Signature अपडेट करें
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* SECTION 1: PHOTO & SIGNATURE UPLOADERS */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-amber-400" />
              <span>Photos & Signature Upload / फोटो व हस्ताक्षर अपलोड</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* 1. Employee Photo */}
              <div className="flex flex-col items-center p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs font-semibold text-slate-300 mb-2">Employee Photo (फोटो)</span>
                <div className="relative w-24 h-28 rounded-xl overflow-hidden ring-2 ring-blue-500/40 bg-slate-800 mb-3 shadow-md">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-[10px]">
                      <User className="w-6 h-6 mb-1" />
                      <span>No Photo</span>
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  ref={photoInputRef}
                  onChange={(e) => handleImageUpload(e, 'photo')}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="w-full py-1.5 px-3 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload Photo</span>
                </button>
              </div>

              {/* 2. Family Photo */}
              <div className="flex flex-col items-center p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs font-semibold text-slate-300 mb-2">Family Photo (परिवार)</span>
                <div className="relative w-28 h-28 rounded-xl overflow-hidden ring-2 ring-purple-500/40 bg-slate-800 mb-3 shadow-md">
                  {familyPhotoPreview ? (
                    <img src={familyPhotoPreview} alt="Family Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-[10px]">
                      <Users className="w-6 h-6 mb-1" />
                      <span>No Photo</span>
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  ref={familyPhotoInputRef}
                  onChange={(e) => handleImageUpload(e, 'family')}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => familyPhotoInputRef.current?.click()}
                  className="w-full py-1.5 px-3 rounded-lg bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload Family</span>
                </button>
              </div>

              {/* 3. Employee Signature */}
              <div className="flex flex-col items-center p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-300">Emp Signature</span>
                  <div className="flex bg-slate-950 rounded-lg p-0.5 border border-slate-800 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setActiveSignMode('upload')}
                      className={`px-1.5 py-0.5 rounded font-medium ${
                        activeSignMode === 'upload' ? 'bg-blue-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      File
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSignMode('draw')}
                      className={`px-1.5 py-0.5 rounded font-medium ${
                        activeSignMode === 'draw' ? 'bg-blue-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      Draw
                    </button>
                  </div>
                </div>

                {activeSignMode === 'upload' ? (
                  <>
                    <div className="w-full h-28 rounded-xl border border-slate-700 bg-white/90 mb-3 flex items-center justify-center p-2 overflow-hidden">
                      {signaturePreview ? (
                        <img
                          src={signaturePreview}
                          alt="Signature Preview"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <span className="text-xs text-slate-400 italic">No signature uploaded</span>
                      )}
                    </div>

                    <input
                      type="file"
                      ref={signInputRef}
                      onChange={(e) => handleImageUpload(e, 'sign')}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => signInputRef.current?.click()}
                      className="w-full py-1.5 px-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload Signature</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="relative w-full h-28 rounded-xl border border-slate-600 bg-white mb-2 overflow-hidden">
                      <canvas
                        ref={canvasRef}
                        width={240}
                        height={110}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full h-full cursor-crosshair touch-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="w-full py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Clear Drawing</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: TEXT DETAILS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Insurance No (IP No) *
              </label>
              <input
                type="text"
                required
                value={formData.insuranceNo || ''}
                onChange={(e) => handleInputChange('insuranceNo', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name (कर्मचारी का नाम) *
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Gender (लिंग)
              </label>
              <select
                value={formData.gender || 'Male'}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Father / Husband Name
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.relationType || 'Father'}
                  onChange={(e) => handleInputChange('relationType', e.target.value)}
                  className="w-1/3 bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white focus:border-blue-500"
                >
                  <option value="Father">Father</option>
                  <option value="Husband">Husband</option>
                </select>
                <input
                  type="text"
                  value={formData.fatherOrHusbandName || ''}
                  onChange={(e) => handleInputChange('fatherOrHusbandName', e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Date of Birth (DOB)
              </label>
              <input
                type="date"
                value={formData.dob || ''}
                onChange={(e) => handleInputChange('dob', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Mobile Number
              </label>
              <input
                type="text"
                value={formData.mobileNo || ''}
                onChange={(e) => handleInputChange('mobileNo', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Residential Address (आवासीय पता)
              </label>
              <textarea
                rows={2}
                value={formData.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Employer Name (नियोक्ता का नाम)
              </label>
              <input
                type="text"
                value={formData.employerName || ''}
                onChange={(e) => handleInputChange('employerName', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Employer Code
              </label>
              <input
                type="text"
                value={formData.employerCode || ''}
                onChange={(e) => handleInputChange('employerCode', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 font-mono"
              />
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-all cursor-pointer"
          >
            Cancel / रद्द करें
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Update & Save in Database (डेटाबेस अपडेट करें)</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
