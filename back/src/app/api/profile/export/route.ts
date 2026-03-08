import { NextRequest, NextResponse } from "next/server";
import { container } from "@/lib/di/container";
import {
  getAuthenticatedSession,
  handleRouteError,
} from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedSession(req);
    if (!authResult.ok) {
      return authResult.response;
    }
    const { userId } = authResult;

    const result = await container.exportDataService.exportUserData(userId);
    
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status ?? 400 }
      );
    }

    const data = result.data;
    const jsonString = JSON.stringify(data, null, 2);
    
    const response = new NextResponse(jsonString, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="learnsup-data-export-${userId}-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });

    return response;
  } catch (error) {
    return handleRouteError(error);
  }
}
