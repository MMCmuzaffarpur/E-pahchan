// Default high-resolution SVGs and data URLs for realistic previews

// Clean Authentic Royal Blue Ball-Pen Ink Employer Signature (Transparent SVG Vector)
export const DEFAULT_EMPLOYER_SIGNATURE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 80" width="160" height="80">
  <path d="M 25 55 C 32 35, 40 20, 52 48 C 65 72, 70 25, 82 42 C 95 60, 105 32, 120 45 C 132 55, 140 22, 150 38 M 30 62 Q 85 45, 152 58" stroke="%230b3c75" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export const DEFAULT_EMPLOYER_STAMP = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <circle cx="60" cy="60" r="54" stroke="%231e3a8a" stroke-width="2" fill="none" stroke-dasharray="4 2"/>
  <circle cx="60" cy="60" r="46" stroke="%231e3a8a" stroke-width="1.5" fill="none"/>
  <path id="curve" d="M 20 60 A 40 40 0 0 1 100 60" fill="none"/>
  <text font-size="7.5" font-family="sans-serif" font-weight="bold" fill="%231e3a8a" letter-spacing="1.5">
    <textPath href="%23curve" startOffset="50%" text-anchor="middle">★ E-PEHCHAN AUTH DEPT ★</textPath>
  </text>
  <circle cx="60" cy="60" r="22" fill="%231e3a8a" fill-opacity="0.08"/>
  <text x="60" y="58" font-size="10" font-family="sans-serif" font-weight="900" fill="%231e3a8a" text-anchor="middle">OFFICIAL</text>
  <text x="60" y="70" font-size="8" font-family="sans-serif" font-weight="bold" fill="%231e3a8a" text-anchor="middle">SEAL</text>
</svg>`;

// Thedhi wavy line hatakar clean empty string rakhein
export const DEFAULT_EMPLOYEE_SIGNATURE = ``;

export const NATIONAL_EMBLEM_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" width="100" height="120">
  <path d="M 50 15 C 38 15 32 24 32 32 C 32 40 37 46 43 49 C 39 52 35 57 35 65 C 35 73 40 80 50 82 C 60 80 65 73 65 65 C 65 57 61 52 57 49 C 63 46 68 40 68 32 C 68 24 62 15 50 15 Z" fill="%23d97706"/>
  <circle cx="50" cy="30" r="10" fill="%23b45309"/>
  <path d="M 30 84 L 70 84 L 74 95 L 26 95 Z" fill="%2392400e"/>
  <circle cx="50" cy="90" r="4.5" fill="%23ffffff"/>
  <path d="M 22 98 L 78 98 L 74 106 L 26 106 Z" fill="%2378350f"/>
  <text x="50" y="116" font-family="sans-serif" font-size="7" font-weight="900" fill="%23b45309" text-anchor="middle" letter-spacing="1">सत्यमेव जयते</text>
</svg>`;

export const ESIC_OFFICIAL_LOGO = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="esicGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%230f3460" />
      <stop offset="100%" stop-color="%2316213e" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23f59e0b" />
      <stop offset="100%" stop-color="%23d97706" />
    </linearGradient>
  </defs>
  <circle cx="60" cy="60" r="56" fill="url(%23esicGrad)" stroke="%23f59e0b" stroke-width="2.5"/>
  <circle cx="60" cy="60" r="48" fill="none" stroke="%23ffffff" stroke-width="1" stroke-dasharray="3 2" opacity="0.6"/>
  <path d="M 60 22 L 67 42 L 88 42 L 71 54 L 77 75 L 60 62 L 43 75 L 49 54 L 32 42 L 53 42 Z" fill="url(%23goldGrad)"/>
  <path d="M 38 82 Q 60 74 82 82 L 78 92 Q 60 85 42 92 Z" fill="%23ffffff"/>
  <text x="60" y="89" font-family="sans-serif" font-size="6" font-weight="900" fill="%230f3460" text-anchor="middle" letter-spacing="0.5">ESIC • क.रा.बी.नि.</text>
  <text x="60" y="104" font-family="sans-serif" font-size="5" font-weight="bold" fill="%23f59e0b" text-anchor="middle">सामाजिक सुरक्षा / SOCIAL SECURITY</text>
</svg>`;

export const DEFAULT_PORTAL_LOGO = ESIC_OFFICIAL_LOGO;

export const DEFAULT_AVATAR_MALE = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80`;
export const DEFAULT_AVATAR_FEMALE = `https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80`;
export const DEFAULT_FAMILY_PHOTO = `https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&auto=format&fit=crop&q=80`;
