import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import api from "../api/client";
import Navbar from "../layout/Navbar";
import "../styles/ContestsListPage.css";

export default function ContestsListPage() {
  const { isAuthenticated } = useContext(Context);
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const { data } = await api.get("/contests");
        setContests(data.contests || []);
      } catch {
        setContests([]);
      } finally {
        setLoading(false);
      }
    };
    fetchContests();
  }, []);

  if (!isAuthenticated) return <Navigate to="/auth" />;

  return (
    <div className="contests-list-page">
      <Navbar />
      <main className="contests-list-page__main">
        <h1 className="contests-list-page__title">Contests</h1>
        {loading ? (
          <p className="contests-list-page__empty">Loading contests...</p>
        ) : contests.length === 0 ? (
          <p className="contests-list-page__empty">No contests yet. Create one via API or seed script.</p>
        ) : (
          <ul className="contests-list-page__list">
            {contests.map((c) => (
              <li key={c._id} className="contests-list-page__item">
                <Link to={`/contests/${c._id}`} className="contests-list-page__link">
                  <h2>{c.name}</h2>
                  <p>
                    {new Date(c.start_time).toLocaleString()} — {new Date(c.end_time).toLocaleString()}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
