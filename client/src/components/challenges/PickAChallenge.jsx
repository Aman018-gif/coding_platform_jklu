import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function PickAChallenge({ problems = [], loading }) {
  const [sort, setSort] = useState("popular");
  const displayList = problems.slice(0, 8);

  if (loading) {
    return (
      <div className="pick-challenge">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-semibold">Pick a Challenge</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card-dark border border-card-border rounded-sm p-4 h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pick-challenge">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-semibold">Pick a Challenge</h3>
        <div className="flex gap-2 text-sm">
          <button
            type="button"
            onClick={() => setSort("popular")}
            className={`px-3 py-1 rounded-sm bg-transparent border-none cursor-pointer transition-colors ${sort === "popular" ? "text-brand-yellow font-medium" : "text-white/60 hover:text-white/80"}`}
          >
            Most Popular
          </button>
          <button
            type="button"
            onClick={() => setSort("newest")}
            className={`px-3 py-1 rounded-sm bg-transparent border-none cursor-pointer transition-colors ${sort === "newest" ? "text-brand-yellow font-medium" : "text-white/60 hover:text-white/80"}`}
          >
            Newest
          </button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {displayList.map((p) => (
          <Link key={p._id} to={`/problems/${p._id}`} className="block bg-card-dark border border-card-border rounded-sm p-4 no-underline text-inherit transition-colors hover:border-white/20">
            <span className={`inline-block px-2 py-0.5 rounded-sm text-xs font-medium mb-2 ${(p.difficulty || "medium").toLowerCase() === "easy" ? "bg-emerald-400/20 text-emerald-400" : (p.difficulty || "medium").toLowerCase() === "hard" ? "bg-red-400/20 text-red-400" : "bg-brand-yellow-muted text-brand-yellow"}`}>
              {p.difficulty || "MEDIUM"}
            </span>
            <p className="text-white/60 text-sm line-clamp-2 mb-3">{p.description || p.title}</p>
            <div className="flex items-center justify-between text-xs text-white/60">
              <span>+{p.difficulty === "HARD" ? "500" : "1k"}</span>
              <span className="text-brand-yellow">Start →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
