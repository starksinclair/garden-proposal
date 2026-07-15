import { Redis } from "@upstash/redis";

const redis = new Redis({
  url:
      process.env.UPSTASH_REDIS_REST_URL ??
      process.env.KV_REST_API_URL!,
  token:
      process.env.UPSTASH_REDIS_REST_TOKEN ??
      process.env.KV_REST_API_TOKEN!,
});// reads UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN

export type GardenState = {
  claimed: boolean;
  email?: string;
  claimedAt?: string;
};

const KEY = "garden";
const LEADERBOARD_ZSET_KEY = "sudoku:leaderboard";
const LEADERBOARD_LIMIT_MAX = 25;

export type SudokuRunInput = {
  email: string;
  elapsedSeconds: number;
  wrongAnswers: number;
  bestStreak: number;
};

export type SudokuLeaderboardEntry = {
  email: string;
  score: number;
  elapsedSeconds: number;
  wrongAnswers: number;
  bestStreak: number;
  updatedAt: string;
};

export type SudokuSubmissionResult = {
  accepted: boolean;
  entry: SudokuLeaderboardEntry;
};

const leaderboardEntryKey = (email: string) => `sudoku:leaderboard:entry:${email.toLowerCase()}`;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export async function getGarden(): Promise<GardenState> {
  const state = await redis.get<GardenState>(KEY);
  return state ?? { claimed: false };
}

export async function claimGarden(email: string): Promise<GardenState> {
  const state: GardenState = {
    claimed: true,
    email,
    claimedAt: new Date().toISOString(),
  };
  await redis.set(KEY, state);
  return state;
}

export function calculateSudokuScore(input: Omit<SudokuRunInput, "email">): number {
  const elapsedSeconds = clamp(Math.floor(input.elapsedSeconds), 0, 60 * 60);
  const wrongAnswers = clamp(Math.floor(input.wrongAnswers), 0, 1000);
  const bestStreak = clamp(Math.floor(input.bestStreak), 0, 81);

  const timePenalty = Math.min(60, Math.floor(elapsedSeconds / 6));
  const wrongPenalty = wrongAnswers * 3;
  const streakBonus = Math.min(24, bestStreak * 2);

  return clamp(100 - timePenalty - wrongPenalty + streakBonus, 0, 100);
}

export async function submitSudokuRun(input: SudokuRunInput): Promise<SudokuSubmissionResult> {
  const email = input.email.trim().toLowerCase();
  const entry: SudokuLeaderboardEntry = {
    email,
    score: calculateSudokuScore(input),
    elapsedSeconds: clamp(Math.floor(input.elapsedSeconds), 0, 60 * 60),
    wrongAnswers: clamp(Math.floor(input.wrongAnswers), 0, 1000),
    bestStreak: clamp(Math.floor(input.bestStreak), 0, 81),
    updatedAt: new Date().toISOString(),
  };

  const existingScore = await redis.zscore(LEADERBOARD_ZSET_KEY, email);
  if (typeof existingScore === "number" && existingScore >= entry.score) {
    const existingEntry = await redis.get<SudokuLeaderboardEntry>(leaderboardEntryKey(email));
    if (existingEntry) return { accepted: false, entry: existingEntry };
    return {
      accepted: false,
      entry: {
        ...entry,
        score: Math.floor(existingScore),
      },
    };
  }

  await redis.zadd(LEADERBOARD_ZSET_KEY, { score: entry.score, member: email });
  await redis.set(leaderboardEntryKey(email), entry);

  return { accepted: true, entry };
}

export async function getSudokuLeaderboard(limit = 10): Promise<SudokuLeaderboardEntry[]> {
  const cappedLimit = clamp(Math.floor(limit), 1, LEADERBOARD_LIMIT_MAX);
  const members = await redis.zrange<string[]>(LEADERBOARD_ZSET_KEY, 0, cappedLimit - 1, { rev: true });
  if (!members.length) return [];

  const entries = await Promise.all(
    members.map((member) => redis.get<SudokuLeaderboardEntry>(leaderboardEntryKey(member)))
  );

  return entries.filter((entry): entry is SudokuLeaderboardEntry => Boolean(entry));
}
