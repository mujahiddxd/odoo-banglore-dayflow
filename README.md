# Odoo DayFlow HRMS

DayFlow is a comprehensive Human Resource Management System (HRMS) built specifically for single-tenant enterprise use by **Odoo**. Developed with Next.js 16 (App Router), Tailwind CSS v4, and MySQL, the platform provides a unified "Sketchy" themed interface for core HR functions including employee onboarding, attendance tracking, and payroll management.

## Features

- **Hybrid Authentication Strategy**: Seamlessly integrates a robust JWT & MySQL authentication layer with an in-memory fallback for instant, database-free UI/UX testing and demonstrations.
- **Strict Role-Based Access Control (RBAC)**: Enforces administrative provisioning. Employees cannot self-register, and new accounts are generated with deterministic IDs (e.g., `OIJODO20260001`).
- **Automated Employee Onboarding**: New users undergo a mandatory Profile Setup to update system-generated passwords and upload resumes for AI-driven skill extraction.
- **Advanced Attendance & Time-Off Management**: Real-time Check In/Out with network-based enforcement, coupled with an allocative leave request system (Sick, Casual, Earned).
- **Comprehensive Payroll Engine**: Calculates Payable Days by cross-referencing attendance logs, approved leaves, and specific 5-day/6-day work schedules. Uses decimal-safe arithmetic (Paise) for absolute financial accuracy.

## Architecture

The system utilizes a hybrid architecture that merges two parallel development workstreams into a cohesive product. 
- **Database**: Relies on a MySQL / MariaDB instance.
- **Routing**: Next.js App Router with secure API routes and fallback mock stores.
- **Styling**: Tailwind CSS v4 with a unique creative "Sketchy" aesthetic.

For more detailed technical documentation, please refer to:
- [Context & History](context.md)
- [Architecture](architecture.md)
- [Design Documentation](design.md)

## Getting Started

### Prerequisites

Ensure you have a local MySQL server running (e.g., via XAMPP or Docker).

### Database Setup

1. Create a `.env` file in the root directory:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=dayflow
   ```

2. The application will automatically create the required database tables and seed the default admin account on startup.

### Installation

```bash
npm install
npm run dev
```

### Credentials

Once the development server is running on [http://localhost:3000](http://localhost:3000), you can sign in with the seeded Admin credentials:

- **Email**: `admin@dayflow.in`
- **Password**: `admin123`
