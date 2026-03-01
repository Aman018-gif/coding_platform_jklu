import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import api from "../api/client";
import Navbar from "../layout/Navbar";
import "../styles/PracticePage.css";

export default function PracticePage() {
  const { isAuthenticated } = useContext(Context);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await api.get("/problems");
        setProblems((data.problems || []).filter((p) => !p.contest_id));
      } catch {
        setProblems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  if (!isAuthenticated) return <Navigate to="/auth" />;

  return (
    <div className="practice-page">
      <Navbar />
      <main className="practice-page__main">
        <h1 className="practice-page__title">Practice</h1>
        {loading ? (
          <p className="practice-page__empty">Loading...</p>
        ) : problems.length === 0 ? (
          <p className="practice-page__empty">No practice problems. Try Challenges or Contests.</p>
        ) : (
          <ul className="practice-page__list">
            {problems.map((p) => (
              <li key={p._id} className="practice-page__item">
                <Link to={`/problems/${p._id}`} className="practice-page__link">
                  <span className={`practice-page__badge practice-page__badge--${(p.difficulty || "medium").toLowerCase()}`}>
                    {p.difficulty || "MEDIUM"}
                  </span>
                  <h2>{p.title}</h2>
                  <p>{p.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
