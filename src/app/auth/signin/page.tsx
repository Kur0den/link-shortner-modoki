import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import SignInForm from '../../../components/SignInForm';

export default async function SignInPage() {
  // セッションをチェック
  const session = await getServerSession();

  // すでにログインしている場合はダッシュボードへリダイレクト
  if (session) {
    redirect('/dashboard');
  }

  // ユーザーが存在するか確認
  const users = await prisma.users.findMany();
  if (users.length === 0) {
    // ユーザーが存在しない場合は、登録ページへリダイレクト
    redirect('/auth/register');
  }

  return <SignInForm />;
}
