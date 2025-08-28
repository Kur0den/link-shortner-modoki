import { nanoid } from 'nanoid';
import type { ShortLink, CreateLinkRequest } from '../types/link';

// サーバーサイド用のメモリストレージ
let serverLinks: ShortLink[] = [];

class ServerLinkService {
  // 全てのリンクを取得
  getAllLinks(): ShortLink[] {
    return serverLinks;
  }

  // 短縮リンクを作成
  createShortLink(request: CreateLinkRequest): ShortLink {
    const shortCode = nanoid(6); // 6文字のランダム文字列
    const newLink: ShortLink = {
      id: nanoid(),
      shortCode,
      originalUrl: request.originalUrl,
      title: request.title,
      createdAt: new Date().toISOString(),
      clickCount: 0,
    };

    serverLinks.push(newLink);
    return newLink;
  }

  // 短縮コードからリンクを取得
  getLinkByShortCode(shortCode: string): ShortLink | null {
    return serverLinks.find(link => link.shortCode === shortCode) || null;
  }

  // クリック数を増加
  incrementClickCount(shortCode: string): void {
    const linkIndex = serverLinks.findIndex(link => link.shortCode === shortCode);

    if (linkIndex !== -1) {
      serverLinks[linkIndex].clickCount++;
    }
  }

  // リンクを削除
  deleteLink(id: string): void {
    serverLinks = serverLinks.filter(link => link.id !== id);
  }

  // リンクを更新
  updateLink(id: string, updates: Partial<ShortLink>): ShortLink | null {
    const linkIndex = serverLinks.findIndex(link => link.id === id);

    if (linkIndex !== -1) {
      serverLinks[linkIndex] = { ...serverLinks[linkIndex], ...updates };
      return serverLinks[linkIndex];
    }

    return null;
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

export const serverLinkService = new ServerLinkService();
