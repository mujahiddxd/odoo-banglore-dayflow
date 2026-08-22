// ============================================================
// Core Types for Dayflow HRMS
// ============================================================

export type Role = 'ADMIN' | 'EMPLOYEE';

export interface Employee {
  id: string;
  name: string;
  email: string;
  mobile: string;
  position: string;
  department: string;
  manager: string;
  company: string;
  location: string;
  avatar: string; // URL or initials fallback
  role: Role;
}

export interface PrivateInfo {
  dateOfBirth: string;
  residentialAddress: string;
  nationality: string;
  personalEmail: string;
  gender: 'Male' | 'Female' | 'Other' | '';
  maritalStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed' | '';
  dateOfJoining: string;
}

export interface BankDetails {
  accountNumber: string;
  bankName: string;
  ifscCode: string;
}

export interface CompanyIdentifiers {
  panNumber: string;
  uanNumber: string;
  employeeCode: string;
}

export interface ProfileInfo {
  about: string;
  whatILoveAboutMyJob: string;
  interests: string;
  skills: string[];
  certifications: string[];
}

export interface ResumeEntry {
  title: string;
  organization: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface EducationEntry {
  degree: string;
  institution: string;
  year: string;
  grade: string;
}

// ============================================================
// Salary Types
// ============================================================

export type CalculationType = 'PERCENTAGE' | 'FIXED' | 'REMAINING_BALANCE';
export type CalculationBasis = 'WAGE' | 'BASIC' | 'NONE';
export type WageType = 'FIXED_WAGE';

export interface SalaryComponentConfig {
  name: string;
  calculationType: CalculationType;
  calculationBasis: CalculationBasis;
  /** Percentage value (e.g. 50 for 50%) or fixed amount in paise for FIXED type */
  value: number;
  /** Computed monthly amount in paise (set by salary engine, not user) */
  computedAmount: number;
  /** Whether this component is editable by admin */
  editable: boolean;
  /** Display order */
  order: number;
}

export interface SalaryConfig {
  employeeId: string;
  wageType: WageType;
  /** Monthly wage in paise (₹50,000 = 5000000 paise) */
  monthlyWage: number;
  /** Yearly wage in paise (auto = monthly × 12) */
  yearlyWage: number;
  components: SalaryComponentConfig[];
  /** PF rates as percentage values (e.g. 12 for 12%) */
  pfEmployeeRate: number;
  pfEmployerRate: number;
  /** Professional tax in paise per month */
  professionalTax: number;
  professionalTaxActive: boolean;
  /** Working configuration */
  workingDaysPerWeek: number;
  breakTimeHours: number;
}

export interface ComputedSalary {
  monthlyWage: number;
  yearlyWage: number;
  components: SalaryComponentConfig[];
  employeePF: number;
  employerPF: number;
  professionalTax: number;
  totalDeductions: number;
  netSalary: number;
  grossSalary: number;
}

export interface SalaryHistoryEntry {
  id: string;
  employeeId: string;
  previousConfig: SalaryConfig;
  newConfig: SalaryConfig;
  effectiveDate: string;
  changedBy: string;
  changedByName: string;
  timestamp: string;
  reason: string;
}

// ============================================================
// Full employee profile (combines all sections)
// ============================================================

export interface FullEmployeeProfile {
  employee: Employee;
  privateInfo: PrivateInfo;
  bankDetails: BankDetails;
  companyIdentifiers: CompanyIdentifiers;
  profileInfo: ProfileInfo;
  resume: ResumeEntry[];
  education: EducationEntry[];
}

// ============================================================
// API response types
// ============================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================
// Auth types
// ============================================================

export interface AuthUser {
  employeeId: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  position?: string;
  department?: string;
  firstLogin?: boolean;
  companyId?: number;
}

// ============================================================
// Attendance Types
// ============================================================

export type AttendanceStatus =
  | 'PRESENT'
  | 'ABSENT'
  | 'ON_LEAVE'
  | 'HALF_DAY'
  | 'NOT_CHECKED_IN'
  | 'CHECKED_IN'
  | 'CHECKED_OUT';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  checkIn: string | null; // ISO timestamp
  checkOut: string | null; // ISO timestamp
  workingMinutes: number; // total working minutes
  breakMinutes: number; // break minutes
  extraMinutes: number; // overtime minutes
  status: AttendanceStatus;
  ipAddress: string;
  networkId: string | null;
  officeId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AttendanceAuditAction =
  | 'CHECK_IN_SUCCESS'
  | 'CHECK_IN_FAILED'
  | 'CHECK_OUT_SUCCESS'
  | 'CHECK_OUT_FAILED'
  | 'INVALID_NETWORK'
  | 'ALREADY_CHECKED_IN'
  | 'ALREADY_CHECKED_OUT';

export interface AttendanceAuditEntry {
  id: string;
  employeeId: string;
  action: AttendanceAuditAction;
  timestamp: string;
  ipAddress: string;
  networkId: string | null;
  officeId: string | null;
  success: boolean;
  failureReason: string | null;
  userAgent: string;
}

// ============================================================
// Company Network Types
// ============================================================

export interface ApprovedNetwork {
  id: string;
  companyId: string;
  officeId: string;
  officeName: string;
  networkName: string;
  ipv4: string;
  cidr: string;
  ipv6: string;
  enabled: boolean;
  validFrom: string;
  validUntil: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Time Off Types
// ============================================================

export interface TimeOffType {
  id: string;
  name: string;
  description: string;
  isPaid: boolean;
  allocationRequired: boolean;
  maxAllocation: number;
  allowNegativeBalance: boolean;
  active: boolean;
  createdAt: string;
}

export type TimeOffRequestStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export interface TimeOffAllocation {
  id: string;
  employeeId: string;
  timeOffTypeId: string;
  timeOffTypeName: string;
  year: number;
  allocatedDays: number;
  usedDays: number;
  pendingDays: number;
  remainingDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface TimeOffRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  timeOffTypeId: string;
  timeOffTypeName: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  days: number;
  reason: string;
  status: TimeOffRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TimeOffApprovalAudit {
  id: string;
  requestId: string;
  action: 'APPROVED' | 'REJECTED' | 'CANCELLED';
  performedBy: string;
  performedByName: string;
  timestamp: string;
  comment: string;
}

// ============================================================
// Payroll Summary Types
// ============================================================

export interface PayableDaysSummary {
  month: number;
  year: number;
  calendarDays: number;
  workingDays: number;
  presentDays: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  absentDays: number;
  payableDays: number;
  totalWorkingMinutes: number;
  totalExtraMinutes: number;
}

// ============================================================
// Monthly Attendance Summary
// ============================================================

export interface MonthlyAttendanceSummary {
  daysPresent: number;
  workingDays: number;
  absentDays: number;
  approvedLeave: number;
  totalWorkingMinutes: number;
  totalExtraMinutes: number;
}
