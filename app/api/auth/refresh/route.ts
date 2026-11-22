import { createSession, isAdmin } from "@/lib/auth";

export async function POST() {
  if (!(await isAdmin()))
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  await createSession();
  return Response.json({ success: true });
}
