import { NextRequest, NextResponse } from "next/server";
import { container } from "@/lib/di/container";
import { authRateLimit } from "@/lib/rate-limit";
import {
  getAuthenticatedSession,
  handleRouteError,
  applyRateLimit,
} from "@/lib/api-helpers";

/**
 * GET /api/profile/export
 * Handles two actions:
 * 1. Requesting an export (authenticated): Generates a token and sends an email.
 * 2. Downloading the export (token-based): Verifies the token and returns the JSON file.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    // Case 1: Downloading via token (one-time link)
    if (token) {
      const rateLimitResult = await applyRateLimit(
        authRateLimit,
        `download:${token}`,
      );
      if (!rateLimitResult.ok) {
        return rateLimitResult.response;
      }

      const verifyResult =
        await container.exportDataService.verifyExportToken(token);
      if (!verifyResult.ok) {
        return NextResponse.json(
          { error: verifyResult.error },
          { status: verifyResult.status ?? 401 },
        );
      }

      const { userId } = verifyResult.data;
      const exportResult =
        await container.exportDataService.exportUserData(userId);

      if (!exportResult.ok) {
        return NextResponse.json(
          { error: exportResult.error },
          { status: exportResult.status ?? 400 },
        );
      }

      const data = exportResult.data;
      const jsonString = JSON.stringify(data, null, 2);

      return new NextResponse(jsonString, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="learnsup-data-export-${userId}-${new Date().toISOString().split("T")[0]}.json"`,
        },
      });
    }

    // Case 2: Requesting the export (must be authenticated)
    const authResult = await getAuthenticatedSession(req);
    if (!authResult.ok) {
      return authResult.response;
    }
    const { userId } = authResult;

    // Apply rate limit for requesting exports (spam protection)
    const rateLimitResult = await applyRateLimit(authRateLimit, userId);
    if (!rateLimitResult.ok) {
      return rateLimitResult.response;
    }

    // Generate token
    const tokenResult =
      await container.exportDataService.createExportToken(userId);
    if (!tokenResult.ok) {
      return NextResponse.json(
        { error: tokenResult.error },
        { status: tokenResult.status ?? 500 },
      );
    }

    const { token: exportToken, expiresAt } = tokenResult.data;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
    const downloadUrl = `${baseUrl}/api/profile/export?token=${exportToken}`;
    const formattedExpiresAt = expiresAt.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Send email
    const emailResult = await container.exportDataService.sendExportEmail(
      userId,
      downloadUrl,
      formattedExpiresAt,
    );

    if (!emailResult.ok) {
      return NextResponse.json(
        { error: emailResult.error },
        { status: emailResult.status ?? 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Un email contenant le lien de téléchargement vous a été envoyé.",
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
