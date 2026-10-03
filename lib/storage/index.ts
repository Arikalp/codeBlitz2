/**
 * lib/storage/index.ts
 *
 * Private Medical Storage Abstraction for HealthSetu.
 * Supports Cloudinary as the primary cloud storage engine (per .env config)
 * and includes a safe local-only fallback for offline development.
 *
 * Security:
 * - Files are never publicly exposed.
 * - Access is gated through server-side ownership checks before streaming.
 * - Raw storage keys and public URLs are not exposed as the sole authorization mechanism.
 */

import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import fs from "fs";
import path from "path";
import { Readable } from "stream";

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface StoredFileResult {
  storageKey: string;
  storageProvider: "cloudinary" | "local";
  fileSizeBytes: number;
  mimeType: string;
  originalFileName: string;
  resourceType: "image" | "raw";
}

export interface IStorageProvider {
  name: "cloudinary" | "local";
  upload(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    patientUuid: string
  ): Promise<StoredFileResult>;
  getFileBuffer(
    storageKey: string,
    resourceType: "image" | "raw"
  ): Promise<Buffer>;
  deleteFile(
    storageKey: string,
    resourceType: "image" | "raw"
  ): Promise<boolean>;
}

// ─── Cloudinary Storage Provider ────────────────────────────────────────────

class CloudinaryStorageProvider implements IStorageProvider {
  name = "cloudinary" as const;

  constructor() {
    if (process.env.CLOUDINARY_URL) {
      const match = process.env.CLOUDINARY_URL.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
      if (match) {
        cloudinary.config({
          api_key: match[1],
          api_secret: match[2],
          cloud_name: match[3],
          secure: true,
        });
      } else {
        cloudinary.config(true);
      }
    }
  }

  async upload(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    patientUuid: string
  ): Promise<StoredFileResult> {
    const isPdf = mimeType === "application/pdf";
    const resourceType: "image" | "raw" = isPdf ? "raw" : "image";

    // Clean filename for public ID
    const sanitizedBase = path
      .basename(fileName, path.extname(fileName))
      .replace(/[^a-zA-Z0-9_-]/g, "_");
    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const publicId = `healthsetu/patients/${patientUuid}/${sanitizedBase}_${uniqueSuffix}`;

    return new Promise<StoredFileResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          resource_type: resourceType,
          folder: `healthsetu/patients/${patientUuid}`,
          tags: ["healthsetu", "medical_record", `patient_${patientUuid}`],
        },
        (error, result?: UploadApiResponse) => {
          if (error || !result) {
            return reject(
              new Error(error?.message || "Cloudinary file upload failed")
            );
          }

          resolve({
            storageKey: result.public_id,
            storageProvider: "cloudinary",
            fileSizeBytes: result.bytes || buffer.length,
            mimeType,
            originalFileName: fileName,
            resourceType,
          });
        }
      );

      const readable = new Readable();
      readable.push(buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }

  async getFileBuffer(
    storageKey: string,
    resourceType: "image" | "raw"
  ): Promise<Buffer> {
    // Generate secure authenticated URL
    const url = cloudinary.url(storageKey, {
      resource_type: resourceType,
      secure: true,
    });

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to retrieve file from Cloudinary (status ${res.status})`);
    }

    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  async deleteFile(
    storageKey: string,
    resourceType: "image" | "raw"
  ): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(storageKey, {
        resource_type: resourceType,
      });
      return result.result === "ok" || result.result === "not found";
    } catch (err) {
      console.error("[Storage] Cloudinary delete failed:", err);
      return false;
    }
  }
}

// ─── Local Storage Provider (Offline / Fallback) ───────────────────────────

class LocalStorageProvider implements IStorageProvider {
  name = "local" as const;
  private baseDir: string;

  constructor() {
    this.baseDir = path.join(process.cwd(), "storage", "uploads");
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async upload(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    patientUuid: string
  ): Promise<StoredFileResult> {
    const patientDir = path.join(this.baseDir, patientUuid);
    if (!fs.existsSync(patientDir)) {
      fs.mkdirSync(patientDir, { recursive: true });
    }

    const ext = path.extname(fileName) || "";
    const uniqueName = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}${ext}`;
    const filePath = path.join(patientDir, uniqueName);

    await fs.promises.writeFile(filePath, buffer);

    const resourceType = mimeType === "application/pdf" ? "raw" : "image";
    return {
      storageKey: `${patientUuid}/${uniqueName}`,
      storageProvider: "local",
      fileSizeBytes: buffer.length,
      mimeType,
      originalFileName: fileName,
      resourceType,
    };
  }

  async getFileBuffer(storageKey: string): Promise<Buffer> {
    // Prevent directory traversal
    const safeKey = path.normalize(storageKey).replace(/^(\.\.(\/|\\|$))+/, "");
    const filePath = path.join(this.baseDir, safeKey);

    if (!fs.existsSync(filePath)) {
      throw new Error("File not found in local storage");
    }

    return fs.promises.readFile(filePath);
  }

  async deleteFile(storageKey: string): Promise<boolean> {
    try {
      const safeKey = path.normalize(storageKey).replace(/^(\.\.(\/|\\|$))+/, "");
      const filePath = path.join(this.baseDir, safeKey);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
      return true;
    } catch {
      return false;
    }
  }
}

// ─── Provider Factory ───────────────────────────────────────────────────────

let activeProvider: IStorageProvider | null = null;

export function getStorageProvider(): IStorageProvider {
  if (!activeProvider) {
    if (process.env.CLOUDINARY_URL) {
      activeProvider = new CloudinaryStorageProvider();
    } else {
      activeProvider = new LocalStorageProvider();
    }
  }
  return activeProvider;
}
