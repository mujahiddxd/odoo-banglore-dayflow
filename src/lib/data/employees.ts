// ============================================================
// Employee Data Store (In-Memory for Hackathon Demo)
// ============================================================

import type {
  Employee,
  PrivateInfo,
  BankDetails,
  CompanyIdentifiers,
  ProfileInfo,
  ResumeEntry,
  EducationEntry,
  FullEmployeeProfile,
} from '../types';

// ---- Seed Data ----

const employees: Map<string, Employee> = new Map([
  [
    'emp-001',
    {
      id: 'emp-001',
      name: 'Priya Sharma',
      email: 'priya.sharma@dayflow.in',
      mobile: '+91 98765 43210',
      position: 'HR Manager',
      department: 'Human Resources',
      manager: '—',
      company: 'Dayflow Technologies Pvt. Ltd.',
      location: 'Bangalore, India',
      avatar: '',
      role: 'ADMIN',
    },
  ],
  [
    'emp-002',
    {
      id: 'emp-002',
      name: 'Rahul Kumar',
      email: 'rahul.kumar@dayflow.in',
      mobile: '+91 87654 32109',
      position: 'Senior Software Engineer',
      department: 'Engineering',
      manager: 'Priya Sharma',
      company: 'Dayflow Technologies Pvt. Ltd.',
      location: 'Bangalore, India',
      avatar: '',
      role: 'EMPLOYEE',
    },
  ],
  [
    'emp-003',
    {
      id: 'emp-003',
      name: 'Ananya Patel',
      email: 'ananya.patel@dayflow.in',
      mobile: '+91 76543 21098',
      position: 'Product Designer',
      department: 'Design',
      manager: 'Priya Sharma',
      company: 'Dayflow Technologies Pvt. Ltd.',
      location: 'Bangalore, India',
      avatar: '',
      role: 'EMPLOYEE',
    },
  ],
]);

const privateInfoStore: Map<string, PrivateInfo> = new Map([
  [
    'emp-001',
    {
      dateOfBirth: '1990-03-15',
      residentialAddress: '42, MG Road, Koramangala, Bangalore 560034',
      nationality: 'Indian',
      personalEmail: 'priya.personal@gmail.com',
      gender: 'Female',
      maritalStatus: 'Married',
      dateOfJoining: '2021-06-01',
    },
  ],
  [
    'emp-002',
    {
      dateOfBirth: '1993-08-22',
      residentialAddress: '15, HSR Layout, Sector 7, Bangalore 560102',
      nationality: 'Indian',
      personalEmail: 'rahul.k93@gmail.com',
      gender: 'Male',
      maritalStatus: 'Single',
      dateOfJoining: '2022-01-10',
    },
  ],
  [
    'emp-003',
    {
      dateOfBirth: '1995-11-05',
      residentialAddress: '78, Indiranagar, 12th Main, Bangalore 560038',
      nationality: 'Indian',
      personalEmail: 'ananya.design@gmail.com',
      gender: 'Female',
      maritalStatus: 'Single',
      dateOfJoining: '2022-07-15',
    },
  ],
]);

const bankDetailsStore: Map<string, BankDetails> = new Map([
  [
    'emp-001',
    {
      accountNumber: '1234567890123456',
      bankName: 'HDFC Bank',
      ifscCode: 'HDFC0001234',
    },
  ],
  [
    'emp-002',
    {
      accountNumber: '9876543210654321',
      bankName: 'ICICI Bank',
      ifscCode: 'ICIC0005678',
    },
  ],
  [
    'emp-003',
    {
      accountNumber: '5678901234567890',
      bankName: 'SBI',
      ifscCode: 'SBIN0009012',
    },
  ],
]);

const companyIdsStore: Map<string, CompanyIdentifiers> = new Map([
  [
    'emp-001',
    {
      panNumber: 'ABCPS1234D',
      uanNumber: '100123456789',
      employeeCode: 'DF-001',
    },
  ],
  [
    'emp-002',
    {
      panNumber: 'DEFPK5678E',
      uanNumber: '100234567890',
      employeeCode: 'DF-002',
    },
  ],
  [
    'emp-003',
    {
      panNumber: 'GHIPP9012F',
      uanNumber: '100345678901',
      employeeCode: 'DF-003',
    },
  ],
]);

const profileInfoStore: Map<string, ProfileInfo> = new Map([
  [
    'emp-001',
    {
      about:
        'Passionate HR professional with 8+ years of experience in talent management and organizational development.',
      whatILoveAboutMyJob:
        'Building a culture where every employee thrives and feels valued.',
      interests: 'Travel, reading, yoga, public speaking',
      skills: [
        'Talent Acquisition',
        'Employee Relations',
        'Payroll Management',
        'Performance Review',
        'Compliance',
      ],
      certifications: [
        'SHRM-CP',
        'HR Analytics – IIM Bangalore',
      ],
    },
  ],
  [
    'emp-002',
    {
      about:
        'Full-stack developer specializing in React, Node.js, and cloud infrastructure. Open source contributor.',
      whatILoveAboutMyJob:
        'Solving complex problems and seeing code come to life in production.',
      interests: 'Open source, gaming, cycling, photography',
      skills: [
        'TypeScript',
        'React',
        'Node.js',
        'PostgreSQL',
        'AWS',
        'Docker',
      ],
      certifications: [
        'AWS Solutions Architect – Associate',
        'Google Cloud Professional Developer',
      ],
    },
  ],
  [
    'emp-003',
    {
      about:
        'UI/UX designer with a passion for creating delightful user experiences. Advocate for accessibility and inclusive design.',
      whatILoveAboutMyJob:
        'Transforming complex workflows into intuitive interfaces that users love.',
      interests: 'Illustration, calligraphy, hiking, pottery',
      skills: [
        'Figma',
        'User Research',
        'Prototyping',
        'Design Systems',
        'Accessibility',
        'Motion Design',
      ],
      certifications: [
        'Google UX Design Certificate',
        'Interaction Design Foundation – UX Management',
      ],
    },
  ],
]);

