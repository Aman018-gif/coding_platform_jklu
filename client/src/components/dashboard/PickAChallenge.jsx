import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./PickAChallenge.css";

export default function PickAChallenge({ problems = [], loading }) {
  const [sort, setSort] = useState("popular");
  const displayList = problems.slice(0, 8);

  if (loading) {
    return (
      <div className="pick-challenge">
        <div className="pick-challenge__head">
          <h3 className="pick-challenge__title">Pick a Challenge</h3>
        </div>
        <div className="pick-challenge__grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="pick-challenge__skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pick-challenge">
      <div className="pick-challenge__head">
        <h3 className="pick-challenge__title">Pick a Challenge</h3>
        <div className="pick-challenge__tabs">
          <button
            type="button"
            onClick={() => setSort("popular")}
            className={`pick-challenge__tab ${sort === "popular" ? "pick-challenge__tab--active" : ""}`}
          >
            Most Popular
          </button>
          <button
            type="button"
            onClick={() => setSort("newest")}
            className={`pick-challenge__tab ${sort === "newest" ? "pick-challenge__tab--active" : ""}`}
          >
            Newest
          </button>
        </div>
      </div>
      <div className="pick-challenge__grid">
        {displayList.map((p) => (
          <Link key={p._id} to={`/problems/${p._id}`} className="pick-challenge__card">
            <span className={`pick-challenge__badge pick-challenge__badge--${(p.difficulty || "medium").toLowerCase()}`}>
              {p.difficulty || "MEDIUM"}
            </span>
            <p className="pick-challenge__desc">{p.description || p.title}</p>
            <div className="pick-challenge__footer">
              <span>+{p.difficulty === "HARD" ? "500" : "1k"}</span>
              <span className="pick-challenge__start">Start →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
