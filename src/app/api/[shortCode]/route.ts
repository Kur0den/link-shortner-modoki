import { NextRequest, NextResponse } from 'next/server';
import { prismaLinkService } from '../../../services/prismaLinkService';

export async function GET(
  request: NextRequest,
  context: { params:  Promise<{shortCode: string}> }
) {
  try {
    const { shortCode } = await context.params;

    // 短縮コードでリンクを検索
    const link = await prismaLinkService.getLinkByShortCode(shortCode);

    if (!link) {
      return NextResponse.json(
        { error: 'Short link not found' },
        { status: 404 }
      );
    }

    // クリック数を増加
    await prismaLinkService.incrementClickCount(shortCode);

    // 元のURLにリダイレクト
    return NextResponse.redirect(link.originalUrl);
  } catch (error) {
    console.error('Error redirecting:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
