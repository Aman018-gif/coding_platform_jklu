import React from "react";

export default function LeaderboardTable({ leaderboard, hideHeader = false }) {
  return (
    <div className="mb-6">
      {!hideHeader && <h2 className="text-xl font-bold text-white mb-4">Leaderboard</h2>}
      <div className="bg-card-dark border border-white/5 rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-slate-400 font-medium text-sm px-8 py-3">Rank</th>
              <th className="text-slate-400 font-medium text-sm px-8 py-3">Name</th>
              <th className="text-slate-400 font-medium text-sm px-8 py-3">Solved</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-slate-500 text-center p-4">
                  No submissions yet.
                </td>
              </tr>
            ) : (
              leaderboard.map((r) => (
                <tr key={r.rank} className="group hover:bg-white/[0.02] transition-colors border-b border-white/10">
                  <td className="text-brand-yellow font-bold px-8 py-3">#{r.rank}</td>
                  <td className="text-white font-bold px-8 py-3">{r.name}</td>
                  <td className="text-white font-bold px-8 py-3">{r.solvedCount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
