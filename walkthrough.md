# Walkthrough: DayFlow HRMS

Welcome to **DayFlow**, a modern Human Resource Management System built for the hackathon, featuring a unique "Sketchy" creative direction.

## 1. The Sketchy UI Theme
DayFlow uses a bespoke, warm, hand-drawn digital notebook aesthetic:
- **Paper Background**: A custom SVG noise filter creates a textured paper feel.
- **Wobbly Borders**: Cards, buttons, and inputs use asymmetrical `border-radius` tricks to look hand-drawn.
- **Tape Corners**: Floating gray tape elements (`.tape-tl`, `.tape-br`) pin cards to the background.
- **Sticky Notes**: Vibrant yellow and blue sticky notes for alerts and quick stats, slightly rotated for realism.
- **Typography**: Uses *Cabin Sketch* for headlines, *Patrick Hand* for handwritten notes, and *Sora* for highly legible body text.

## 2. Authentication & Onboarding
- **Sign In / Sign Up**: Users can register and log in via the new JWT and `bcryptjs` backed authentication system. 
- **Graceful Fallback**: For testing without a MySQL server, the app includes a mock in-memory session system. You can test immediately using demo accounts (Admin Priya, Employee Rahul, Employee Ananya).

## 3. The Dashboard
Upon login, you land on the dashboard containing:
- **Navigation Sidebar**: Quick links to Dashboard, My Profile, Employees, Attendance, and Time Off.
- **Employee Directory**: A grid of team members showing their current status (Present, On Leave, Absent).
- **Check In/Out**: A quick widget to log daily attendance.
- **Quick Stats**: Sticky notes showing real-time attendance figures.

## 4. "My Profile" System
Every employee has a dedicated profile view, divided into four tabs:
1. **Resume**: Work experience, education history, technical skills, and certifications.
2. **Private Info**: DOB, residential address, marital status, bank details (masked), PAN, and UAN.
3. **Salary Info**: A complete breakdown of compensation.
4. **Security**: Account security status and last login details.

## 5. Salary Management Engine
The crown jewel of the profile system is the dynamic Salary Engine:
- **Strict Calculations**: Automatically calculates Basic (50% of Wage), HRA (50% of Basic), Bonus/LTA (8.33% of Basic), and a fixed Standard Allowance.
- **Fixed Allowance Balancer**: The system automatically calculates the remaining gap between the wage and the allocated components, assigning it to the Fixed Allowance.
- **Role-Based Access**: Regular employees can only view their own salary (read-only). Admins and HR can view and edit the salary configuration for any employee, with a full version history of changes.

## 6. How to Run
```bash
npm install
npm run dev
```
Navigate to `http://localhost:3000` to start exploring!
