import { NextRequest } from "next/server";
import { SignInService } from "@/lib/auth/services/signin";
import {
  parseJsonBodySafe,
  handleServiceResult,
  handleRouteError,
} from "@/lib/api-helpers";

const service = new SignInService();

export async function POST(req: NextRequest) {
  try {
    const body = await parseJsonBodySafe(req);
    const result = await service.execute(body, req.headers);
    return handleServiceResult(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
