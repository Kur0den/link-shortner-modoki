'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Spinner } from 'react-bootstrap';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') {
      return; // まだ読み込み中
    }

    if (!session) {
      router.push('/auth/signin');
    } else {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  // ローディング中の表示
  if (status === 'loading') {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">読み込み中...</span>
        </Spinner>
      </div>
    );
  }

  // リダイレクト処理中の表示（実際には表示されない）
  return null;
}
