import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { initDatabase, query } from '@/lib/db';
import { getAttendanceForDate } from '@/lib/data/attendance';
import { getAllRequests, getTimeOffType } from '@/lib/data/timeoff';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const role = user.role.toLowerCase();
    if (role !== 'admin' && role !== 'hr') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    await initDatabase();

    // 1. Get total active employees
    const employeesResult = await query<{ count: number }>('SELECT COUNT(*) as count FROM employees');
    const totalEmployees = employeesResult[0].count;

    // 2. Generate Attendance Trend for the last 5 days
    const attendanceData = [];
    const today = new Date();
    
    // We only care about approved requests
    const allApprovedRequests = getAllRequests({ status: 'APPROVED' });

    for (let i = 4; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

      // Find who was present
      const attendance = getAttendanceForDate(dateStr);
      const presentEmployees = new Set(
        attendance
          .filter(a => a.status === 'CHECKED_IN' || a.status === 'CHECKED_OUT')
          .map(a => a.employeeId)
      );
      const presentCount = presentEmployees.size;

      // Find who was on leave
      const leaveCount = allApprovedRequests.filter(req => {
        return req.startDate <= dateStr && req.endDate >= dateStr;
      }).length;

      // Absent is the remainder
      const absentCount = Math.max(0, totalEmployees - presentCount - leaveCount);

      attendanceData.push({
        name: dayName,
        Present: presentCount,
        Absent: absentCount,
        Leave: leaveCount,
      });
    }

    // 3. Generate Leave Distribution YTD
    const leaveDistributionMap = new Map<string, number>();
    
    // Only current year
    const currentYear = today.getFullYear().toString();
    const ytdRequests = allApprovedRequests.filter(req => req.startDate.startsWith(currentYear));

    for (const req of ytdRequests) {
      const type = getTimeOffType(req.timeOffTypeId);
      const typeName = type ? type.name : 'Other Leave';
      
      // Calculate leave distribution by counting number of requests per type
      // Alternatively, we could sum req.days if we want total days per type
      leaveDistributionMap.set(typeName, (leaveDistributionMap.get(typeName) || 0) + req.days);
    }

    const leaveData = Array.from(leaveDistributionMap.entries()).map(([name, value]) => ({
      name,
      value
    }));

    return NextResponse.json({
      success: true,
      data: {
        attendanceData,
        leaveData
      }
    });

  } catch (error) {
    console.error('Reports API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
