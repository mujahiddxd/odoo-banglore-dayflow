import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { execute } from '@/lib/db';
import { z } from 'zod';

const AvatarSchema = z.object({
  avatar: z.string().min(1),
});

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  const isSelf = Number(session.user.id) === Number(id);
  const isPrivileged = ['admin', 'hr'].includes(session.user.role);
  
  if (!isSelf && !isPrivileged) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const result = AvatarSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid payload', details: result.error.format() }, { status: 400 });
    }

    const { avatar } = result.data;
    
    await execute('UPDATE employees SET avatar = ? WHERE id = ?', [avatar, id]);
    
    return NextResponse.json({ message: 'Avatar updated successfully' });
  } catch (error) {
    console.error('Error updating avatar:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
