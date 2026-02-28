import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";

const VALID_STARTERS = ["browt", "pombon", "gecqua"] as const;

export async function GET() {
  const [browt, pombon, gecqua] = await Promise.all([
    redis.get<number>("votes:browt"),
    redis.get<number>("votes:pombon"),
    redis.get<number>("votes:gecqua"),
  ]);

  return NextResponse.json({
    browt: browt ?? 0,
    pombon: pombon ?? 0,
    gecqua: gecqua ?? 0,
  });
}

export async function POST(request: NextRequest) {
  const { starter } = await request.json();

  if (!VALID_STARTERS.includes(starter)) {
    return NextResponse.json({ error: "Invalid starter" }, { status: 400 });
  }

  const newCount = await redis.incr(`votes:${starter}`);

  return NextResponse.json({ starter, votes: newCount });
}
