import React from "react";
import "./LeaderboardTable.css";

export default function LeaderboardTable({ leaderboard }) {
  return (
    <div className="leaderboard-table-wrap">
      <h2 className="leaderboard-table__title">Leaderboard</h2>
      <div className="leaderboard-table">
        <table className="leaderboard-table__table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Solved</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.length === 0 ? (
              <tr>
                <td colSpan={3} className="leaderboard-table__empty">
                  No submissions yet.
                </td>
              </tr>
            ) : (
              leaderboard.map((r) => (
                <tr key={r.rank}>
                  <td>#{r.rank}</td>
                  <td>{r.name}</td>
                  <td className="leaderboard-table__solved">{r.solvedCount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
