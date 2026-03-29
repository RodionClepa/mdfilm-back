import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

export interface SavePosterInput {
  buffer: Buffer;
  mimetype: string;
  size: number;
}

export interface SavePosterResult {
  filename: string;
  url: string;
}

export class PosterStorageService {
  private readonly uploadsDir: string;
  private readonly postersDir: string;
  private readonly publicPostersBasePath: string;
  private readonly maxBytes: number;

  constructor({
    uploadsDir,
    publicPostersBasePath = '/uploads/posters',
    maxBytes = 5 * 1024 * 1024,
  }: {
    uploadsDir: string;
    publicPostersBasePath?: string;
    maxBytes?: number;
  }) {
    this.uploadsDir = uploadsDir;
    this.postersDir = path.join(uploadsDir, 'posters');
    this.publicPostersBasePath = publicPostersBasePath;
    this.maxBytes = maxBytes;
  }

  private async ensureDirs() {
    await fs.mkdir(this.postersDir, { recursive: true });
  }

  private extFromMime(mimetype: string) {
    const m = String(mimetype || '').toLowerCase();
    if (m === 'image/jpeg' || m === 'image/jpg') return 'jpg';
    if (m === 'image/png') return 'png';
    if (m === 'image/webp') return 'webp';
    return null;
  }

  async savePoster(input: SavePosterInput, baseUrl: string): Promise<SavePosterResult> {
    if (!input?.buffer?.length) throw new Error('Poster file is required.');
    if (input.size > this.maxBytes) throw new Error(`Poster file is too large (max ${this.maxBytes} bytes).`);

    const ext = this.extFromMime(input.mimetype);
    if (!ext) throw new Error(`Unsupported poster mime type '${input.mimetype}'. Use jpg/png/webp.`);

    await this.ensureDirs();

    const filename = `${crypto.randomUUID()}.${ext}`;
    const filePath = path.join(this.postersDir, filename);

    await fs.writeFile(filePath, input.buffer);

    const url = `${baseUrl}${this.publicPostersBasePath}/${filename}`;
    return { filename, url };
  }

  async deleteIfLocalPosterUrl(url: string) {
    if (!url) return;

    const idx = url.indexOf(this.publicPostersBasePath + '/');
    if (idx < 0) return;

    const filename = url.slice(idx + (this.publicPostersBasePath + '/').length);
    if (!filename || filename.includes('/') || filename.includes('\\')) return;

    const filePath = path.join(this.postersDir, filename);

    try {
      await fs.unlink(filePath);
    } catch {
      // ignore
    }
  }
}

export const posterStorageService = new PosterStorageService({
  uploadsDir: path.resolve(process.cwd(), 'uploads'),
});
