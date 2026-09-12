import * as pdfjsLib from 'pdfjs-dist';
import { EmployeeRecord, ParsedPdfResult, EmployeeFamilyMember } from '../types';
import {
  DEFAULT_AVATAR_MALE,
  DEFAULT_AVATAR_FEMALE,
  DEFAULT_EMPLOYEE_SIGNATURE,
  DEFAULT_FAMILY_PHOTO,
} from './defaultAssets';

// Setup pdf.js worker dynamically matching installed version
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '3.11.174'}/build/pdf.worker.min.js`;
  } catch (e) {
    console.warn('Worker configuration notice:', e);
  }
}

/**
 * Extract raw text from PDF file.
 * Prioritizes client-side extraction with local worker and server-side fallback.
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  // 1. Primary: Direct Client-Side PDF.js Extraction
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    });

    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      const items = textContent.items
        .map((item: any) => item.str || '')
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);

      fullText += `\n--- PAGE ${i} ---\n` + items.join('\n') + '\n';
    }

    if (fullText.trim().length > 15) {
      return fullText;
    }
  } catch (clientErr) {
    console.warn('Client PDF.js extraction attempt failed, trying server API:', clientErr);
  }

  // 2. Secondary: Server-side fallback (/api/extract-pdf)
  try {
    const base64Data = await fileToBase64(file);
    const res = await fetch('/api/extract-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileBase64: base64Data, fileName: file.name }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.text && data.text.trim().length > 15) {
        return data.text;
      }
    }
  } catch (serverErr) {
    console.warn('Server fallback also unavailable:', serverErr);
  }

  // 3. Tertiary: Binary Stream Extraction
  try {
    const arrayBuffer = await file.arrayBuffer();
    const decoder = new TextDecoder('latin1');
    const rawPdf = decoder.decode(arrayBuffer);
    const matches = rawPdf.match(/\(([^()]+)\)[\s]*T[jJ]/g);
    if (matches && matches.length > 10) {
      const extracted = matches
        .map((m) => m.replace(/^[\s(]+|[)Tj\s]+$/g, ''))
        .join(' ');
      if (extracted.length > 40) return extracted;
    }
  } catch (binErr) {
    console.error('Binary stream extraction failed:', binErr);
  }

  throw new Error('PDF read nahi ho saki. Kripya valid ESIC e-Pehchan PDF upload karein.');
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
  });
}

/**
 * Validates whether a given string is a genuine 10-digit ESIC IP Number
 */
export function isValidIpNumber(ip: string | undefined | null): boolean {
  if (!ip) return false;
  const digits = String(ip).replace(/\D/g, '');
  if (digits.length !== 10) return false;
  if (/^0{2,}/.test(digits)) return false;
  if (/^(\d)\1{9}$/.test(digits)) return false;
  return true;
}

/**
 * Master ESIC e-Pehchan Transcript Parser
 * Supports both Sequential Columnar PDFs and Linear Text Layouts
 */
export function parsePdfTranscript(rawText: string, fileName: string = ''): ParsedPdfResult {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && l !== ':');

  const cleanText = rawText.replace(/\s+/g, ' ');

  let insuranceNo = '';
  let name = '';
  let dob = '';
  let gender: 'Male' | 'Female' | 'Other' = 'Male';
  let mobileNo = '';
  let registrationDate = '';
  let maritalStatus = 'Married';
  let fatherOrHusbandName = '';
  let presentAddress = '';
  let permanentAddress = '';
  let employerCode = '42001884020000908';
  let employerName = 'MUZAFFARPUR MUNICIPAL CORPORATION';
  let appointmentDate = '';
  let dispensary = 'Kalambagh Chowk, BH (ESIS Disp.)';
  let branchOffice = 'DCBO - Muzaffarpur, ESIC DCBO, Behind S.B.I. Bhagwanpur Chowk';
  let printDate = '';
  const familyMembers: EmployeeFamilyMember[] = [];
  let nominee: { name: string; relation: string; share?: string; address?: string } | undefined = undefined;

  // 1. IP Number
  const ipMatch = cleanText.match(/(?:Insurance\s*No\.?|IP\s*Number|IP\s*No\.?)[^\d]*[:\-]?\s*(\d{10})/i);
  if (ipMatch && isValidIpNumber(ipMatch[1])) {
    insuranceNo = ipMatch[1];
  }

  // 2. Personal Details (PyPDF / pdfjs Sequential Value Block)
  const personalIdx = lines.findIndex((l) => /PERSONAL\s*DETAILS/i.test(l));
  if (personalIdx !== -1) {
    const pLines: string[] = [];
    for (let i = personalIdx + 1; i < lines.length; i++) {
      if (/REGISTRATION\s*DETAILS|CURRENT\s*EMPLOYER/i.test(lines[i])) break;
      pLines.push(lines[i]);
    }

    const aadhaarIdx = pLines.findIndex((l) => /Aadhaar/i.test(l));
    if (aadhaarIdx !== -1 && aadhaarIdx + 1 < pLines.length) {
      const valLines = pLines.slice(aadhaarIdx + 1);
      if (valLines.length >= 1 && !valLines[0].includes(':')) name = cleanExtractedString(valLines[0]);
      if (valLines.length >= 2 && /\d{2}[\/\-]\d{2}[\/\-]\d{4}/.test(valLines[1])) dob = normalizeDate(valLines[1]);
      if (valLines.length >= 3 && /Male|Female/i.test(valLines[2])) gender = valLines[2].toLowerCase().includes('female') ? 'Female' : 'Male';
      if (valLines.length >= 4 && /\d{10}/.test(valLines[3])) mobileNo = valLines[3].match(/\d{10}/)![0];
      if (valLines.length >= 6 && /\d{2}[\/\-]\d{2}[\/\-]\d{4}/.test(valLines[5])) registrationDate = normalizeDate(valLines[5]);
      if (!insuranceNo && valLines.length >= 7 && /\d{10}/.test(valLines[6])) insuranceNo = valLines[6];
    }
  }

  // Fallbacks if text was rendered linearly
  if (!name) {
    const m = cleanText.match(/Name\s*of\s*IP[\s\S]*?[:\|]\s*([A-Za-z\s\.]+?)(?=\s+(?:Date of Birth|DOB|Gender|Mobile|Email|$))/i);
    if (m) name = cleanExtractedString(m[1]);
  }
  if (!dob) {
    const m = cleanText.match(/Date\s*of\s*Birth[\s\S]*?[:\|]\s*(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i);
    if (m) dob = normalizeDate(m[1]);
  }
  if (!mobileNo) {
    const m = cleanText.match(/Mobile\s*Number[\s\S]*?[:\|]\s*(\d{10})/i);
    if (m) mobileNo = m[1];
  }
  if (!registrationDate) {
    const m = cleanText.match(/Registration\s*Date[\s\S]*?[:\|]\s*(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i);
    if (m) registrationDate = normalizeDate(m[1]);
  }

  // 3. Registration Details (Father/Husband, Marital Status, Address)
  const regIdx = lines.findIndex((l) => /REGISTRATION\s*DETAILS/i.test(l));
  if (regIdx !== -1) {
    const rLines: string[] = [];
    for (let i = regIdx + 1; i < lines.length; i++) {
      if (/CURRENT\s*EMPLOYER|FAMILY\s*DETAILS/i.test(lines[i])) break;
      rLines.push(lines[i]);
    }

    const impFamilyIdx = rLines.findIndex((l) => /IMP\s*for\s*Family/i.test(l));
    if (impFamilyIdx !== -1 && impFamilyIdx + 1 < rLines.length) {
      const vals = rLines.slice(impFamilyIdx + 1);
      if (vals.length > 0 && /Married|Unmarried|Widow|Divorced/i.test(vals[0])) {
        maritalStatus = vals[0];
      }

      let cur = 2; // skip status & disability
      const pAddr: string[] = [];
      while (cur < vals.length && !/ESIS|Disp/i.test(vals[cur])) {
        pAddr.push(vals[cur]);
        cur++;
      }
      presentAddress = cleanAddressString(pAddr.join(' '));

      cur++; // skip dispensary
      if (cur < vals.length) {
        fatherOrHusbandName = cleanExtractedString(vals[cur]);
        cur++;
      }

      const permAddr: string[] = [];
      while (cur < vals.length && !/ESIS|Disp/i.test(vals[cur])) {
        permAddr.push(vals[cur]);
        cur++;
      }
      permanentAddress = cleanAddressString(permAddr.join(' '));
    }
  }

  // Linear Fallbacks for Registration
  if (!fatherOrHusbandName) {
    const m = cleanText.match(/Name\s*of\s*Father\s*\/?\s*Husband[\s\S]*?[:\|]\s*([A-Za-z\s\.]+?)(?=\s+(?:Permanent|Present|Address|Dispensary|Type|$))/i);
    if (m) fatherOrHusbandName = cleanExtractedString(m[1]);
  }
  if (!presentAddress) {
    const m = cleanText.match(/Present\s*Address[\s\S]*?[:\|]\s*([A-Za-z0-9\s,.:\-\/]+?)(?=\s+(?:Dispensary|Permanent|CURRENT|$))/i);
    if (m) presentAddress = cleanAddressString(m[1]);
  }
  if (!permanentAddress) {
    const m = cleanText.match(/Permanent\s*Address[\s\S]*?[:\|]\s*([A-Za-z0-9\s,.:\-\/]+?)(?=\s+(?:Dispensary|CURRENT|$))/i);
    if (m) permanentAddress = cleanAddressString(m[1]);
  }

  // 4. Employer Details
  const empCodeMatch = cleanText.match(/\b(\d{17})\b/);
  if (empCodeMatch) employerCode = empCodeMatch[1];

  if (cleanText.includes('MUZAFFARPUR MUNICIPAL CORPORATION')) {
    employerName = 'MUZAFFARPUR MUNICIPAL CORPORATION';
  } else {
    const empNameMatch = cleanText.match(/Name\s*of\s*Employer[\s\S]*?[:\|]\s*([A-Za-z0-9\s,\.\(\)&\'\-]+?)(?=\s+(?:Date\s*of|Sub\s*Unit|Address|$))/i);
    if (empNameMatch) employerName = cleanExtractedString(empNameMatch[1]);
  }

  const apptMatch = cleanText.match(/(?:Appointment|None)[\s\S]*?(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i);
  if (apptMatch) appointmentDate = normalizeDate(apptMatch[1]);

  // 5. Family Members (Robust Extraction without Header Noise)
  const famRegex = /([A-Za-z\s]{3,35})\s+(Spouse|Dependant\s+unmarried\s+daughter|Minor\s+dependant\s+son|Dependant\s+mother|Father)\s+(\d{2}[\/\-]\d{2}[\/\-]\d{4})/gi;
  let fMatch;
  while ((fMatch = famRegex.exec(cleanText)) !== null) {
    const rawName = fMatch[1]
      .replace(/Is\s*Residing/gi, '')
      .replace(/with\s*IP/gi, '')
      .replace(/Name/gi, '')
      .replace(/Relation/gi, '')
      .replace(/Date\s*of\s*Birth/gi, '')
      .trim();

    const cleanMemName = cleanExtractedString(rawName);
    if (cleanMemName && cleanMemName.length > 2) {
      familyMembers.push({
        name: cleanMemName,
        relation: fMatch[2].replace(/\s+/g, ' ').trim(),
        dob: normalizeDate(fMatch[3]),
      });
    }
  }

  // 6. Nominee Details (Page 2)
  const nomMatch = cleanText.match(/\n([A-Za-z\s]{3,30})\s+(Spouse|Dependant\s+mother|Minor\s+dependant\s+son|Mother|Father)\s+(?:NA|\d{2}[\/\-]\d{2}[\/\-]\d{4})?\s+100/i);
  if (nomMatch) {
    const rawNomName = nomMatch[1].split('\n').pop()?.trim() || '';
    nominee = {
      name: cleanExtractedString(rawNomName),
      relation: nomMatch[2].replace(/\s+/g, ' ').trim(),
      share: '100%',
      address: presentAddress || '',
    };
  }

  // 7. Print Date
  const dateMatch = cleanText.match(/Date\s*:\s*(\d{2}[\/\-]\d{2}[\/\-]\d{4}\s+\d{2}:\d{2}:\d{2})/i);
  if (dateMatch) printDate = dateMatch[1];

  const relationType: 'Father' | 'Husband' =
    maritalStatus === 'Married' && gender === 'Female' ? 'Husband' : 'Father';

  const fields: Partial<EmployeeRecord> = {
    insuranceNo: insuranceNo || (fileName.match(/\b\d{10}\b/) ? fileName.match(/\b\d{10}\b/)![0] : ''),
    name: name || 'Employee',
    gender,
    fatherOrHusbandName: fatherOrHusbandName || '',
    relationType,
    dob: dob || '',
    mobileNo: mobileNo || '',
    registrationDate: registrationDate || '',
    address: presentAddress || permanentAddress || '',
    city: 'Muzaffarpur',
    state: 'Bihar',
    pincode: '842001',
    employerName,
    employerCode: employerCode || '42001884020000908',
    employerAddress: 'Near Muzaffarpur Railway Station, Civil Court Campus, Hpo Ps Town, Dist: Muzaffarpur Bihar 842001',
    appointmentDate: appointmentDate || '',
    dispensary,
    branchOffice,
    familyMembers: familyMembers.length > 0 ? familyMembers : undefined,
    nominee,
    employeePhoto: gender === 'Female' ? DEFAULT_AVATAR_FEMALE : DEFAULT_AVATAR_MALE,
    familyPhoto: DEFAULT_FAMILY_PHOTO,
    employeeSignature: DEFAULT_EMPLOYEE_SIGNATURE,
    sourcePdfName: fileName || 'ESIC_ePehchan_Document.pdf',
  };

  return {
    rawText,
    fields,
    confidence: isValidIpNumber(fields.insuranceNo) && fields.name ? 0.99 : 0.85,
    extractedLines: lines.slice(0, 100),
  };
}

function cleanExtractedString(str: string): string {
  return str
    .replace(/^[:\-\s|]+/, '')
    .replace(/[:\-\s|]+$/, '')
    .replace(/\s*(?:Insurance|UHID|UAN|ABHA|Aadhaar|Date\s*of\s*Birth|Gender|Mobile|Email|Registration|Permanent|Present|Marital).*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanAddressString(str: string): string {
  return str
    .replace(/^[:\-\s|]+/, '')
    .replace(/[:\-\s|]+$/, '')
    .replace(/\s*(?:Dispensary|IMP\s*for|Branch\s*Office|CURRENT\s*EMPLOYER|FAMILY\s*DETAILS).*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeDate(raw: string): string {
  try {
    const parts = raw.split(/[\/\-\.]/);
    if (parts.length === 3) {
      let d = parseInt(parts[0], 10);
      let m = parseInt(parts[1], 10);
      let y = parseInt(parts[2], 10);
      if (y < 100) y += 1900;
      if (parts[0].length === 4) {
        y = parseInt(parts[0], 10);
        m = parseInt(parts[1], 10);
        d = parseInt(parts[2], 10);
      }
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  } catch (e) {}
  return '';
}

export function getSamplePdfDemoData(index: number = 0): ParsedPdfResult {
  const sampleProfiles = [
    {
      name: 'RAJU RAM',
      gender: 'Male' as const,
      fatherOrHusbandName: 'RAMBHAJAN RAM',
      dob: '1993-01-01',
      mobileNo: '7643003444',
      insuranceNo: '4216788978',
      address: 'BRAHMPURA, Dist: Muzaffarpur, Bihar',
    },
    {
      name: 'SURAJ KUMAR',
      gender: 'Male' as const,
      fatherOrHusbandName: 'BAIJU CHAUDHARY',
      dob: '1990-06-05',
      mobileNo: '9031730902',
      insuranceNo: '4216777691',
      address: 'YOGIYA MATH, COMPANY BAAG, Dist: Muzaffarpur, Bihar',
    },
  ];

  const p = sampleProfiles[index % sampleProfiles.length];
  return {
    rawText: `Name of IP: ${p.name}\nInsurance No: ${p.insuranceNo}`,
    fields: {
      insuranceNo: p.insuranceNo,
      name: p.name,
      gender: p.gender,
      fatherOrHusbandName: p.fatherOrHusbandName,
      relationType: 'Father',
      dob: p.dob,
      mobileNo: p.mobileNo,
      address: p.address,
      city: 'Muzaffarpur',
      state: 'Bihar',
      pincode: '842001',
      employerName: 'MUZAFFARPUR MUNICIPAL CORPORATION',
      employerCode: '42001884020000908',
      dispensary: 'Kalambagh Chowk, BH (ESIS Disp.)',
      branchOffice: 'DCBO - Muzaffarpur, ESIC DCBO, Behind S.B.I. Bhagwanpur Chowk',
      employeePhoto: DEFAULT_AVATAR_MALE,
      familyPhoto: DEFAULT_FAMILY_PHOTO,
      employeeSignature: DEFAULT_EMPLOYEE_SIGNATURE,
    },
    confidence: 0.99,
    extractedLines: [],
  };
}
