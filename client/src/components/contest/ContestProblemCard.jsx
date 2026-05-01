import React from "react";
import { Link } from "react-router-dom";

const difficultyDiamonds = { EASY: 1, MEDIUM: 2, HARD: 3 };

export default function ContestProblemCard({ problem, index, contestId, contestName }) {
  const diamonds = difficultyDiamonds[problem.difficulty] ?? 2;

  return (
    <div className="group relative bg-card-dark border border-white/5 hover:border-brand-yellow/50 transition-all p-6 rounded-xl overflow-hidden">
      <div className="absolute top-0 right-0 p-4">
        <span className="text-brand-yellow">
          {"◆ ".repeat(diamonds)}
        </span>
      </div>
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-brand-yellow text-xs font-bold tracking-widest mb-1 uppercase">{problem.category || "Algorithms"}</p>
          <h3 className="text-2xl font-bold text-white group-hover:text-brand-yellow transition-colors">PROBLEM {index + 1}: {problem.title}</h3>
        </div>
        {/* <p className="text-slate-400 text-sm max-w-2xl">{problem.description}</p> */}
        <div className="flex items-center gap-6 mt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium tracking-wide uppercase">Time: {problem.time_limit || 1}s</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium tracking-wide uppercase">Memory: {problem.memory_limit || 256}MB</span>
          </div>
          <div className="ml-auto">
            <Link
              to={`/problems/${problem._id}${contestId ? `?contest=${contestId}${contestName ? `&cname=${encodeURIComponent(contestName)}` : ""}` : ""}`}
              className="px-4 py-2 bg-white/5 hover:bg-brand-yellow hover:text-black text-white text-xs font-bold rounded-lg border border-white/10 transition-colors uppercase"
            >
              Solve Problem
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
