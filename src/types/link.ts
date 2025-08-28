export interface ShortLink {
  id: string;
  shortCode: string;
  originalUrl: string;
  createdAt: string;
  clickCount: number;
  title?: string;
}

export interface CreateLinkRequest {
  originalUrl: string;
  title?: string;
}
