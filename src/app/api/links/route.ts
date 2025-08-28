import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prismaLinkService } from '../../../services/prismaLinkService';

// 全てのリンクを取得（認証必要）
export async function GET() {
  try {
    // セッション確認
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Login required' },
        { status: 401 }
      );
    }

    const links = await prismaLinkService.getAllLinks();
    return NextResponse.json(links);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch links' },
      { status: 500 }
    );
  }
}

// 新しい短縮リンクを作成（認証必要）
export async function POST(request: NextRequest) {
  try {
    // セッション確認
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Login required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { originalUrl, title } = body;

    // URLバリデーション
    if (!originalUrl || !prismaLinkService.isValidUrl(originalUrl)) {
      return NextResponse.json(
        { error: 'Valid URL is required' },
        { status: 400 }
      );
    }

    // 短縮リンクを作成
    const newLink = await prismaLinkService.createShortLink({ originalUrl, title });

    return NextResponse.json(newLink, { status: 201 });
  } catch (error) {
    console.error('Error creating short link:', error);
    return NextResponse.json(
      { error: 'Failed to create short link' },
      { status: 500 }
    );
  }
}

// リンクを削除（認証必要）
export async function DELETE(request: NextRequest) {
  try {
    // セッション確認
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Login required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Link ID is required' },
        { status: 400 }
      );
    }

    await prismaLinkService.deleteLink(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting link:', error);
    return NextResponse.json(
      { error: 'Failed to delete link' },
      { status: 500 }
    );
  }
}
