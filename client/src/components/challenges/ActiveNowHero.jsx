import React from "react";
import { Link } from "react-router-dom";

const difficultyLabel = { EASY: "Easy", MEDIUM: "Medium", HARD: "Hard" };

export default function ActiveNowHero({ contest, loading }) {
  if (loading) {
    return (
      <div className="bg-card-dark border border-card-border rounded-lg p-6 md:p-8 relative overflow-hidden min-h-[200px] flex items-center justify-center">
        <span className="text-white/60">Loading active challenge...</span>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="bg-card-dark border border-card-border rounded-lg p-6 md:p-8 relative overflow-hidden min-h-[200px]">
        <div className="flex-1">
          <span className="inline-block px-3 py-1 rounded-full bg-brand-yellow-muted text-brand-yellow text-xs font-medium mb-4">NO ACTIVE CONTEST</span>
          <h2 className="text-2xl font-bold text-white mb-2">No contest running</h2>
          <p className="text-white/40 text-sm max-w-lg mb-4">Check back later or browse Practice challenges.</p>
        </div>
      </div>
    );
  }

  const endTime = new Date(contest.end_time);
  const now = new Date();
  const msLeft = Math.max(0, endTime - now);
  const hours = Math.floor(msLeft / (1000 * 60 * 60));
  const mins = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));
  const timeLeft = `${hours}h ${mins}m left`;
  const firstProblem = contest.problems?.[0];
  const xp = 500;

  return (
    <div className="bg-card-dark border border-card-border rounded-lg p-6 md:p-8 relative overflow-hidden min-h-[200px]">
      <div className="absolute right-0 top-0 w-64 h-64 bg-brand-yellow-muted rounded-full translate-x-1/2 -translate-y-1/2" />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <span className="inline-block px-3 py-1 rounded-full bg-brand-yellow-muted text-brand-yellow text-xs font-medium mb-4">ACTIVE NOW</span>
          <h2 className="text-2xl font-bold text-white mb-2">{contest.name}</h2>
          <p className="text-white/40 text-sm max-w-lg mb-4">
            {firstProblem
              ? `Featured: ${firstProblem.title}. Solve problems and climb the leaderboard.`
              : "Solve challenges and compete with the best."}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
            <span><span className="text-brand-yellow">◆</span> {firstProblem ? difficultyLabel[firstProblem.difficulty] || "Medium" : "Mixed"} Difficulty</span>
            <span>{timeLeft}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <span className="text-brand-yellow font-semibold">{xp} POTENTIAL XP</span>
          <Link to={`/contests/${contest._id}`} className="inline-block px-2.5 py-2.5 bg-brand-yellow text-[--color-bg-dark] font-semibold rounded-sm no-underline transition-colors hover:bg-yellow-300">
            SOLVE NOW #
          </Link>
        </div>
      </div>
    </div>
  );
}
