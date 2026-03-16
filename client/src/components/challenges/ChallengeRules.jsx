import React from "react";

const rules = [
  { title: "No Plagiarism", text: "Your code is checked against 10M+ solutions. Originality is mandatory." },
  { title: "Time Limits Apply", text: "Most challenges have a 2-hour window once started." },
  { title: "Clean Code Standards", text: "Bonus XP for readability and adherence to language-specific best practices." },
];

export default function ChallengeRules() {
  return (
    <div className="bg-card-dark border border-card-border rounded-lg p-5">
      <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
        <span>🏆</span>
        Challenge Rules
      </h3>
      <ul className="list-none">
        {rules.map((r) => (
          <li key={r.title} className="mb-3 text-sm">
            <span className="text-brand-yellow font-medium">{r.title}:</span>{" "}
            <span className="text-white/40">{r.text}</span>
          </li>
        ))}
      </ul>
      <p className="text-white/60 text-xs mt-4">TRUSTED BY 500K+ DEVS</p>
    </div>
  );
}
