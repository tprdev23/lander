import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "lander_session";
const APP_PASSWORD = process.env.APP_PASSWORD!;

export function createSessionValue(): string {
  return Buffer.from(`authenticated:${APP_PASSWORD}`).toString("base64");
}

export function isValidSession(value: string): boolean {
  try {
    return value === createSessionValue();
  } catch {
    return false;
  }
}

export async function getSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  if (!session) return false;
  return isValidSession(session.value);
}

export async function requireAuth() {
  const valid = await getSession();
  if (!valid) redirect("/login");
}

export { SESSION_COOKIE };