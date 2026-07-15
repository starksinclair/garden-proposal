import { NextResponse } from "next/server";
import { sendYesEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({}));

  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Missing email" }, { status: 400 });
  }

  const emailResult = await sendYesEmail(email);
  if (emailResult && typeof emailResult === "object" && "ok" in emailResult && emailResult.ok === false) {
    return NextResponse.json({ ok: false, email: emailResult }, { status: 502 });
  }

  return NextResponse.json({ ok: true, email: emailResult });
}
