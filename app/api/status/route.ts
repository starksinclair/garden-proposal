import { NextResponse } from "next/server";
import { getGarden } from "@/lib/garden";

export const dynamic = "force-dynamic";

export async function GET() {
  const garden = await getGarden();
  // never leak her email to the client — only the claimed flag
  return NextResponse.json({ claimed: garden.claimed });
}