const resumeStore: Map<string, ResumeEntry[]> = new Map([
  [
    'emp-001',
    [
      {
        title: 'HR Manager',
        organization: 'Dayflow Technologies',
        startDate: '2021-06',
        endDate: 'Present',
        description:
          'Leading HR operations, payroll, compliance, and employee engagement initiatives.',
      },
      {
        title: 'Senior HR Executive',
        organization: 'TechCorp India',
        startDate: '2017-03',
        endDate: '2021-05',
        description:
          'Managed recruitment pipeline, onboarding, and performance review cycles.',
      },
    ],
  ],
  [
    'emp-002',
    [
      {
        title: 'Senior Software Engineer',
        organization: 'Dayflow Technologies',
        startDate: '2022-01',
        endDate: 'Present',
        description:
          'Building core product features, API architecture, and leading frontend development.',
      },
      {
        title: 'Software Engineer',
        organization: 'Infosys',
        startDate: '2018-07',
        endDate: '2021-12',
        description:
          'Full-stack development on enterprise applications using Java and React.',
      },
    ],
  ],
  [
    'emp-003',
    [
      {
        title: 'Product Designer',
        organization: 'Dayflow Technologies',
        startDate: '2022-07',
        endDate: 'Present',
        description:
          'Designing the core product experience, component library, and conducting user research.',
      },
      {
        title: 'UI/UX Designer',
        organization: 'DesignStudio Co.',
        startDate: '2019-09',
        endDate: '2022-06',
        description:
          'Designed mobile and web experiences for fintech and ed-tech clients.',
      },
    ],
  ],
]);

const educationStore: Map<string, EducationEntry[]> = new Map([
  [
    'emp-001',
    [
      {
        degree: 'MBA – Human Resource Management',
        institution: 'XLRI Jamshedpur',
        year: '2017',
        grade: '3.8 GPA',
      },
      {
        degree: 'B.Com',
        institution: 'Christ University, Bangalore',
        year: '2012',
        grade: '85%',
      },
    ],
  ],
  [
    'emp-002',
    [
      {
        degree: 'B.Tech – Computer Science',
        institution: 'NIT Surathkal',
        year: '2018',
        grade: '8.7 CGPA',
      },
    ],
  ],
  [
    'emp-003',
    [
      {
        degree: 'B.Des – Communication Design',
        institution: 'NID Ahmedabad',
        year: '2019',
        grade: 'A',
      },
    ],
  ],
]);

// ---- Data Access Functions ----

export function getEmployee(id: string): Employee | undefined {
  return employees.get(id);
}

export function getAllEmployees(): Employee[] {
  return Array.from(employees.values());
}

export function getPrivateInfo(id: string): PrivateInfo | undefined {
  return privateInfoStore.get(id);
}

export function getBankDetails(id: string): BankDetails | undefined {
  return bankDetailsStore.get(id);
}

export function getCompanyIdentifiers(
  id: string
): CompanyIdentifiers | undefined {
  return companyIdsStore.get(id);
}

export function getProfileInfo(id: string): ProfileInfo | undefined {
  return profileInfoStore.get(id);
}

export function getResume(id: string): ResumeEntry[] {
  return resumeStore.get(id) ?? [];
}

export function getEducation(id: string): EducationEntry[] {
  return educationStore.get(id) ?? [];
}

export function getFullProfile(id: string): FullEmployeeProfile | null {
  const employee = getEmployee(id);
  if (!employee) return null;

  return {
    employee,
    privateInfo: getPrivateInfo(id) ?? {
      dateOfBirth: '',
      residentialAddress: '',
      nationality: '',
      personalEmail: '',
      gender: '',
      maritalStatus: '',
      dateOfJoining: '',
    },
    bankDetails: getBankDetails(id) ?? {
      accountNumber: '',
      bankName: '',
      ifscCode: '',
    },
    companyIdentifiers: getCompanyIdentifiers(id) ?? {
      panNumber: '',
      uanNumber: '',
      employeeCode: '',
    },
    profileInfo: getProfileInfo(id) ?? {
      about: '',
      whatILoveAboutMyJob: '',
      interests: '',
      skills: [],
      certifications: [],
    },
    resume: getResume(id),
    education: getEducation(id),
  };
}

export function updatePrivateInfo(
  id: string,
  data: Partial<PrivateInfo>
): void {
  const existing = getPrivateInfo(id);
  if (existing) {
    privateInfoStore.set(id, { ...existing, ...data });
  }
}

export function updateProfileInfo(
  id: string,
  data: Partial<ProfileInfo>
): void {
  const existing = getProfileInfo(id);
  if (existing) {
    profileInfoStore.set(id, { ...existing, ...data });
  }
}
