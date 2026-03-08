import React, { useEffect, useState, useContext } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Context } from "../main";
import api from "../api/client";
import Navbar from "../layout/Navbar";
import ContestProblemCard from "../components/contest/ContestProblemCard";
import ContestSidebar from "../components/contest/ContestSidebar";
import LeaderboardTable from "../components/contest/LeaderboardTable";
import Submissions from "../components/contest/submissions"; // 1. Import the component
import "../styles/ContestPage.css";

export default function ContestPage() {
  const { id } = useParams();
  const { isAuthenticated } = useContext(Context);
  const [contest, setContest] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [submissions, setSubmissions] = useState([]); // 2. State for submissions
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("problems");

  // Fetch Contest Details
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

  // Fetch Leaderboard
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await api.get(`/contests/${id}/leaderboard`);
        setLeaderboard(data.leaderboard || []);
      } catch {
        setLeaderboard([]);
      }
    };
    if (id && tab === "leaderboard") fetchLeaderboard(); // Optimized: Fetch only when tab is active
  }, [id, tab]);

  // 3. Fetch Submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const { data } = await api.get(`/contests/${id}/submissions`);
        setSubmissions(data.submissions || []);
      } catch {
        setSubmissions([]);
      }
    };
    if (id && tab === "submissions") fetchSubmissions();
  }, [id, tab]);

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
          {/* 4. Updated Submissions Tab */}
          <button
            type="button"
            onClick={() => setTab("submissions")}
            className={`contest-page__tab ${tab === "submissions" ? "contest-page__tab--active" : ""}`}
          >
            My Submissions
          </button>
        </div>

        {/* 5. Render Logic */}
        {tab === "leaderboard" && <LeaderboardTable leaderboard={leaderboard} />}
        
        {tab === "submissions" && <Submissions submissions={submissions} />}

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