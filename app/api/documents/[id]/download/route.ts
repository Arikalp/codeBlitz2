/**
 * app/api/documents/[id]/download/route.ts
 *
 * GET /api/documents/[id]/download
 *
 * Secure file download endpoint.
 *
 * Security:
 * - Requires active session.
 * - Verifies patient ownership before retrieving file buffer from private storage.
 * - Returns stream with Content-Disposition: attachment.
 * - Enforces Cache-Control: private, no-store.
 */

import { NextRequest } from "next/server";
import { requireSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { getStorageProvider } from "@/lib/storage";
import { apiError, apiInternalError } from "@/lib/api-response";
import { Document } from "@/models";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireSession();

    const { id } = await params;
    await connectToDatabase();

    const doc = await Document.findOne({
      _id: id,
      deletedAt: null,
    }).lean();

    if (!doc) {
      return apiError("Document not found", 404);
    }

    // Access control: Patient owner or authorized medical practitioner
    const isPatientOwner = session.patientUuid && doc.patientUuid === session.patientUuid;
    const isAuthorizedDoctor = session.role === "doctor" || session.role === "facility_admin";

    if (!isPatientOwner && !isAuthorizedDoctor) {
      return apiError("Access denied: You do not have permission to download this document", 403);
    }

    const storageProvider = getStorageProvider();
    const isPdf = doc.mimeType === "application/pdf";
    const resourceType = isPdf ? "raw" : "image";

    const buffer = await storageProvider.getFileBuffer(doc.storageKey, resourceType);

    // Sanitize filename for header
    const safeName = doc.originalFileName.replace(/["\r\n]/g, "");

    return new Response(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": doc.mimeType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(safeName)}"`,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "private, no-store, max-age=0, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return apiInternalError(err);
  }
}
