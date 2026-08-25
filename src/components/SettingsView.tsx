import React, { useState, useRef } from 'react';
import {
  Settings,
  Upload,
  Building2,
  FileSignature,
  Stamp,
  Phone,
  Globe,
  Save,
  RotateCcw,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { GlobalSettings } from '../types';
import { DEFAULT_EMPLOYER_SIGNATURE, DEFAULT_EMPLOYER_STAMP } from '../utils/defaultAssets';

interface SettingsViewProps {
  settings: GlobalSettings;
  onSaveSettings: (newSettings: GlobalSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<GlobalSettings>({ ...settings });
  const [isSavedBanner, setIsSavedBanner] = useState(false);

  const signInputRef = useRef<HTMLInputElement>(null);
  const stampInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof GlobalSettings, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUploadImage = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'sign' | 'stamp'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      if (type === 'sign') {
        handleInputChange('employerSignature', base64);
      } else {
        handleInputChange('employerStamp', base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setIsSavedBanner(true);
    setTimeout(() => setIsSavedBanner(false), 3000);
  };

  const handleResetToDefault = () => {
    const resetData: GlobalSettings = {
      ...formData,
      employerSignature: DEFAULT_EMPLOYER_SIGNATURE,
      employerStamp: DEFAULT_EMPLOYER_STAMP,
    };
    setFormData(resetData);
    onSaveSettings(resetData);
    setIsSavedBanner(true);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Portal Settings & Global Assets (Sign.jpg)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Employer Signature (Sign.jpg) सभी कर्मचारी कार्ड्स में कॉमन रूप से प्रदर्शित होता है
            </p>
          </div>
        </div>
      </div>

      {isSavedBanner && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Global Settings & Sign.jpg updated! All employee cards are synchronized.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* CRITICAL ASSET: EMPLOYER SIGNATURE (Sign.jpg) */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSignature className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-bold text-white">
                  Common Employer Signature / नियोक्ता हस्ताक्षर (Sign.jpg)
                </h3>
                <p className="text-xs text-slate-400">
                  यह सिग्नेचर सभी कर्मचारियों के कार्ड के बैक साइड पर ऑटोमैटिक शो करेगा
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetToDefault}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Default</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {/* 1. Employer Signature (Sign.jpg) */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center">
              <span className="text-xs font-semibold text-slate-300 mb-2">
                Active Sign.jpg (हस्ताक्षर)
              </span>
              <div className="w-full h-32 rounded-xl border border-slate-700 bg-white/95 flex items-center justify-center p-3 mb-3 shadow-inner overflow-hidden">
                <img
                  src={formData.employerSignature}
                  alt="Employer Signature"
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <input
                type="file"
                ref={signInputRef}
                onChange={(e) => handleUploadImage(e, 'sign')}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => signInputRef.current?.click()}
                className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload New Sign.jpg</span>
              </button>
            </div>

            {/* 2. Official Seal / Stamp */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center">
              <span className="text-xs font-semibold text-slate-300 mb-2">
                Official Seal / Stamp (मुहर)
              </span>
              <div className="w-full h-32 rounded-xl border border-slate-700 bg-white/95 flex items-center justify-center p-3 mb-3 shadow-inner overflow-hidden">
                {formData.employerStamp ? (
                  <img
                    src={formData.employerStamp}
                    alt="Employer Stamp"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-slate-400 italic">No stamp configured</span>
                )}
              </div>

              <input
                type="file"
                ref={stampInputRef}
                onChange={(e) => handleUploadImage(e, 'stamp')}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => stampInputRef.current?.click()}
                className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Official Stamp</span>
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 2: ORGANIZATION / CARD DETAILS */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span>Organization & Card Header Configuration</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Organization / Corporation Name (संस्था का नाम)
              </label>
              <input
                type="text"
                value={formData.organizationName}
                onChange={(e) => handleInputChange('organizationName', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Portal Title (पोर्टल शीर्षक)
              </label>
              <input
                type="text"
                value={formData.portalTitle}
                onChange={(e) => handleInputChange('portalTitle', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Helpline Numbers (हेल्पलाइन)
              </label>
              <input
                type="text"
                value={formData.helplineNo}
                onChange={(e) => handleInputChange('helplineNo', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save All Changes (सेटिंग्स सुरक्षित करें)</span>
          </button>
        </div>
      </form>
    </div>
  );
};
