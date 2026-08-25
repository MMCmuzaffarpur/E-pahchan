import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  initDatabase,
  getDatabaseStatus,
  getAllEmployeesFromDb,
  saveEmployeeToDb,
  deleteEmployeeFromDb,
  getAllUsersFromDb,
  saveUserToDb,
  deleteUserFromDb,
  getSettingsFromDb,
  saveSettingsToDb,
  seedFallbackData,
} from './server/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initial seeds
const DEFAULT_EMPLOYEES = [
  {
    id: 'emp-100',
    insuranceNo: '4216776809',
    name: 'BABY DEVI',
    gender: 'Female',
    fatherOrHusbandName: 'SATAYANARAYAN RAM',
    relationType: 'Husband',
    dob: '1979-09-05',
    mobileNo: '7667737030',
    address: 'PAKKI SARYA CHOWK, NAGARNIGAM KE PASS, CHANDWARA MUZAFFARPUR',
    city: 'Muzaffarpur',
    state: 'Bihar',
    pincode: '842001',
    employerName: 'MUZAFFARPUR MUNICIPAL CORPORATION',
    employerCode: '42001884020000908',
    employerAddress: 'Near Muzaffarpur Railway Station, Civil Court Campus, Hpo Ps Town, Dist: Muzaffarpur Bihar 842001',
    appointmentDate: '2023-05-01',
    dispensary: 'Kalambagh Chowk, BH (ESIS Disp.)',
    branchOffice: 'DCBO - Muzaffarpur, ESIC DCBO, Behind S.B.I. Bhagwanpur Chowk',
    employeePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    familyPhoto: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&auto=format&fit=crop&q=80',
    employeeSignature: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 60" width="180" height="60"><path d="M 15 40 C 30 15, 45 45, 60 25 C 75 10, 85 50, 105 35 C 125 20, 140 45, 165 30" stroke="%231f2937" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
    createdAt: '2025-03-01T07:00:00.000Z',
    updatedAt: '2025-03-01T07:00:00.000Z',
    sourcePdfName: 'ESIC_ePehchan_Baby_Devi_4216776809.pdf',
  },
  {
    id: 'emp-101',
    insuranceNo: '3109845621',
    name: 'Ramesh Kumar Verma',
    gender: 'Male',
    fatherOrHusbandName: 'Late Suresh Prasad Verma',
    relationType: 'Father',
    dob: '1988-04-12',
    mobileNo: '9835012456',
    address: 'Flat 402, Shanti Vihar, Bela Industrial Road',
    city: 'Muzaffarpur',
    state: 'Bihar',
    pincode: '842005',
    employerName: 'BHARAT LOGISTICS & FREIGHT SERVICES CORP',
    employerCode: '10000984520001001',
    employerAddress: 'Plot 45, Transport Nagar, Patna Highway',
    appointmentDate: '2021-03-01',
    dispensary: 'ESIC Dispensary Bela Industrial Area',
    branchOffice: 'ESIC Sub-Regional Office Muzaffarpur',
    employeePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    familyPhoto: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&auto=format&fit=crop&q=80',
    employeeSignature: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 60" width="180" height="60"><path d="M 15 40 C 30 15, 45 45, 60 25 C 75 10, 85 50, 105 35 C 125 20, 140 45, 165 30" stroke="%231f2937" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
    createdAt: '2025-02-15T10:30:00.000Z',
    updatedAt: '2025-02-15T10:30:00.000Z',
    sourcePdfName: 'ESIC_Pehchan_Ramesh_Verma.pdf',
  },
];

const DEFAULT_USERS = [
  {
    id: 'usr-1',
    name: 'Admin Supervisor',
    email: 'admin@portal.gov.in',
    role: 'Admin',
    isActive: true,
    department: 'Central ID Card Issuance Cell',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2025-01-01T00:00:00.000Z',
    lastLogin: 'Today, 10:15 AM',
  },
  {
    id: 'usr-2',
    name: 'Muzaffarpur Operator',
    email: 'operator@portal.gov.in',
    role: 'User',
    isActive: true,
    department: 'Muzaffarpur Municipal Cell',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    createdAt: '2025-01-10T00:00:00.000Z',
    lastLogin: 'Yesterday, 04:40 PM',
  },
];

