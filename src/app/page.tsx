"use client";

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";

type Starter = "browt" | "pombon" | "gecqua";

interface Votes {
  browt: number;
  pombon: number;
  gecqua: number;
}

const starters: {
  id: Starter;
  name: string;
  type: string;
  description: string;
  image: string;
  typeColor: string;
  typeBg: string;
}[] = [
  {
    id: "browt",
    name: "Browt",
    type: "Grass",
    description: "The Bean Chick Pokemon. A feisty little bird with a sprout-like brow.",
    image: "/starters/browt.jpg",
    typeColor: "text-green-700",
    typeBg: "bg-green-100",
  },
  {
    id: "pombon",
    name: "Pombon",
    type: "Fire",
    description: "The Puppy Pokemon. A fiery Pomeranian with a bonfire spirit.",
    image: "/starters/pombon.jpg",
    typeColor: "text-red-700",
    typeBg: "bg-red-100",
  },
  {
    id: "gecqua",
    name: "Gecqua",
    type: "Water",
    description: "The Water Gecko Pokemon. A cool, aquatic gecko ready to splash.",
    image: "/starters/gecqua.jpg",
    typeColor: "text-blue-700",
    typeBg: "bg-blue-100",
  },
];

export default function Home() {
  const [votes, setVotes] = useState<Votes>({ browt: 0, pombon: 0, gecqua: 0 });
  const [voted, setVoted] = useState<Starter | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  const totalVotes = votes.browt + votes.pombon + votes.gecqua;

  const getLeader = (): Starter | "tie" | null => {
    if (totalVotes === 0) return null;
    const sorted = (Object.entries(votes) as [Starter, number][]).sort(
      (a, b) => b[1] - a[1]
    );
    const topCount = sorted[0][1];
    const tiedLeaders = sorted.filter(([, count]) => count === topCount);
    if (tiedLeaders.length > 1) return "tie";
    return sorted[0][0];
  };

  const leader = getLeader();
  const isTie = leader === "tie";

  const fetchVotes = useCallback(async () => {
    try {
      const res = await fetch("/api/vote");
      const data = await res.json();
      setVotes(data);
    } catch (err) {
      console.error("Failed to fetch votes:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVotes();
    const interval = setInterval(fetchVotes, 10000);
    return () => clearInterval(interval);
  }, [fetchVotes]);

  useEffect(() => {
    const saved = localStorage.getItem("pokemon-vote");
    if (saved && ["browt", "pombon", "gecqua"].includes(saved)) {
      setVoted(saved as Starter);
    }
  }, []);

  async function handleVote(starter: Starter) {
    if (voted || voting) return;
    setVoting(true);

    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ starter }),
      });

      if (res.ok) {
        setVoted(starter);
        localStorage.setItem("pokemon-vote", starter);
        await fetchVotes();
      }
    } catch (err) {
      console.error("Failed to vote:", err);
    } finally {
      setVoting(false);
    }
  }

  function getPercentage(starter: Starter) {
    if (totalVotes === 0) return 0;
    return Math.round((votes[starter] / totalVotes) * 100);
  }

  return (
    <div data-theme={leader} className="min-h-screen transition-all duration-500">
      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-2 text-5xl font-bold tracking-tight">
            Who&apos;s Your Starter?
          </h1>
          <p className="text-lg opacity-70">
            Pokemon Winds &amp; Waves — Gen 10 Starter Vote
          </p>
          <p className="mt-2 text-sm font-medium opacity-50">
            Only the best starter gets to choose the colors
          </p>
          {!loading && leader && (
            <p className="mt-3 text-sm font-medium opacity-60">
              {isTie
                ? "It's a TIE! The starters are battling it out!"
                : `${starters.find((s) => s.id === leader)?.name} is in the lead! The site theme reflects the current winner.`}
            </p>
          )}
        </div>

        {/* Starter Cards */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {starters.map((starter) => {
              const pct = getPercentage(starter.id);
              const isVoted = voted === starter.id;

              return (
                <div
                  key={starter.id}
                  className={`relative overflow-hidden rounded-2xl border-2 bg-white/60 backdrop-blur-sm transition-all duration-300 ${
                    isVoted
                      ? "border-accent shadow-lg shadow-accent-glow/20 scale-[1.02]"
                      : "border-transparent hover:border-accent/30 hover:shadow-md"
                  }`}
                >
                  {/* Image */}
                  <div className="flex items-center justify-center bg-accent-light/50 p-6">
                    <Image
                      src={starter.image}
                      alt={starter.name}
                      width={200}
                      height={200}
                      className="h-48 w-48 object-contain"
                      priority
                    />
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <div className="mb-2 flex items-center justify-between">
                      <h2 className="text-2xl font-bold">{starter.name}</h2>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${starter.typeBg} ${starter.typeColor}`}
                      >
                        {starter.type}
                      </span>
                    </div>
                    <p className="mb-4 text-sm opacity-70">{starter.description}</p>

                    {/* Vote bar */}
                    <div className="mb-3">
                      <div className="mb-1 flex justify-between text-sm font-medium">
                        <span>{votes[starter.id]} votes</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-accent-light">
                        <div
                          className="h-full rounded-full bg-accent transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Vote button */}
                    <button
                      onClick={() => handleVote(starter.id)}
                      disabled={voted !== null || voting}
                      className={`w-full rounded-xl py-3 text-sm font-bold transition-all duration-200 ${
                        isVoted
                          ? "bg-accent text-white"
                          : voted
                            ? "cursor-not-allowed bg-gray-100 text-gray-400"
                            : "bg-accent text-white hover:opacity-90 active:scale-95"
                      }`}
                    >
                      {isVoted ? "Your Pick!" : voted ? "Already Voted" : "I Choose You!"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Total */}
        {!loading && (
          <p className="mt-8 text-center text-sm opacity-50">
            {totalVotes} total vote{totalVotes !== 1 ? "s" : ""} cast
          </p>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-xs opacity-40">
          Pokemon Winds &amp; Waves &copy; Nintendo / Game Freak / The Pokemon Company
        </footer>
      </div>
    </div>
  );
}
