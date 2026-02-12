import { NextRequest, NextResponse } from "next/server";

export function metricsMiddleware(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    // Metrics middleware disabled for production builds
    // TODO: Re-enable after resolving prom-client build-time issues
    return handler(req);
  };
}
