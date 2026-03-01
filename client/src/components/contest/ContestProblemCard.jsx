import React from "react";
import { Link } from "react-router-dom";
import "./ContestProblemCard.css";

const difficultyDiamonds = { EASY: 1, MEDIUM: 2, HARD: 3 };

export default function ContestProblemCard({ problem, index, contestId }) {
  const diamonds = difficultyDiamonds[problem.difficulty] ?? 2;

  return (
    <div className="contest-problem-card">
      <div className="contest-problem-card__body">
        <span className="contest-problem-card__category">{problem.category || "ALGORITHMS"}</span>
        <h3 className="contest-problem-card__title">PROBLEM {index + 1}: {problem.title}</h3>
        <p className="contest-problem-card__description">{problem.description}</p>
        <div className="contest-problem-card__meta">
          <span>TIME: {problem.time_limit || 1}S</span>
          <span>MEMORY: {problem.memory_limit || 256}MB</span>
        </div>
      </div>
      <div className="contest-problem-card__actions">
        <span className="contest-problem-card__diamonds">
          {"◆".repeat(diamonds)}
        </span>
        <Link
          to={`/problems/${problem._id}${contestId ? `?contest=${contestId}` : ""}`}
          className="contest-problem-card__button"
        >
          SOLVE CHALLENGE
        </Link>
      </div>
    </div>
  );
}
