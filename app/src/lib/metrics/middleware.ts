import { NextRequest } from "next/server";
import { httpRequestDuration, httpRequestTotal } from "./prometheus";

export function metricsMiddleware(
  handler: (req: NextRequest) => Promise<Response>
) {
  return async (req: NextRequest): Promise<Response> => {
    const start = Date.now();
    const method = req.method;
    const url = new URL(req.url);
    const route = url.pathname;

    try {
      const response = await handler(req);
      const duration = (Date.now() - start) / 1000;
      const statusCode = response.status;

      httpRequestDuration
        .labels(method, route, statusCode.toString())
        .observe(duration);
      httpRequestTotal.labels(method, route, statusCode.toString()).inc();

      return response;
    } catch (error) {
      const duration = (Date.now() - start) / 1000;
      const statusCode = 500;

      httpRequestDuration
        .labels(method, route, statusCode.toString())
        .observe(duration);
      httpRequestTotal.labels(method, route, statusCode.toString()).inc();

      throw error;
    }
  };
}
