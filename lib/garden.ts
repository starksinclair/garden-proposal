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
