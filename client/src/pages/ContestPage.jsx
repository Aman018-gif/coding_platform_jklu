import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useContext } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import api from "../api/client";
import Navbar from "../layout/Navbar";
import ContestProblemCard from "../components/contest/ContestProblemCard";
import ContestSidebar from "../components/contest/ContestSidebar";
import LeaderboardTable from "../components/contest/LeaderboardTable";
import "../styles/ContestPage.css";

export default function ContestPage() {
  const { id } = useParams();
  const { isAuthenticated } = useContext(Context);
  const [contest, setContest] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("problems");

  useEffect(() => {
    const fetchContest = async () => {
      try {
        const { data } = await api.get(`/contests/${id}`);
        setContest(data.contest);
      } catch {
        setContest(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchContest();
  }, [id]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await api.get(`/contests/${id}/leaderboard`);
        setLeaderboard(data.leaderboard || []);
      } catch {
        setLeaderboard([]);
      }
    };
    if (id) fetchLeaderboard();
  }, [id]);

  if (!isAuthenticated) return <Navigate to="/auth" />;
  if (loading && !contest) return <div className="contest-page__loading">Loading...</div>;
  if (!contest) return <div className="contest-page__error">Contest not found.</div>;

  const problems = contest.problems || [];

  return (
    <div className="contest-page">
      <Navbar />
      <main className="contest-page__main">
        <h1 className="contest-page__title">{contest.name}</h1>

        <div className="contest-page__tabs">
          <button
            type="button"
            onClick={() => setTab("problems")}
            className={`contest-page__tab ${tab === "problems" ? "contest-page__tab--active" : ""}`}
          >
            Problems
          </button>
          <button
            type="button"
            onClick={() => setTab("leaderboard")}
            className={`contest-page__tab ${tab === "leaderboard" ? "contest-page__tab--active" : ""}`}
          >
            🏆 Live Leaderboard
          </button>
          <span className="contest-page__tab contest-page__tab--disabled">Submissions</span>
        </div>

        {tab === "leaderboard" && <LeaderboardTable leaderboard={leaderboard} />}

        {tab === "problems" && (
          <div className="contest-page__grid">
            <div className="contest-page__problems-col">
              {problems.map((p, idx) => (
                <ContestProblemCard
                  key={p._id}
                  problem={p}
                  index={idx}
                  contestId={id}
                />
              ))}
            </div>
            <div>
              <ContestSidebar contest={contest} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
