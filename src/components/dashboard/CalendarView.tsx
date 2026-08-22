import React, { useState } from 'react';

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 0, 1)); // January 2024 as in mock

  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  
  // Mock events based on the image
  const events = [
    { id: 1, title: 'PARIS TRIP', startDay: 4, endDay: 6, row: 1 },
    { id: 2, title: 'PARIS 10', startDay: 9, endDay: 10, row: 2 },
    { id: 3, title: '15 - 22', startDay: 10, endDay: 11, row: 2, color: 'bg-gray-200 text-gray-700' },
    { id: 4, title: 'NYC - GETAWAY', startDay: 14, endDay: 15, row: 2, color: 'bg-gray-400 text-white' },
    { id: 5, title: 'JAPAN ADVENTURE', startDay: 16, endDay: 17, row: 3 },
    { id: 6, title: 'NYC GETAWAY', startDay: 22, endDay: 23, row: 4 }
  ];

  const isGrayBlock = (day: number) => {
    const grayDays = [9, 15, 18, 19, 20, 21, 23, 24, 25, 27];
    return grayDays.includes(day);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push({ day: null, type: 'padding' });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({ day: i, type: 'current' });
  }

  const rows = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    rows.push(calendarDays.slice(i, i + 7));
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in w-full">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-1/3">
          <input
            type="text"
            placeholder="Search bar ......"
            className="w-full px-4 py-2 border-2 border-[var(--uxsg-ink)] rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--uxsg-ink)] font-handwritten"
            style={{ borderRadius: '8px 2px 8px 4px' }}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="px-4 py-1.5 border-2 border-[var(--uxsg-ink)] bg-transparent font-handwritten hover:bg-[var(--uxsg-ink)] hover:text-white transition-colors" style={{ borderRadius: '6px 3px 6px 4px' }}>
            Group by
          </button>
          <button className="px-4 py-1.5 border-2 border-[var(--uxsg-ink)] bg-transparent font-handwritten hover:bg-[var(--uxsg-ink)] hover:text-white transition-colors" style={{ borderRadius: '4px 6px 3px 6px' }}>
            Filter
          </button>
          <button className="px-4 py-1.5 border-2 border-[var(--uxsg-ink)] bg-transparent font-handwritten hover:bg-[var(--uxsg-ink)] hover:text-white transition-colors" style={{ borderRadius: '5px 4px 5px 3px' }}>
            Sort by...
          </button>
        </div>
      </div>

      <div className="text-center">
        <h2 className="font-handwritten text-xl text-[var(--uxsg-ink)]">Calendar View</h2>
      </div>

      <div className="bg-white border-2 border-[var(--uxsg-ink)] shadow-[4px_4px_0_0_var(--uxsg-ink)] rounded-lg p-6 w-full mx-auto relative overflow-hidden" style={{ borderRadius: '12px' }}>
        <div className="flex items-center justify-between mb-8">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <h3 className="font-headline text-2xl font-bold text-[var(--uxsg-ink)]">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>

        <div className="w-full overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="grid grid-cols-7 border-b border-gray-200 mb-2">
              {daysOfWeek.map((day, i) => (
                <div key={i} className="text-center font-bold text-sm text-gray-700 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="flex flex-col border-l border-t border-gray-200">
              {rows.map((row, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-7 relative" style={{ minHeight: '80px' }}>
                  {row.map((cell, cellIndex) => {
                    const dayNum = cell.day;
                    const isGray = cell.day ? isGrayBlock(dayNum) : false;
                    return (
                      <div 
                        key={cellIndex} 
                        className={"border-r border-b border-gray-200 p-2 " + (isGray ? "bg-gray-300" : "bg-white")}
                      >
                        {cell.day && (
                          <span className="text-sm font-semibold">{cell.day}</span>
                        )}
                      </div>
                    );
                  })}
                  
                  {events.filter(e => e.row === rowIndex).map(event => {
                    const startCol = row.findIndex(c => c.day === event.startDay);
                    let endCol = row.findIndex(c => c.day === event.endDay);
                    
                    if (startCol === -1 && endCol === -1) return null;
                    
                    const actualStartCol = startCol !== -1 ? startCol : 0;
                    const actualEndCol = endCol !== -1 ? endCol : 6;
                    const span = actualEndCol - actualStartCol + 1;
                    
                    return (
                      <div 
                        key={event.id}
                        className={"absolute top-8 left-0 h-6 px-2 text-xs flex items-center border border-gray-300 font-semibold truncate " + (event.color ? event.color : "bg-white text-gray-800")}
                        style={{
                          marginLeft: "calc(" + actualStartCol + " * (100% / 7) + 4px)",
                          width: "calc(" + span + " * (100% / 7) - 8px)",
                        }}
                      >
                        {event.title}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
