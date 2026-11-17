import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  const { password } = (await request.json()) as { password?: string };
  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!configuredPassword) {
    return Response.json(
      { error: "Set ADMIN_PASSWORD to enable admin access." },
      { status: 503 },
    );
  }
  if (!password || password !== configuredPassword) {
    return Response.json(
      { error: "That password didn’t match. Try again." },
      { status: 401 },
    );
  }
  await createSession();
  return Response.json({ success: true });
}
