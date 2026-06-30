import { auth } from "@/auth";
import { SignJWT } from "jose";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET || "super-secret-internal-key-for-dev";

export async function fetchServerAPI(path: string, options: RequestInit = {}) {
  const session = await auth();
  const headers = new Headers(options.headers);
  
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

  return fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers,
  });
}
