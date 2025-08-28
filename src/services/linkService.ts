import { nanoid } from 'nanoid';
import type { ShortLink, CreateLinkRequest } from '../types/link';

// ローカルストレージのキー
const STORAGE_KEY = 'short-links';

class LinkService {
  // 全てのリンクを取得
  getAllLinks(): ShortLink[] {
    if (typeof window === 'undefined') return [];

    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
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

    const links = this.getAllLinks();
    links.push(newLink);
    this.saveLinks(links);

    return newLink;
  }

  // 短縮コードからリンクを取得
  getLinkByShortCode(shortCode: string): ShortLink | null {
    const links = this.getAllLinks();
    return links.find(link => link.shortCode === shortCode) || null;
  }

  // クリック数を増加
  incrementClickCount(shortCode: string): void {
    const links = this.getAllLinks();
    const linkIndex = links.findIndex(link => link.shortCode === shortCode);

    if (linkIndex !== -1) {
      links[linkIndex].clickCount++;
      this.saveLinks(links);
    }
  }

  // リンクを削除
  deleteLink(id: string): void {
    const links = this.getAllLinks();
    const filteredLinks = links.filter(link => link.id !== id);
    this.saveLinks(filteredLinks);
  }

  // リンクを更新
  updateLink(id: string, updates: Partial<ShortLink>): ShortLink | null {
    const links = this.getAllLinks();
    const linkIndex = links.findIndex(link => link.id === id);

    if (linkIndex !== -1) {
      links[linkIndex] = { ...links[linkIndex], ...updates };
      this.saveLinks(links);
      return links[linkIndex];
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

  // ローカルストレージに保存
  private saveLinks(links: ShortLink[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
    }
  }
}

export const linkService = new LinkService();