const DEFAULT_SETTINGS = {
  employerSignature: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="240" height="80"><path d="M 20 55 C 35 25, 45 15, 60 45 C 75 75, 85 20, 100 40 C 115 60, 130 30, 150 45 C 170 60, 185 15, 205 35 M 40 60 Q 120 40 220 58 M 140 30 L 160 65" stroke="%231a365d" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><text x="70" y="75" font-family="sans-serif" font-size="10" font-weight="600" fill="%234a5568" letter-spacing="1">AUTH. SIGNATORY</text></svg>`,
  employerStamp: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120"><circle cx="60" cy="60" r="54" stroke="%231e3a8a" stroke-width="2" fill="none" stroke-dasharray="4 2"/><circle cx="60" cy="60" r="46" stroke="%231e3a8a" stroke-width="1.5" fill="none"/><path id="curve" d="M 20 60 A 40 40 0 0 1 100 60" fill="none"/><text font-size="7.5" font-family="sans-serif" font-weight="bold" fill="%231e3a8a" letter-spacing="1.5"><textPath href="%23curve" startOffset="50%" text-anchor="middle">★ E-PEHCHAN AUTH DEPT ★</textPath></text><circle cx="60" cy="60" r="22" fill="%231e3a8a" fill-opacity="0.08"/><text x="60" y="58" font-size="10" font-family="sans-serif" font-weight="900" fill="%231e3a8a" text-anchor="middle">OFFICIAL</text><text x="60" y="70" font-size="8" font-family="sans-serif" font-weight="bold" fill="%231e3a8a" text-anchor="middle">SEAL</text></svg>`,
  organizationName: "EMPLOYEES' STATE INSURANCE CORPORATION",
  portalTitle: 'e-Pehchan Smart ID Portal & PDF Registry',
  helplineNo: '1800-11-2526 / 0612-2500123',
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize DB and seed cache
  seedFallbackData(DEFAULT_EMPLOYEES, DEFAULT_USERS, DEFAULT_SETTINGS);
  const dbInitRes = await initDatabase();
  console.log(`📡 [Backend DB Status]: ${dbInitRes.message}`);

  // Middlewares
  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // ----------------------------------------------------
  // API Routes
  // ----------------------------------------------------

  // 1. Health & DB Diagnostic
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: getDatabaseStatus(),
    });
  });

  app.get('/api/db-status', (req: Request, res: Response) => {
    res.json({
      success: true,
      info: getDatabaseStatus(),
      renderUrl: 'https://render.com',
      cleverCloudUrl: 'https://www.clever-cloud.com',
      vercelUrl: 'https://vercel.com',
    });
  });

  // 2. Auth Route (Login)
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    const { email } = req.body;
    const users = await getAllUsersFromDb();
    const user = users.find((u: any) => u.email.toLowerCase() === (email || '').toLowerCase());

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found in registry.' });
    }

    if (!user.isActive && !user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated by administrator. Please contact Admin.',
      });
    }

    // Update last login
    user.lastLogin = new Date().toLocaleString();
    await saveUserToDb(user);

    res.json({
      success: true,
      user,
      message: `Welcome back, ${user.name}!`,
    });
  });

  // 3. Employees REST Endpoints
  app.get('/api/employees', async (req: Request, res: Response) => {
    try {
      const employees = await getAllEmployeesFromDb();
      res.json({ success: true, count: employees.length, data: employees });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post('/api/employees', async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      if (!payload.id) {
        payload.id = 'emp-' + Date.now();
      }
      const saved = await saveEmployeeToDb(payload);
      res.status(201).json({ success: true, message: 'Employee saved successfully', data: saved });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.get('/api/employees/:id', async (req: Request, res: Response) => {
    try {
      const employees = await getAllEmployeesFromDb();
      const emp = employees.find((e: any) => e.id === req.params.id);
      if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });
      res.json({ success: true, data: emp });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.put('/api/employees/:id', async (req: Request, res: Response) => {
    try {
      const updates = { ...req.body, id: req.params.id };
      const updated = await saveEmployeeToDb(updates);
      res.json({ success: true, message: 'Employee updated successfully', data: updated });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.delete('/api/employees/:id', async (req: Request, res: Response) => {
    try {
      await deleteEmployeeFromDb(req.params.id);
      res.json({ success: true, message: 'Employee deleted successfully' });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // 4. Portal Users Endpoints
  app.get('/api/users', async (req: Request, res: Response) => {
    try {
      const users = await getAllUsersFromDb();
      res.json({ success: true, count: users.length, data: users });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post('/api/users', async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      if (!payload.id) {
        payload.id = 'usr-' + Date.now();
      }
      const saved = await saveUserToDb(payload);
      res.status(201).json({ success: true, message: 'User created successfully', data: saved });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.put('/api/users/:id/toggle-status', async (req: Request, res: Response) => {
    try {
      const users = await getAllUsersFromDb();
      const user = users.find((u: any) => u.id === req.params.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      user.isActive = !user.isActive;
      user.is_active = user.isActive;
      const updated = await saveUserToDb(user);
      res.json({
        success: true,
        message: `User status changed to ${user.isActive ? 'Active' : 'Deactivated'}`,
        data: updated,
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.delete('/api/users/:id', async (req: Request, res: Response) => {
    try {
      await deleteUserFromDb(req.params.id);
      res.json({ success: true, message: 'User removed from portal' });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // 5. Global Settings Endpoints (Sign.jpg, organization, etc.)
  app.get('/api/settings', async (req: Request, res: Response) => {
    try {
      const settings = await getSettingsFromDb();
      res.json({ success: true, data: settings || DEFAULT_SETTINGS });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.put('/api/settings', async (req: Request, res: Response) => {
    try {
      const saved = await saveSettingsToDb(req.body);
      res.json({ success: true, message: 'Global settings updated successfully', data: saved });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // ----------------------------------------------------
  // Vite Middleware / Static Serving
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 [Server] Full-Stack Backend running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
