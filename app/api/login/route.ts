import { NextResponse } from "next/server";
import { checkPassword } from "@/lib/password";
import { getGarden } from "@/lib/garden";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({}));

  if (typeof password !== "string" || !checkPassword(password)) {
    return NextResponse.json(
      { ok: false, error: "That key doesn't open this garden yet... 🌱 (hint: a very special birthday)" },
      { status: 401 }
    );
  }

  const garden = await getGarden();

  if (!garden.claimed) {
    // unclaimed: we need her email so the garden can write to her later
    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { ok: false, error: "The garden needs your email before it lets you in 🍃" },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: true, claimed: false, email });
  }

  // already claimed: password alone replants the memory
  return NextResponse.json({ ok: true, claimed: true });
}
