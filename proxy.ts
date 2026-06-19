import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "lander_session";
const PUBLIC_PATHS = ["/login", "/api/auth", "/"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const session = request.cookies.get(SESSION_COOKIE);
  const appPassword = process.env.APP_PASSWORD;

  if (!appPassword) return NextResponse.next();

  const expectedValue = btoa(`authenticated:${appPassword}`);
  const isValid = session?.value === expectedValue;

  if (!isValid) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
