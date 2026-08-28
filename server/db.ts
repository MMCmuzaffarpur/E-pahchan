import pg from 'pg';
const { Pool } = pg;

let pool: pg.Pool | null = null;
let isConnectedToSql = false;
let connectionErrorMsg = '';

// In-Memory / Local Cache Fallback if DATABASE_URL is not set
let fallbackEmployees: any[] = [];
let fallbackUsers: any[] = [];
let fallbackSettings: any = null;

export function getDbPool(): pg.Pool | null {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.log('ℹ️ [Backend DB] No DATABASE_URL provided. Running in high-performance memory storage mode.');
    return null;
  }

  try {
    const isSslRequired = !connectionString.includes('localhost') && !connectionString.includes('127.0.0.1');
    pool = new Pool({
      connectionString,
      ssl: isSslRequired ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      console.error('❌ [Backend DB] Unexpected pool error:', err);
      isConnectedToSql = false;
      connectionErrorMsg = err.message;
    });

    return pool;
  } catch (err: any) {
    console.error('❌ [Backend DB] Pool initialization failed:', err);
    connectionErrorMsg = err.message || 'Initialization failed';
    return null;
  }
}

export async function initDatabase(): Promise<{ success: boolean; type: 'postgresql' | 'memory'; message: string }> {
  const dbPool = getDbPool();

  if (!dbPool) {
    isConnectedToSql = false;
    return {
      success: true,
      type: 'memory',
      message: 'Running in Local Memory mode. Set DATABASE_URL in Render / Clever Cloud / Vercel to activate PostgreSQL.',
    };
  }

  try {
    const client = await dbPool.connect();
    try {
      console.log('⚡ [Backend DB] Connected to PostgreSQL. Initializing SQL Schema...');

      // 1. Create Employees Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS employees (
          id VARCHAR(255) PRIMARY KEY,
          insurance_no VARCHAR(100) NOT NULL,
          name VARCHAR(255) NOT NULL,
          gender VARCHAR(50) DEFAULT 'Male',
          father_or_husband_name VARCHAR(255),
          relation_type VARCHAR(50) DEFAULT 'Father',
          dob VARCHAR(50),
          mobile_no VARCHAR(50),
          address TEXT,
          city VARCHAR(100),
          state VARCHAR(100),
          pincode VARCHAR(50),
          employer_name VARCHAR(255),
          employer_code VARCHAR(100),
          employer_address TEXT,
          appointment_date VARCHAR(50),
          dispensary VARCHAR(255),
          branch_office VARCHAR(255),
          employee_photo TEXT,
          family_photo TEXT,
          employee_signature TEXT,
          source_pdf_name VARCHAR(255),
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 2. Create Portal Users Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS portal_users (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) DEFAULT 'User123',
          role VARCHAR(50) DEFAULT 'User',
          is_active BOOLEAN DEFAULT TRUE,
          department VARCHAR(255),
          avatar_url TEXT,
          last_login VARCHAR(100),
          authorized_employee_ids TEXT,
          authorize_all BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 3. Create Global Settings Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS global_settings (
          id VARCHAR(50) PRIMARY KEY,
          employer_signature TEXT,
          employer_stamp TEXT,
          organization_name VARCHAR(255),
          portal_title VARCHAR(255),
          helpline_no VARCHAR(255),
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `);

      isConnectedToSql = true;
      connectionErrorMsg = '';
      console.log('✅ [Backend DB] PostgreSQL tables verified and ready!');
      return { success: true, type: 'postgresql', message: 'Connected to PostgreSQL database successfully.' };
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('❌ [Backend DB] SQL Schema init error:', err);
    isConnectedToSql = false;
    connectionErrorMsg = err.message || 'Database connection error';
    return { success: false, type: 'memory', message: `PostgreSQL connection error: ${connectionErrorMsg}. Falling back to memory mode.` };
  }
}

export function getDatabaseStatus() {
  return {
    connectedToSql: isConnectedToSql,
    storageType: isConnectedToSql ? 'PostgreSQL (Render/CleverCloud/Vercel)' : 'In-Memory / Local Cache',
    databaseUrlConfigured: !!process.env.DATABASE_URL,
    error: connectionErrorMsg || null,
  };
}

// ----------------------------------------------------
// Database Operations (With transparent PostgreSQL / Memory fallback)
// ----------------------------------------------------

export async function getAllEmployeesFromDb() {
  const dbPool = getDbPool();
  if (dbPool && isConnectedToSql) {
    try {
      const res = await dbPool.query(`
        SELECT 
          id,
          insurance_no AS "insuranceNo",
          name,
          gender,
          father_or_husband_name AS "fatherOrHusbandName",
          relation_type AS "relationType",
          dob,
          mobile_no AS "mobileNo",
          address,
          city,
          state,
          pincode,
          employer_name AS "employerName",
          employer_code AS "employerCode",
          employer_address AS "employerAddress",
          appointment_date AS "appointmentDate",
          dispensary,
          branch_office AS "branchOffice",
          employee_photo AS "employeePhoto",
          family_photo AS "familyPhoto",
          employee_signature AS "employeeSignature",
          source_pdf_name AS "sourcePdfName",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM employees
        ORDER BY created_at DESC
      `);
      return res.rows;
    } catch (e) {
      console.error('Error fetching employees from PostgreSQL, using cache:', e);
    }
  }
  return fallbackEmployees;
}

export async function saveEmployeeToDb(emp: any) {
  const dbPool = getDbPool();
  if (dbPool && isConnectedToSql) {
    try {
      const query = `
        INSERT INTO employees (
          id, insurance_no, name, gender, father_or_husband_name, relation_type,
          dob, mobile_no, address, city, state, pincode,
          employer_name, employer_code, employer_address, appointment_date,
          dispensary, branch_office, employee_photo, family_photo, employee_signature,
          source_pdf_name, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24
        )
        ON CONFLICT (id) DO UPDATE SET
          insurance_no = EXCLUDED.insurance_no,
          name = EXCLUDED.name,
          gender = EXCLUDED.gender,
          father_or_husband_name = EXCLUDED.father_or_husband_name,
          relation_type = EXCLUDED.relation_type,
          dob = EXCLUDED.dob,
          mobile_no = EXCLUDED.mobile_no,
          address = EXCLUDED.address,
          city = EXCLUDED.city,
          state = EXCLUDED.state,
          pincode = EXCLUDED.pincode,
          employer_name = EXCLUDED.employer_name,
          employer_code = EXCLUDED.employer_code,
          employer_address = EXCLUDED.employer_address,
          appointment_date = EXCLUDED.appointment_date,
          dispensary = EXCLUDED.dispensary,
          branch_office = EXCLUDED.branch_office,
          employee_photo = EXCLUDED.employee_photo,
          family_photo = EXCLUDED.family_photo,
          employee_signature = EXCLUDED.employee_signature,
          source_pdf_name = EXCLUDED.source_pdf_name,
          updated_at = EXCLUDED.updated_at
        RETURNING *;
      `;
      const values = [
        emp.id,
        emp.insuranceNo || emp.insurance_no || '',
        emp.name || '',
        emp.gender || 'Male',
        emp.fatherOrHusbandName || emp.father_or_husband_name || '',
        emp.relationType || emp.relation_type || 'Father',
        emp.dob || '',
        emp.mobileNo || emp.mobile_no || '',
        emp.address || '',
        emp.city || '',
        emp.state || '',
        emp.pincode || '',
        emp.employerName || emp.employer_name || '',
        emp.employerCode || emp.employer_code || '',
        emp.employerAddress || emp.employer_address || '',
        emp.appointmentDate || emp.appointment_date || '',
        emp.dispensary || '',
        emp.branchOffice || emp.branch_office || '',
        emp.employeePhoto || emp.employee_photo || '',
        emp.familyPhoto || emp.family_photo || '',
        emp.employeeSignature || emp.employee_signature || '',
        emp.sourcePdfName || emp.source_pdf_name || '',
        emp.createdAt || new Date().toISOString(),
        new Date().toISOString(),
      ];
      const res = await dbPool.query(query, values);
      return res.rows[0];
    } catch (e) {
      console.error('Error saving employee to PostgreSQL:', e);
    }
  }

  // Fallback memory
  const index = fallbackEmployees.findIndex((item) => item.id === emp.id);
  if (index >= 0) {
    fallbackEmployees[index] = { ...fallbackEmployees[index], ...emp, updatedAt: new Date().toISOString() };
    return fallbackEmployees[index];
  } else {
    const newRecord = {
      ...emp,
      createdAt: emp.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    fallbackEmployees.unshift(newRecord);
    return newRecord;
  }
}

export async function deleteEmployeeFromDb(id: string) {
  const dbPool = getDbPool();
  if (dbPool && isConnectedToSql) {
    try {
      await dbPool.query(`DELETE FROM employees WHERE id = $1`, [id]);
    } catch (e) {
      console.error('Error deleting employee from PostgreSQL:', e);
    }
  }
  fallbackEmployees = fallbackEmployees.filter((item) => item.id !== id);
  return true;
}

// ----------------------------------------------------
// Users Operations
// ----------------------------------------------------
export async function getAllUsersFromDb() {
  const dbPool = getDbPool();
  if (dbPool && isConnectedToSql) {
    try {
      const res = await dbPool.query(`
        SELECT 
          id,
          name,
          email,
          password,
          role,
          is_active AS "isActive",
          department,
          avatar_url AS "avatarUrl",
          last_login AS "lastLogin",
          authorized_employee_ids AS "authorizedEmployeeIdsStr",
          authorize_all AS "authorizeAll",
          created_at AS "createdAt"
        FROM portal_users
        ORDER BY created_at ASC
      `);
      return res.rows.map((row: any) => ({
        ...row,
        authorizedEmployeeIds: row.authorizedEmployeeIdsStr ? JSON.parse(row.authorizedEmployeeIdsStr) : [],
        authorizeAll: row.authorizeAll !== false,
      }));
    } catch (e) {
      console.error('Error fetching users from PostgreSQL:', e);
    }
  }
  return fallbackUsers;
}

export async function saveUserToDb(user: any) {
  const dbPool = getDbPool();
  const authIdsStr = JSON.stringify(user.authorizedEmployeeIds || []);
  const authAll = user.authorizeAll !== undefined ? user.authorizeAll : (user.role === 'Admin');

  if (dbPool && isConnectedToSql) {
    try {
      const query = `
        INSERT INTO portal_users (
          id, name, email, password, role, is_active, department, avatar_url, last_login, authorized_employee_ids, authorize_all, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          password = EXCLUDED.password,
          role = EXCLUDED.role,
          is_active = EXCLUDED.is_active,
          department = EXCLUDED.department,
          avatar_url = EXCLUDED.avatar_url,
          last_login = EXCLUDED.last_login,
          authorized_employee_ids = EXCLUDED.authorized_employee_ids,
          authorize_all = EXCLUDED.authorize_all
        RETURNING *;
      `;
      const values = [
        user.id,
        user.name,
        user.email,
        user.password || (user.role === 'Admin' ? 'Admin123' : 'User123'),
        user.role || 'User',
        user.isActive !== false,
        user.department || '',
        user.avatarUrl || '',
        user.lastLogin || '',
        authIdsStr,
        authAll,
        user.createdAt || new Date().toISOString(),
      ];
      const res = await dbPool.query(query, values);
      return {
        ...res.rows[0],
        authorizedEmployeeIds: user.authorizedEmployeeIds || [],
        authorizeAll: authAll,
      };
    } catch (e) {
      console.error('Error saving user to PostgreSQL:', e);
    }
  }

  const idx = fallbackUsers.findIndex((u) => u.id === user.id);
  if (idx >= 0) {
    fallbackUsers[idx] = { ...fallbackUsers[idx], ...user, authorizedEmployeeIds: user.authorizedEmployeeIds || [], authorizeAll: authAll };
    return fallbackUsers[idx];
  } else {
    const newUser = { ...user, authorizedEmployeeIds: user.authorizedEmployeeIds || [], authorizeAll: authAll };
    fallbackUsers.push(newUser);
    return newUser;
  }
}

export async function deleteUserFromDb(id: string) {
  const dbPool = getDbPool();
  if (dbPool && isConnectedToSql) {
    try {
      await dbPool.query(`DELETE FROM portal_users WHERE id = $1`, [id]);
    } catch (e) {
      console.error('Error deleting user from PostgreSQL:', e);
    }
  }
  fallbackUsers = fallbackUsers.filter((u) => u.id !== id);
  return true;
}

// ----------------------------------------------------
// Global Settings Operations
// ----------------------------------------------------
export async function getSettingsFromDb() {
  const dbPool = getDbPool();
  if (dbPool && isConnectedToSql) {
    try {
      const res = await dbPool.query(`
        SELECT 
          employer_signature AS "employerSignature",
          employer_stamp AS "employerStamp",
          organization_name AS "organizationName",
          portal_title AS "portalTitle",
          helpline_no AS "helplineNo"
        FROM global_settings
        WHERE id = 'default'
      `);
      if (res.rows.length > 0) return res.rows[0];
    } catch (e) {
      console.error('Error fetching settings from PostgreSQL:', e);
    }
  }
  return fallbackSettings;
}

export async function saveSettingsToDb(settings: any) {
  const dbPool = getDbPool();
  if (dbPool && isConnectedToSql) {
    try {
      const query = `
        INSERT INTO global_settings (
          id, employer_signature, employer_stamp, organization_name, portal_title, helpline_no, updated_at
        ) VALUES ('default', $1, $2, $3, $4, $5, NOW())
        ON CONFLICT (id) DO UPDATE SET
          employer_signature = EXCLUDED.employer_signature,
          employer_stamp = EXCLUDED.employer_stamp,
          organization_name = EXCLUDED.organization_name,
          portal_title = EXCLUDED.portal_title,
          helpline_no = EXCLUDED.helpline_no,
          updated_at = NOW()
        RETURNING *;
      `;
      const values = [
        settings.employerSignature || '',
        settings.employerStamp || '',
        settings.organizationName || '',
        settings.portalTitle || '',
        settings.helplineNo || '',
      ];
      await dbPool.query(query, values);
    } catch (e) {
      console.error('Error saving settings to PostgreSQL:', e);
    }
  }
  fallbackSettings = { ...settings };
  return fallbackSettings;
}

// Seed initial memory cache
export function seedFallbackData(employees: any[], users: any[], settings: any) {
  if (fallbackEmployees.length === 0) fallbackEmployees = [...employees];
  if (fallbackUsers.length === 0) fallbackUsers = [...users];
  if (!fallbackSettings) fallbackSettings = { ...settings };
}
