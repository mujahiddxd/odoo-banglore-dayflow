# Project Context & History

This document provides historical context on how the DayFlow application evolved during the hackathon development cycle, specifically regarding the merging of two parallel development streams.

## The Dual Workstreams
During the hackathon, development was temporarily split into two parallel streams to maximize velocity:

1. **Stream A (Teammate)**: 
   - Focused on the onboarding experience (`/signin`, `/signup`).
   - Implemented a robust MySQL database layer (`src/lib/db.ts`).
   - Built JWT-based authentication using `jose` and `bcryptjs`.
   - Created the Attendance tracking system and the root `/dashboard` view with active Check In/Out components.

2. **Stream B (AI Assistant)**:
   - Focused on the core HR functionality (`/dashboard/my-profile`, `/dashboard/employees`).
   - Built a comprehensive, in-memory Salary Calculation Engine (`src/lib/salary-engine.ts`) with decimal-safe operations.
   - Designed the unique "Sketchy" creative UI using Tailwind CSS (`globals.css`).
   - Implemented an in-memory mock session layer for immediate UI/UX testing without a database connection.

## The Merge Event
When Stream A pushed their commits (`6ca79c7`) to `origin/main`, Stream B had already generated a massive amount of code locally. A `git pull --rebase` resulted in significant merge conflicts across core layout files, CSS, and API routes.

### Conflict Resolution Strategy
Instead of overriding one stream with the other, the application was refactored to support a **Hybrid Architecture**:

1. **Authentication (`src/lib/auth.ts`)**: 
   - We merged both authentication paradigms. `getCurrentUser()` now seamlessly checks for a fast mock session cookie first, and if absent, verifies the JWT token against the MySQL database. 
   - This ensures the UI is testable instantly but remains secure in production.

2. **API Routes (`api/auth/me`, `api/employees`)**:
   - The routes were wrapped in `try/catch` blocks that first attempt to execute MySQL queries. If the database connection fails (common in local environments without MySQL running), it gracefully falls back to the in-memory `data/employees.ts` store.

3. **Routing Conflicts**:
   - Stream A created `src/app/api/employees/[id]`, while Stream B created `src/app/api/employees/[employeeId]`. This caused Next.js to crash with an `Ambiguous app routes` error. We resolved this by combining both into `[employeeId]` and deleting the duplicate folder.
   - Similarly, Stream A's `src/app/dashboard` was moved securely inside Stream B's authenticated `src/app/(dashboard)/dashboard` layout route group.

4. **Package Management**:
   - The merge initially resulted in a `500 Internal Server Error` because Stream A's dependencies (`bcryptjs`, `jose`, `mysql2`) were not installed in the local `node_modules`. Running `npm install` resolved the fatal crashes.

## Current State
The repository is now fully unified, compiling with **0 errors**, and successfully implements all features from both workstreams into a single, cohesive, Sketchy-themed HRMS.
