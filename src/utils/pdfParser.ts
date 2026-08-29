import * as pdfjsLib from 'pdfjs-dist';
import { EmployeeRecord, ParsedPdfResult, EmployeeFamilyMember } from '../types';
import {
  DEFAULT_AVATAR_MALE,
  DEFAULT_AVATAR_FEMALE,
  DEFAULT_EMPLOYEE_SIGNATURE,
  DEFAULT_FAMILY_PHOTO,
} from './defaultAssets';

// Setup pdf.js worker for client-side fallback
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

/**
 * Extract raw text from PDF file.
 * Prioritizes server-side /api/extract-pdf (powered by Node pdf-parse)
 * and falls back to client-side pdfjs-dist.
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  // 1. Primary: Server-side high-precision extraction
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
        console.log(`✅ [PDF Text Extracted via Server]: ${data.text.length} chars`);
        return data.text;
      }
    }
  } catch (serverErr) {
    console.warn('Server PDF extraction failed, attempting client-side fallback:', serverErr);
  }

  // 2. Secondary: Client-side pdfjsLib extraction
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
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
      console.log(`✅ [PDF Text Extracted via Client PDF.js]: ${fullText.length} chars`);
      return fullText;
    }
  } catch (clientErr) {
    console.warn('Client PDF.js extraction failed:', clientErr);
  }

  // If both automated methods fail, return a message prompting OCR paste
  throw new Error('PDF text could not be extracted automatically. Please copy & paste the OCR text using the "Paste Transcript" tab.');
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
 * Validates whether a given string is a genuine 10-digit ESIC IP / Insurance Number
 */
export function isValidIpNumber(ip: string | undefined | null): boolean {
  if (!ip) return false;
  const digits = String(ip).replace(/\D/g, '');
  if (digits.length !== 10) return false;
  // Cannot be all zeros, start with 00, or be repeating single digit
  if (/^0{2,}/.test(digits)) return false;
  if (/^(\d)\1{9}$/.test(digits)) return false;
  return true;
}

/**
 * Master Government ESIC e-Pehchan Transcript Parser
 * Supports both Sequential Column OCR text & Standard Key-Value layouts.
 */
