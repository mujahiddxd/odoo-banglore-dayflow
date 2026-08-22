<<<<<<< HEAD
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  } else {
    redirect("/login");
=======
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function Home() {
  const session = await getSession();

  if (session) {
    redirect('/dashboard');
  } else {
    redirect('/signin');
>>>>>>> origin/main
  }
}
