import { nanoid } from 'nanoid';
import { prisma } from '../lib/prisma';
import type { CreateLinkRequest } from '../types/link';
import bcrypt from 'bcryptjs';

class PrismaLinkService {
  // 全てのリンクを取得
  async getAllLinks() {
    return await prisma.shortLink.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  // 短縮リンクを作成
  async createShortLink(request: CreateLinkRequest): Promise<any> {
    const shortCode = nanoid(6); // 6文字のランダム文字列

    // 短縮コードの重複チェック（念のため）
    const existing = await prisma.shortLink.findUnique({
      where: { shortCode }
    });

    if (existing) {
      // 重複した場合は再帰的に新しいコードを生成
      return this.createShortLink(request);
    }

    return await prisma.shortLink.create({
      data: {
        shortCode,
        originalUrl: request.originalUrl,
        title: request.title,
      }
    });
  }

  // 短縮コードからリンクを取得
  async getLinkByShortCode(shortCode: string) {
    return await prisma.shortLink.findUnique({
      where: { shortCode }
    });
  }

  // クリック数を増加
  async incrementClickCount(shortCode: string) {
    await prisma.shortLink.update({
      where: { shortCode },
      data: {
        clickCount: {
          increment: 1
        }
      }
    });
  }

  // リンクを削除
  async deleteLink(id: string) {
    await prisma.shortLink.delete({
      where: { id }
    });
  }

  // リンクを更新
  async updateLink(id: string, updates: { title?: string; originalUrl?: string }) {
    return await prisma.shortLink.update({
      where: { id },
      data: updates
    });
  }

  // URLのバリデーション
  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

export const prismaLinkService = new PrismaLinkService();

export async function createInitialUser(id: string, name: string, password: string) {
  const existingUsers = await prisma.users.findMany();
  if (existingUsers.length > 0) {
    throw new Error('既にユーザーが存在します');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  return prisma.users.create({
    data: {
      id,
      name,
      password: hashedPassword,
    },
  });
}
