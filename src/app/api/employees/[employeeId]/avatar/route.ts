import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { execute, queryOne } from '@/lib/db';
import { z } from 'zod';

const AvatarSchema = z.object({
  avatar: z.string().min(1),
});

export async function POST(
  request: NextRequest, 
  { params }: { params: Promise<{ employeeId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { employeeId } = await params;
  
  const isSelf = session.employeeId === employeeId || employeeId === 'me';
  const isPrivileged = ['admin', 'hr'].includes(session.role);
  
  if (!isSelf && !isPrivileged) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const targetEmployeeId = employeeId === 'me' ? session.employeeId : employeeId;

  try {
    const body = await request.json();
    const result = AvatarSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid payload', details: result.error.format() }, { status: 400 });
    }

    const { avatar } = result.data;
    
    // employee_id is the string ID (e.g. OIADMN20240001)
    await execute('UPDATE employees SET avatar = ? WHERE employee_id = ?', [avatar, targetEmployeeId]);
    
    return NextResponse.json({ message: 'Avatar updated successfully' });
  } catch (error) {
    console.error('Error updating avatar:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
