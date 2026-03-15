import { NextRequest, NextResponse } from "next/server";

const getBackendBaseUrl = () => {
  const configured = process.env.RUNTIME_API_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return "http://localhost:4500";
};

const buildTargetUrl = (request: NextRequest, path: string[]) => {
  const encodedPath = path.map((segment) => encodeURIComponent(segment)).join("/");
  const search = request.nextUrl.search || "";
  return `${getBackendBaseUrl()}/api/${encodedPath}${search}`;
};

const proxyRequest = async (request: NextRequest, path: string[]) => {
  const targetUrl = buildTargetUrl(request, path);
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");

  const method = request.method.toUpperCase();
  const canHaveBody = method !== "GET" && method !== "HEAD";

  const upstreamResponse = await fetch(targetUrl, {
    method,
    headers,
    body: canHaveBody ? request.body : undefined,
    redirect: "manual",
    cache: "no-store",
  });

  const responseHeaders = new Headers(upstreamResponse.headers);
  return new NextResponse(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
};

type Params = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, { params }: Params) {
  return proxyRequest(request, (await params).path);
}

export async function POST(request: NextRequest, { params }: Params) {
  return proxyRequest(request, (await params).path);
}

export async function PUT(request: NextRequest, { params }: Params) {
  return proxyRequest(request, (await params).path);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  return proxyRequest(request, (await params).path);
}

export async function DELETE(request: NextRequest, { params }: Params) {
  return proxyRequest(request, (await params).path);
}

export async function OPTIONS(request: NextRequest, { params }: Params) {
  return proxyRequest(request, (await params).path);
}