export function parsePdfTranscript(rawText: string, fileName: string = ''): ParsedPdfResult {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const cleanText = rawText.replace(/\s+/g, ' ');

  // -------------------------------------------------------------------------
  // MODE 1: SEQUENTIAL COLUMNAR OCR STRUCTURE (Exact match for ESIC Cards)
  // -------------------------------------------------------------------------
  let seqName = '';
  let seqDob = '';
  let seqGender = '';
  let seqMobile = '';
  let seqRegDate = '';
  let seqIpNumber = '';
  let seqFatherName = '';
  let seqPresentAddress = '';
  let seqPermanentAddress = '';
  let seqDispensaryIp = '';
  let seqDispensaryFamily = '';

  // Look for PERSONAL DETAILS section
  const personalIdx = lines.findIndex((l) => /PERSONAL\s*DETAILS/i.test(l));
  if (personalIdx !== -1) {
    // Collect lines in PERSONAL DETAILS until REGISTRATION DETAILS or CURRENT EMPLOYER
    const pLines: string[] = [];
    for (let i = personalIdx + 1; i < lines.length; i++) {
      if (/REGISTRATION\s*DETAILS|CURRENT\s*EMPLOYER/i.test(lines[i])) break;
      pLines.push(lines[i]);
    }

    // Find the end of the label block (marked by 'Aadhaar' or 'ABHA Address' or 'Registration Date')
    const aadhaarIdx = pLines.findIndex((l) => /^Aadhaar\s*:?$/i.test(l) || /^Aadhaar$/i.test(l));
    if (aadhaarIdx !== -1 && aadhaarIdx + 1 < pLines.length) {
      const valLines = pLines.slice(aadhaarIdx + 1).filter((l) => l.length > 0);
      if (valLines.length >= 1) seqName = cleanExtractedString(valLines[0]);
      if (valLines.length >= 2 && /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/.test(valLines[1])) {
        seqDob = normalizeDate(valLines[1]);
      }
      if (valLines.length >= 3 && /Male|Female|Other/i.test(valLines[2])) {
        seqGender = valLines[2].toLowerCase().includes('female') ? 'Female' : 'Male';
      }
      if (valLines.length >= 4 && /[6-9]\d{9}/.test(valLines[3])) {
        seqMobile = valLines[3].match(/[6-9]\d{9}/)![0];
      }
      if (valLines.length >= 6 && /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/.test(valLines[5])) {
        seqRegDate = normalizeDate(valLines[5]);
      }
      if (valLines.length >= 7 && /[1-9]\d{9}/.test(valLines[6])) {
        const candidate = valLines[6].match(/[1-9]\d{9}/)![0];
        if (isValidIpNumber(candidate)) seqIpNumber = candidate;
      }
    }
  }

  // Look for REGISTRATION DETAILS section in sequential format
  const regIdx = lines.findIndex((l) => /REGISTRATION\s*DETAILS/i.test(l));
  if (regIdx !== -1) {
    const rLines: string[] = [];
    for (let i = regIdx + 1; i < lines.length; i++) {
      if (/CURRENT\s*EMPLOYER|FAMILY\s*DETAILS/i.test(lines[i])) break;
      rLines.push(lines[i]);
    }

    // Find the end of labels: 'IMP for Family' or 'Dispensary'
    const lastLabelIdx = rLines.findIndex((l) => /IMP\s*for\s*Family|Dispensary\s*\/\s*IMP/i.test(l));
    if (lastLabelIdx !== -1 && lastLabelIdx + 1 < rLines.length) {
      const valLines = rLines.slice(lastLabelIdx + 1).filter((l) => l.length > 0);
      // Format: Married, NA, Present Address..., Dispensary..., Father Name..., Permanent Address..., Dispensary...
      if (valLines.length >= 3) {
        // Line 0 is Married/Unmarried, Line 1 is NA/Disability, Line 2 is Present Address
        seqPresentAddress = cleanAddressString(valLines.slice(2, 4).join(' '));
      }
      if (valLines.length >= 5) {
        // Line 4 or 5 is Father / Husband Name
        const possibleFather = valLines.find((vl) =>
          /^[A-Z\s\.]{3,35}$/.test(vl) &&
          !/Married|Dispensary|Chowk|School|Dist|Bihar|Road|Nagar|Disp/i.test(vl)
        );
        if (possibleFather) {
          seqFatherName = cleanExtractedString(possibleFather);
        }
      }
    }
  }

  // -------------------------------------------------------------------------
  // MODE 2: DIRECT REGEX MATCHING (Highest Precision)
  // -------------------------------------------------------------------------

  // 1. IP / INSURANCE NUMBER (10 Digits)
  let insuranceNo = seqIpNumber;

  // A. Check Footer IP Number (e.g. "IP Number : 4216828319")
  if (!insuranceNo) {
    const footerIpMatch = cleanText.match(/(?:IP\s*Number|IP\s*No\.?|Insured\s*Person\s*Number)\s*[:\-]\s*([1-9]\d{9})/i);
    if (footerIpMatch && isValidIpNumber(footerIpMatch[1])) {
      insuranceNo = footerIpMatch[1];
    }
  }

  // B. Check Direct "Insurance No. : 4216828319"
  if (!insuranceNo) {
    const directInsMatch = cleanText.match(/(?:Insurance\s*No\.?|Insurance\s*Number|बीमा\s*संख्या|e-Pehchan\s*No\.?)\s*[:\-]\s*([1-9]\d{9})/i);
    if (directInsMatch && isValidIpNumber(directInsMatch[1])) {
      insuranceNo = directInsMatch[1];
    }
  }

  // C. Line by line scan near "Insurance No" or "IP Number"
  if (!insuranceNo) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/Insurance\s*No|IP\s*Number|IP\s*No|बीमा\s*संख्या/i.test(line)) {
        const m = line.match(/\b([1-9]\d{9})\b/);
        if (m && isValidIpNumber(m[1])) {
          insuranceNo = m[1];
          break;
        }
        if (i + 1 < lines.length) {
          const mNext = lines[i + 1].match(/\b([1-9]\d{9})\b/);
          if (mNext && isValidIpNumber(mNext[1])) {
            insuranceNo = mNext[1];
            break;
          }
        }
      }
    }
  }

  // D. Filename extraction (e.g. "ABHAY_4216828319.pdf")
  if (!insuranceNo && fileName) {
    const fnMatch = fileName.match(/\b([1-9]\d{9})\b/);
    if (fnMatch && isValidIpNumber(fnMatch[1])) {
      insuranceNo = fnMatch[1];
    }
  }

  // E. Scan entire text for any 10-digit number that starts with 1-9 (excluding mobile)
  let mobileNo = seqMobile;
  const mobMatch =
    cleanText.match(/(?:Mobile\s*Number|Mobile\s*No\.?|Phone\s*No\.?|Contact\s*No\.?|Mobile)[^\d]*[:\-]?\s*([6-9]\d{9})/i) ||
    cleanText.match(/\b([6-9]\d{9})\b/);
  if (mobMatch && mobMatch[1]) {
    mobileNo = mobMatch[1].trim();
  }

  if (!insuranceNo) {
    const all10Digits = Array.from(cleanText.matchAll(/\b([1-9]\d{9})\b/g)).map((m) => m[1]);
    const candidates = all10Digits.filter((d) => isValidIpNumber(d) && d !== mobileNo);
    if (candidates.length > 0) {
      insuranceNo = candidates[0];
    }
  }

  // 2. EMPLOYEE FULL NAME (Name of IP)
  let name = seqName;
  if (!name) {
    const nameMatch =
      cleanText.match(/Name\s*of\s*IP\s*[:\-]?\s*([A-Za-z\s\.\'\-]{2,45}?)(?=\s+(?:Insurance|UHID|UAN|ABHA|Aadhaar|Date\s*of\s*Birth|DOB|Gender|Mobile|Email|Registration|Permanent|Present|Marital|$|\d{10}))/i) ||
      cleanText.match(/(?:Name\s*of\s*Insured\s*Person|Insured\s*Person\s*Name|Employee\s*Name|IP\s*Name)\s*[:\-]?\s*([A-Za-z\s\.\'\-]{2,45}?)(?=\s+(?:Insurance|UHID|UAN|ABHA|Date|DOB|Gender|Mobile|Email|Registration|$|\d{10}))/i);

    if (nameMatch && nameMatch[1] && nameMatch[1].trim().length > 1) {
      name = cleanExtractedString(nameMatch[1]);
    }
  }

  if (!name && fileName) {
    name = fileName.replace(/\.pdf$/i, '').replace(/[_]/g, ' ').replace(/\d{8,}/g, '').trim();
  }

  // 3. DATE OF BIRTH (DOB)
  let dob = seqDob;
  if (!dob) {
    const dobMatch =
      cleanText.match(/(?:Date\s*of\s*Birth|DOB|D\.O\.B)\s*[:\-]?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i) ||
      cleanText.match(/\b(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})\b/);
    if (dobMatch && dobMatch[1]) {
      dob = normalizeDate(dobMatch[1]);
    }
  }

  // 4. GENDER
  let gender: 'Male' | 'Female' | 'Other' = (seqGender as any) || 'Male';
  if (!seqGender) {
    const genderMatch = cleanText.match(/(?:Gender|Sex)\s*[:\-]?\s*(Female|Male|Other)/i);
    if (genderMatch && genderMatch[1]) {
      gender = genderMatch[1].toLowerCase().includes('female') ? 'Female' : 'Male';
    } else if (/\bFemale\b/i.test(cleanText) || /\b(?:Smt|Mrs|W\/O|D\/O|DEVI|KHATOON|BEGUM|KUMARI)\b/i.test(name)) {
      gender = 'Female';
    } else {
      gender = 'Male';
    }
  }

  // 5. REGISTRATION DATE
  let registrationDate = seqRegDate;
  if (!registrationDate) {
    const regMatch = cleanText.match(/(?:Registration\s*Date|Date\s*of\s*Registration)\s*[:\-]?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i);
    if (regMatch && regMatch[1]) {
      registrationDate = normalizeDate(regMatch[1]);
    }
  }

  // 6. FATHER / HUSBAND NAME
  let fatherOrHusbandName = seqFatherName;
  let relationType: 'Father' | 'Husband' = gender === 'Female' ? 'Husband' : 'Father';

  if (!fatherOrHusbandName) {
    const fatherMatch =
      cleanText.match(/(?:Name\s*of\s*Father\s*\/?\s*Husband|Father\s*\/?\s*Husband(?:'s)?\s*Name|Name\s*of\s*Husband|Husband['’]?s?\s*Name|Name\s*of\s*Father|Father['’]?s?\s*Name|S\/O|W\/O|D\/O)\s*[:\-]?\s*([A-Za-z\s\.\'\-]{2,45}?)(?=\s+(?:Permanent|Present|Address|Dispensary|Type|Marital|Disability|CURRENT|$))/i);
    if (fatherMatch && fatherMatch[1] && fatherMatch[1].trim().length > 1) {
      fatherOrHusbandName = cleanExtractedString(fatherMatch[1]);
    }
  }

  // 7. RESIDENTIAL ADDRESS
  let address = seqPresentAddress;
  if (!address) {
    const addrMatch =
      cleanText.match(/(?:Present\s*Address|Permanent\s*Address|Residential\s*Address)\s*[:\-]?\s*([A-Za-z0-9\s,.:\-\/]+?)(?=\s*(?:Dispensary|IMP\s*for|Permanent\s*Address|Name\s*of\s*Father|CURRENT\s*EMPLOYER|Employer's\s*Code|FAMILY\s*DETAILS|Branch\s*Office|Date|\n\n|$))/i) ||
      cleanText.match(/Address\s*:\s*([A-Za-z0-9\s,.:\-\/]+?)(?=\s*Date\s*:|\s*Page|\n|$)/i);
    if (addrMatch && addrMatch[1] && addrMatch[1].trim().length > 5) {
      address = cleanAddressString(addrMatch[1]);
    }
  }

  let city = 'Muzaffarpur';
  let state = 'Bihar';
  let pincode = '842001';

  if (address) {
    const pinMatch = address.match(/\b(8\d{5}|[1-7]\d{5})\b/);
    if (pinMatch) pincode = pinMatch[1];
    const distMatch = address.match(/Dist\s*:\s*([A-Za-z]+)/i);
    if (distMatch) city = distMatch[1].trim();
    if (address.toLowerCase().includes('bihar')) state = 'Bihar';
  }

  // 8. EMPLOYER DETAILS
  let employerCode = '';
  const empCodeMatch = cleanText.match(/(?:Employer(?:'s)?\s*Code\s*No\.?|Employer\s*Code|Est\s*Code|Establishment\s*Code)[^\d:]*[:\-]?\s*(\d{10,18})/i);
  if (empCodeMatch) {
    employerCode = empCodeMatch[1].trim();
  }

  let employerName = '';
  const empNameMatch =
    cleanText.match(/(?:Name\s*of\s*Employer|Employer\s*Name|Establishment\s*Name|Printed\s*By\s*\([^)]*\))\s*[:\-]?\s*([A-Za-z0-9\s,\.\(\)&\'\-]{3,60}?)(?=\s+(?:Sub\s*Unit|Date\s*of\s*Appointment|Appointment|Address\s*of\s*Employer|Branch\s*Office|IP\s*Number|FAMILY\s*DETAILS|\n|$))/i);
  if (empNameMatch && empNameMatch[1]) {
    employerName = cleanExtractedString(empNameMatch[1]);
  }

  let appointmentDate = '';
  const appDateMatch = cleanText.match(/(?:Date\s*of\s*Appointment|Appointment\s*Date|Date\s*of\s*Joining)\s*[:\-]?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i);
  if (appDateMatch && appDateMatch[1]) {
    appointmentDate = normalizeDate(appDateMatch[1]);
  }

  let employerAddress = '';
  const empAddrMatch = cleanText.match(/(?:Address\s*of\s*Employer|Employer\s*Address)\s*[:\-]?\s*([A-Za-z0-9\s,.:\-\/]+?)(?=\s*(?:Branch\s*Office|FAMILY\s*DETAILS|Sub\s*Unit|Page|\n\n|$))/i);
  if (empAddrMatch && empAddrMatch[1]) {
    employerAddress = cleanAddressString(empAddrMatch[1]);
  }

  let branchOffice = '';
  const branchMatch = cleanText.match(/(?:Branch\s*Office)\s*[:\-]?\s*([A-Za-z0-9\s,.:\-\/]+?)(?=\s*(?:FAMILY\s*DETAILS|Name\s*Relation|Page|\n\n|$))/i);
  if (branchMatch && branchMatch[1]) {
    branchOffice = cleanAddressString(branchMatch[1]);
  }

  let dispensary = '';
  const dispMatch = cleanText.match(/(?:Dispensary\s*\/?\s*IMP\s*for\s*IP|Dispensary\s*for\s*IP|Dispensary)\s*[:\-]?\s*([A-Za-z0-9\s,\.\(\)\-]+?)(?=\s*(?:Dispensary\s*\/?\s*IMP\s*for\s*Family|Name\s*of\s*Father|Permanent|CURRENT\s*EMPLOYER|Employer's\s*Code|$))/i);
  if (dispMatch && dispMatch[1]) {
    dispensary = cleanExtractedString(dispMatch[1]);
  }

  // 9. FAMILY MEMBERS
  const familyMembers: EmployeeFamilyMember[] = [];
  const knownRelations = ['Spouse', 'Dependant unmarried daughter', 'Minor dependant son', 'Father', 'Mother', 'Son', 'Daughter', 'Wife', 'Husband'];

  for (const rel of knownRelations) {
    const relRegex = new RegExp(`([A-Za-z\\s\\.]{2,30})\\s*\\|?\\s*(${rel})\\s*\\|?\\s*(\\d{1,2}[\\/\\-\\.]\\d{1,2}[\\/\\-\\.]\\d{2,4})?`, 'gi');
    let match;
    while ((match = relRegex.exec(cleanText)) !== null) {
      const memName = cleanExtractedString(match[1]);
      if (memName && memName.length > 2 && !memName.includes('Relation') && !memName.includes('FAMILY')) {
        familyMembers.push({
          name: memName,
          relation: match[2],
          dob: match[3] ? normalizeDate(match[3]) : undefined,
        });
      }
    }
  }

  // 10. NOMINEE
  let nominee = undefined;
  const nomineeMatch = cleanText.match(/(?:NOMINEE\s*DETAILS|Nominee)[^\n:]*[:\s]*([A-Za-z\s\.]+)\s*\|\s*([A-Za-z\s]+)\s*\|[^\d]*(\d{1,3}%?)/i);
  if (nomineeMatch) {
    nominee = {
      name: cleanExtractedString(nomineeMatch[1]),
      relation: cleanExtractedString(nomineeMatch[2]),
      share: nomineeMatch[3] ? nomineeMatch[3] : '100%',
    };
  }

  const fields: Partial<EmployeeRecord> = {
    insuranceNo: insuranceNo || '',
    name: name || 'Employee',
    gender,
    fatherOrHusbandName: fatherOrHusbandName || '',
    relationType,
    dob: dob || '',
    mobileNo: mobileNo || '',
    registrationDate: registrationDate || '',
    address: address || '',
    city,
    state,
    pincode,
    employerName: employerName || 'MUZAFFARPUR MUNICIPAL CORPORATION',
    employerCode: employerCode || '42001884020000908',
    employerAddress: employerAddress || 'Near Muzaffarpur Railway Station, Civil Court Campus, Muzaffarpur Bihar 842001',
    appointmentDate: appointmentDate || '',
    dispensary: dispensary || 'Kalambagh Chowk, BH (ESIS Disp.)',
    branchOffice: branchOffice || 'DCBO - Muzaffarpur, ESIC DCBO, Behind S.B.I. Bhagwanpur Chowk',
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
    confidence: isValidIpNumber(insuranceNo) && name ? 0.99 : 0.85,
    extractedLines: lines.slice(0, 80),
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
    .replace(/^[:\-\s]+/, '')
    .replace(/[:\-\s]+$/, '')
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

      // Auto-detect dd/mm/yyyy vs yyyy/mm/dd
      if (parts[0].length === 4) {
        y = parseInt(parts[0], 10);
        m = parseInt(parts[1], 10);
        d = parseInt(parts[2], 10);
      } else if (m > 12 && d <= 12) {
        const tmp = d;
        d = m;
        m = tmp;
      }
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  } catch (e) {}
  return '';
}

/**
 * Generate high-quality demo sample PDF transcripts matching authentic ESIC Government PDFs
 */
export function getSamplePdfDemoData(index: number = 0): ParsedPdfResult {
  const sampleProfiles = [
    {
      name: 'ABHAY KUMAR SHARMA',
      gender: 'Male' as const,
      fatherOrHusbandName: 'BAIDHNATH THAKUR',
      relationType: 'Father' as const,
      dob: '1981-02-10',
      mobileNo: '8674893878',
      insuranceNo: '4216828319',
      registrationDate: '2023-07-11',
      address: 'NEAR MIDDILE SCHOOL SADPUR, Dist: Muzaffarpur, Bihar, 842001',
      city: 'Muzaffarpur',
      state: 'Bihar',
      pincode: '842001',
      employerName: 'MUZAFFARPUR MUNICIPAL CORPORATION',
      employerCode: '42001884020000908',
      employerAddress: 'Near Muzaffarpur Railway Station, Civil Court Campus, Hpo Ps Town, Dist: Muzaffarpur Bihar 842001',
      dispensary: 'Kalambagh Chowk, BH (ESIS Disp.)',
      branchOffice: 'DCBO - Muzaffarpur, ESIC DCBO, Behind S.B.I. Bhagwanpur Chowk',
      appointmentDate: '2023-07-08',
      fileName: 'ESIC_ePehchan_Abhay_Kumar_Sharma_4216828319.pdf',
      familyMembers: [
        { name: 'ANAHITA KUMARI', relation: 'Dependant unmarried daughter', dob: '2017-09-09' },
        { name: 'ANANYA KUMARI', relation: 'Dependant unmarried daughter', dob: '2019-05-17' },
      ],
      nominee: {
        name: 'ANITA THAKUR',
        relation: 'Spouse',
        share: '100%',
      },
    },
    {
      name: 'ABDUL MOGANI ANSARI',
      gender: 'Male' as const,
      fatherOrHusbandName: 'MD SAMI ANSARI',
      relationType: 'Father' as const,
      dob: '1972-12-15',
      mobileNo: '7366899546',
      insuranceNo: '4216789178',
      registrationDate: '2023-05-18',
      address: 'SADPURA KASAB TOLA NEAR KACHANA SONAR, Dist: Muzaffarpur, Bihar, 842002',
      city: 'Muzaffarpur',
      state: 'Bihar',
      pincode: '842002',
      employerName: 'MUZAFFARPUR MUNICIPAL CORPORATION',
      employerCode: '42001884020000908',
      employerAddress: 'Near Muzaffarpur Railway Station, Civil Court Campus, Hpo Ps Town, Dist: Muzaffarpur Bihar 842001',
      dispensary: 'Kalambagh Chowk, BH (ESIS Disp.)',
      branchOffice: 'DCBO - Muzaffarpur, ESIC DCBO, Behind S.B.I. Bhagwanpur Chowk',
      appointmentDate: '2023-05-10',
      fileName: 'ESIC_ePehchan_Abdul_Mogani_Ansari_4216789178.pdf',
      familyMembers: [
        { name: 'NIKHAT PARWEEN', relation: 'Spouse', dob: '1989-01-01' },
        { name: 'RIFAT PARWEEN', relation: 'Dependant unmarried daughter', dob: '2003-09-17' },
        { name: 'HAMID FARHAN', relation: 'Minor dependant son', dob: '2006-12-04' },
        { name: 'HAMID REHAN', relation: 'Minor dependant son', dob: '2008-01-01' },
        { name: 'ASAD AYAN', relation: 'Minor dependant son', dob: '2014-03-08' },
      ],
      nominee: {
        name: 'NIKHAT PARWEEN',
        relation: 'Spouse',
        share: '100%',
      },
    },
    {
      name: 'BABY DEVI',
      gender: 'Female' as const,
      fatherOrHusbandName: 'SATAYANARAYAN RAM',
      relationType: 'Husband' as const,
      dob: '1979-09-05',
      mobileNo: '7667737030',
      insuranceNo: '4216776809',
      registrationDate: '2023-05-03',
      address: 'PAKKI SARYA CHOWK, NAGARNIGAM KE PASS, CHANDWARA MUZAFFARPUR, Dist: Muzaffarpur, Bihar, 842001',
      city: 'Muzaffarpur',
      state: 'Bihar',
      pincode: '842001',
      employerName: 'MUZAFFARPUR MUNICIPAL CORPORATION',
      employerCode: '42001884020000908',
      employerAddress: 'Near Muzaffarpur Railway Station, Civil Court Campus, Hpo Ps Town, Dist: Muzaffarpur Bihar 842001',
      dispensary: 'Kalambagh Chowk, BH (ESIS Disp.)',
      branchOffice: 'DCBO - Muzaffarpur, ESIC DCBO, Behind S.B.I. Bhagwanpur Chowk',
      appointmentDate: '2023-05-01',
      fileName: 'ESIC_ePehchan_Baby_Devi_4216776809.pdf',
      familyMembers: [
        { name: 'SURAJ KUMAR', relation: 'Minor dependant son', dob: '2000-09-08' },
      ],
      nominee: {
        name: 'SURAJ KUMAR',
        relation: 'Minor dependant son',
        share: '100%',
      },
    },
  ];

  const profile = sampleProfiles[index % sampleProfiles.length];

  const rawTranscript = `=====================================================
EMPLOYEES' STATE INSURANCE CORPORATION
e-Pehchan Card (Govt. of India / भारत सरकार)
=====================================================
Document Name: ${profile.fileName}
Extracted Date: ${new Date().toLocaleDateString()}

PERSONAL DETAILS
Name of IP : ${profile.name}
Insurance No. : ${profile.insuranceNo}
Date of Birth : ${profile.dob}
Gender : ${profile.gender}
Mobile Number : ${profile.mobileNo}
Email ID : NA
Registration Date : ${profile.registrationDate}
UHID : NA
UAN : NA
ABHA Number : NA
ABHA Address : NA
Aadhaar : NA

REGISTRATION DETAILS
Marital Status : Married
Type Of Disability : NA
Name of Father / Husband : ${profile.fatherOrHusbandName}
Present Address : ${profile.address}
Permanent Address : ${profile.address}
Dispensary / IMP for IP : ${profile.dispensary}
Dispensary / IMP for Family : ${profile.dispensary}

CURRENT EMPLOYER DETAILS
Employer's Code No. : ${profile.employerCode}
Name of Employer : ${profile.employerName}
Date of Appointment : ${profile.appointmentDate}
Sub Unit's Code No. : None
Address of Employer : ${profile.employerAddress}
Branch Office : ${profile.branchOffice}

FAMILY DETAILS
${profile.familyMembers?.map((m) => `Name: ${m.name} | Relation: ${m.relation} | DOB: ${m.dob || 'NA'}`).join('\n') || 'None'}

NOMINEE DETAILS
Nominee: ${profile.nominee?.name || profile.fatherOrHusbandName} | Relation: ${profile.nominee?.relation || 'Spouse'} | Share: ${profile.nominee?.share || '100%'}

PRINTED METADATA
Printed By (Employer/User Name) : ${profile.employerName}
IP Number : ${profile.insuranceNo}
Address : ${profile.address}
Date : ${new Date().toLocaleString()}
=====================================================`;

  return {
    rawText: rawTranscript,
    fields: {
      insuranceNo: profile.insuranceNo,
      name: profile.name,
      gender: profile.gender,
      fatherOrHusbandName: profile.fatherOrHusbandName,
      relationType: profile.relationType,
      dob: profile.dob,
      mobileNo: profile.mobileNo,
      registrationDate: profile.registrationDate,
      address: profile.address,
      city: profile.city,
      state: profile.state,
      pincode: profile.pincode,
      employerName: profile.employerName,
      employerCode: profile.employerCode,
      employerAddress: profile.employerAddress,
      appointmentDate: profile.appointmentDate,
      dispensary: profile.dispensary,
      branchOffice: profile.branchOffice,
      familyMembers: profile.familyMembers,
      nominee: profile.nominee,
      employeePhoto: profile.gender === 'Female' ? DEFAULT_AVATAR_FEMALE : DEFAULT_AVATAR_MALE,
      familyPhoto: DEFAULT_FAMILY_PHOTO,
      employeeSignature: DEFAULT_EMPLOYEE_SIGNATURE,
      sourcePdfName: profile.fileName,
    },
    confidence: 0.99,
    extractedLines: rawTranscript.split('\n'),
  };
}
