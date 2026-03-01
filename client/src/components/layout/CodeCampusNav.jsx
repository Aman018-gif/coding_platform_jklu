import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./CodeCampusNav.css";

const navLinks = [
  { to: "/dashboard", label: "Challenges" },
  { to: "/practice", label: "Practice" },
  { to: "/contests", label: "Contests" },
];

export default function CodeCampusNav() {
  const location = useLocation();
  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).toUpperCase().replace(/ /g, "-");

  return (
    <header className="codecampus-nav">
      <div className="codecampus-nav__inner">
        <div className="codecampus-nav__row">
          <Link to="/dashboard" className="codecampus-nav__logo">
            <span className="codecampus-nav__logo-icon" />
            CODECAMPUS
          </Link>
          <nav className="codecampus-nav__links">
            {navLinks.map(({ to, label }) => {
              const active = to === "/dashboard" ? location.pathname === "/" || location.pathname === "/dashboard" : location.pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`codecampus-nav__link ${active ? "codecampus-nav__link--active" : ""}`}
                >
                  {label}
                </Link>
              );
            })}
            <span className="codecampus-nav__date">{today}</span>
            <button type="button" className="codecampus-nav__profile" aria-label="Profile">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
