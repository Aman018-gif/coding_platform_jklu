import React from "react";
import { Link } from "react-router-dom";
import "./ActiveNowHero.css";

const difficultyLabel = { EASY: "Easy", MEDIUM: "Medium", HARD: "Hard" };

export default function ActiveNowHero({ contest, loading }) {
  if (loading) {
    return (
      <div className="active-now-hero active-now-hero--loading">
        <span className="active-now-hero__loading-text">Loading active challenge...</span>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="active-now-hero">
        <div className="active-now-hero__content">
          <span className="active-now-hero__badge">NO ACTIVE CONTEST</span>
          <h2 className="active-now-hero__title">No contest running</h2>
          <p className="active-now-hero__desc">Check back later or browse Practice challenges.</p>
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
    <div className="active-now-hero">
      <div className="active-now-hero__bg" />
      <div className="active-now-hero__inner">
        <div className="active-now-hero__content">
          <span className="active-now-hero__badge">ACTIVE NOW</span>
          <h2 className="active-now-hero__title">{contest.name}</h2>
          <p className="active-now-hero__desc">
            {firstProblem
              ? `Featured: ${firstProblem.title}. Solve problems and climb the leaderboard.`
              : "Solve challenges and compete with the best."}
          </p>
          <div className="active-now-hero__meta">
            <span><span className="diamond">◆</span> {firstProblem ? difficultyLabel[firstProblem.difficulty] || "Medium" : "Mixed"} Difficulty</span>
            <span>{timeLeft}</span>
          </div>
        </div>
        <div className="active-now-hero__actions">
          <span className="active-now-hero__xp">{xp} POTENTIAL XP</span>
          <Link to={`/contests/${contest._id}`} className="active-now-hero__button">
            SOLVE NOW #
          </Link>
        </div>
      </div>
    </div>
  );
}
