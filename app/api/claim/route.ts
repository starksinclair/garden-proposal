import { NextResponse } from "next/server";
import { getGarden, claimGarden } from "@/lib/garden";
import { sendYesEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({}));

  const garden = await getGarden();
  if (garden.claimed) {
    // replays never re-claim or re-send the email
    return NextResponse.json({ ok: true, alreadyClaimed: true });
  }

  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Missing email" }, { status: 400 });
  }

  await claimGarden(email);
  const emailResult = await sendYesEmail(email);

  return NextResponse.json({ ok: true, email: emailResult });
}
