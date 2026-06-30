import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { SignJWT } from "jose";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET || "super-secret-internal-key-for-dev";

const PUBLIC_ROUTES = [
  "/api/health",
  "/api/version",
  "/api/status",
  "/api/runtimes",
  "/api/problems/import" // Wait, problem import might be public or protected? Let's assume protected for now unless it's strictly public. Wait, the extension needs to import problems. The extension will share the session! So it can be protected.
];

const isPublicRoute = (pathname: string) => {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
};

async function handleRequest(request: NextRequest, { params }: { params: { proxy: string[] } }) {
  const pathname = new URL(request.url).pathname;
  
  // Validate NextAuth session
  const session = await auth();
  
  if (!session?.user && !isPublicRoute(pathname)) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const headers = new Headers(request.headers);
  headers.delete("host"); // Let the fetch client handle the host
  
  // Generate Internal JWT
  if (session?.user) {
    const secret = new TextEncoder().encode(INTERNAL_API_SECRET);
    const jwt = await new SignJWT({ 
      userId: session.user.id, 
      email: session.user.email 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('5m')
      .sign(secret);
      
    headers.set("Authorization", `Bearer ${jwt}`);
  }

  // Construct target URL
  const targetUrl = `${BACKEND_URL}${pathname}${new URL(request.url).search}`;
  
  try {
    const init: RequestInit = {
      method: request.method,
      headers,
      // Only attach body if method is not GET/HEAD
      body: ["GET", "HEAD"].includes(request.method) ? undefined : await request.blob(),
      redirect: "manual",
      duplex: "half"
    };

    const response = await fetch(targetUrl, init as any);

    // Stream the response back to the client
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set("access-control-allow-origin", "*");
    
    // Create new response
    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: "Internal Gateway Error" }, { status: 500 });
  }
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const DELETE = handleRequest;
export const PATCH = handleRequest;
