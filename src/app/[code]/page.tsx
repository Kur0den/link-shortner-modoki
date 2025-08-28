import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

interface PageProps {
  params: {
    code: string;
  };
}

export default async function RedirectPage({ params }: PageProps) {
  const { code } = params;

  try {
    const link = await prisma.shortLink.findUnique({
      where: { shortCode: code }
    });

    if (!link) {
      redirect('/');
    }

    // Click count increment
    await prisma.shortLink.update({
      where: { shortCode: code },
      data: {
        clickCount: {
          increment: 1
        }
      }
    });

    redirect(link.originalUrl);
  } catch (error) {
    console.error('Redirect error:', error);
    redirect('/');
  }
}
