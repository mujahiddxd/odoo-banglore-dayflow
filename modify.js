const fs = require('fs');
const path = 'src/app/(dashboard)/dashboard/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add import
if (!content.includes('CalendarView')) {
  content = content.replace("import { AddEmployeeModal } from '@/components/employees/AddEmployeeModal';", "import { AddEmployeeModal } from '@/components/employees/AddEmployeeModal';\nimport CalendarView from '@/components/dashboard/CalendarView';");
}

// 2. Add state
if (!content.includes('viewMode')) {
  content = content.replace("const [showAddModal, setShowAddModal] = useState(false);", "const [showAddModal, setShowAddModal] = useState(false);\n  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');");
}

// 3. Add toggle buttons next to Add button
const headerString = <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-headline text-2xl font-bold text-[var(--uxsg-ink)]">
                  Employees
                </h1>
                <p className="font-body text-sm text-gray-500 mt-1">
                  {employees.length} team member{employees.length !== 1 ? 's' : ''}
                </p>
              </div>;
              
const newHeaderString = <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="font-headline text-2xl font-bold text-[var(--uxsg-ink)]">
                    Employees
                  </h1>
                  <p className="font-body text-sm text-gray-500 mt-1">
                    {employees.length} team member{employees.length !== 1 ? 's' : ''}
                  </p>
                </div>
                
                <div className="flex bg-gray-100 rounded-lg p-1 border-2 border-[var(--uxsg-ink)] ml-4">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={\px-3 py-1 text-sm font-bold rounded-md transition-colors \\}
                  >
                    Grid View
                  </button>
                  <button 
                    onClick={() => setViewMode('calendar')}
                    className={\px-3 py-1 text-sm font-bold rounded-md transition-colors \\}
                  >
                    Calendar View
                  </button>
                </div>
              </div>;
content = content.replace(headerString, newHeaderString);

// 4. Wrap the Employee Grid in conditional rendering
const gridStartString = {/* Employee Grid */}
            {employees.length === 0 ?;
            
const gridNewStartString = {viewMode === 'calendar' ? (
              <CalendarView />
            ) : (
              <>
                {/* Employee Grid */}
                {employees.length === 0 ?;
content = content.replace(gridStartString, gridNewStartString);

// 5. Close the conditional rendering before settings
const gridEndString = </div>
            )}

            {/* Settings link */};
            
const gridNewEndString = </div>
                )}
              </>
            )}

            {/* Settings link */};
            
content = content.replace(gridEndString, gridNewEndString);

fs.writeFileSync(path, content);
