import { NextResponse } from "next/server";
import { getGarden, getSudokuLeaderboard, submitSudokuRun } from "@/lib/garden";

export const dynamic = "force-dynamic";

const isValidEmail = (value: unknown): value is string =>
  typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const isValidNumber = (value: unknown) => typeof value === "number" && Number.isFinite(value);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limitParam = Number(searchParams.get("limit") ?? "10");
  const limit = Number.isFinite(limitParam) ? limitParam : 10;
  const leaderboard = await getSudokuLeaderboard(limit);
  return NextResponse.json({ ok: true, leaderboard });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const inputEmail = body?.email;
  const elapsedSeconds = body?.elapsedSeconds;
  const wrongAnswers = body?.wrongAnswers;
  const bestStreak = body?.bestStreak;

  if (!isValidNumber(elapsedSeconds) || !isValidNumber(wrongAnswers) || !isValidNumber(bestStreak)) {
    return NextResponse.json({ ok: false, error: "Invalid score payload" }, { status: 400 });
  }

  let email = isValidEmail(inputEmail) ? inputEmail : "";
  if (!email) {
    const garden = await getGarden();
    if (garden.email && isValidEmail(garden.email)) email = garden.email;
  }
  if (!email) {
    return NextResponse.json({ ok: false, error: "Missing email" }, { status: 400 });
  }

  const result = await submitSudokuRun({
    email,
    elapsedSeconds,
    wrongAnswers,
    bestStreak,
  });

  return NextResponse.json({ ok: true, accepted: result.accepted, entry: result.entry });
}
