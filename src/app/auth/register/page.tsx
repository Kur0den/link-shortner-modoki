import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import RegisterForm from './RegisterForm';

export default async function RegisterPage() {
  // セッションをチェック
  const session = await getServerSession();

  // すでにログインしている場合はダッシュボードへリダイレクト
  if (session) {
    redirect('/dashboard');
  }

  // ユーザーが存在するか確認
  const users = await prisma.users.findMany();
  if (users.length > 0) {
    // ユーザーが既に存在する場合は、ログインページへリダイレクト
    redirect('/auth/signin');
  }

  return <RegisterForm />;


}
