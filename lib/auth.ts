import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const cookieName = "fz_admin_session";
const sessionDuration = 60 * 60 * 24 * 7;

function signature(value: string): string {
  return createHmac(
    "sha256",
    process.env.SESSION_SECRET ??
      process.env.ADMIN_PASSWORD ??
      "development-secret-change-me",
  )
    .update(value)
    .digest("hex");
}

function validSession(value: string | undefined): boolean {
  if (!value) return false;
  const [expires, suppliedSignature] = value.split(".");
  if (!expires || !suppliedSignature || Number(expires) < Date.now())
    return false;
  const expected = signature(expires);
  const suppliedBuffer = Buffer.from(suppliedSignature);
  const expectedBuffer = Buffer.from(expected);
  return (
    suppliedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(suppliedBuffer, expectedBuffer)
  );
}

export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  return validSession(cookieStore.get(cookieName)?.value);
}

export async function createSession(): Promise<void> {
  const expires = String(Date.now() + sessionDuration * 1000);
  const cookieStore = await cookies();
  cookieStore.set(cookieName, `${expires}.${signature(expires)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sessionDuration,
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(cookieName);
}
