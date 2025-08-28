import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { name: id, password } = await req.json();

    // 入力値のバリデーション
    if (!id || !password) {
      return NextResponse.json({ message: 'すべてのフィールドを入力してください' }, { status: 400 });
    }

    // ユーザーが既に存在するか確認
    const existingUsers = await prisma.users?.findMany();
    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json({ message: '既にユーザーが存在します' }, { status: 403 });
    }

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    // ユーザーを作成
    const newUser = await prisma.users?.create({
      data: {
        id: id,
        name: id,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ message: 'ユーザーが作成されました', user: newUser });
  } catch (error) {
    console.error('ユーザー作成エラー:', error);
    return NextResponse.json({ message: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
