import { redirect } from 'next/navigation';
import { getCurrentUser, getSession } from '@/lib/auth';

export default async function Home() {
  const session = await getSession();
  const user = await getCurrentUser();

  if (session || user) {
    redirect('/dashboard');
  } else {
    redirect('/signin');
  }
}
