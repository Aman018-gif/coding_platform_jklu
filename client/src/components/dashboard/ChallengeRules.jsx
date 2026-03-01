import React from "react";
import "./ChallengeRules.css";

const rules = [
  { title: "No Plagiarism", text: "Your code is checked against 10M+ solutions. Originality is mandatory." },
  { title: "Time Limits Apply", text: "Most challenges have a 2-hour window once started." },
  { title: "Clean Code Standards", text: "Bonus XP for readability and adherence to language-specific best practices." },
];

export default function ChallengeRules() {
  return (
    <div className="challenge-rules">
      <h3 className="challenge-rules__title">
        <span>🏆</span>
        Challenge Rules
      </h3>
      <ul className="challenge-rules__list">
        {rules.map((r) => (
          <li key={r.title}>
            <span>{r.title}:</span>{" "}
            <span>{r.text}</span>
          </li>
        ))}
      </ul>
      <p className="challenge-rules__footer">TRUSTED BY 500K+ DEVS</p>
    </div>
  );
}
