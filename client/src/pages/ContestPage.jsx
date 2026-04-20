import React, { useEffect, useState, useContext } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Context } from "../main";
import api from "../api/client";
import MainLayout from "../layout/MainLayout";
import ContestProblemCard from "../components/contest/ContestProblemCard";
import ContestSidebar from "../components/contest/ContestSidebar";
import LeaderboardTable from "../components/contest/LeaderboardTable";
import Submissions from "../components/contest/Submissions";

export default function ContestPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useContext(Context);
  const [contest, setContest] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [submissions, setSubmissions] = useState([]);
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
  if (loading && !contest) {
    return (
      <MainLayout onBack={() => navigate("/contests")} activeNav="Contests">
        <div className="min-h-screen flex items-center justify-center bg-bg-dark text-slate-400">
          <div className="animate-pulse font-display">Loading Contest...</div>
        </div>
      </MainLayout>
    );
  }

  if (!contest) {
    return (
      <MainLayout onBack={() => navigate("/contests")} activeNav="Contests">
        <div className="min-h-screen flex items-center justify-center bg-bg-dark text-slate-400">
          Contest not found.
        </div>
      </MainLayout>
    );
  }

  const problems = contest.problems || [];

  return (
    <MainLayout
      onBack={() => navigate("/contests")}
      activeNav="Contests"
      onNavClick={(nav) => {
        if (nav === "Challenges") navigate("/challenges");
        if (nav === "Practice") navigate("/practice");
        if (nav === "Contests") navigate("/contests");
      }}
    >
      <main className="relative z-10 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/contests")}
          className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors mb-2 w-fit"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Contests
        </button>

        <header className="mb-8">
          <h1 className="text-4xl font-sans font-extrabold text-white tracking-tight uppercase">
            {contest.name}
          </h1>
        </header>

        {/* Tab Navigation */}
        <div className="flex gap-6 mb-8 border-b border-card-border">
          {["problems", "leaderboard", "submissions"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`pb-4 text-sm font-semibold transition-all duration-200 cursor-pointer capitalize ${tab === t ? "text-brand-yellow border-b-2 border-brand-yellow" : "text-slate-500 hover:text-slate-200"}`}
            >
              {t === "problems" && "Challenges"}
              {t === "leaderboard" && "Leaderboard"}
              {t === "submissions" && "Submissions"}
            </button>
          ))}
        </div>

        {/* Dynamic Content Sections */}
        <section className="mt-4">
          {tab === "leaderboard" && (
            <div className="glass-card rounded-xl p-6">
              <LeaderboardTable leaderboard={leaderboard} />
            </div>
          )}

          {tab === "submissions" && (
            <div className="glass-card rounded-xl p-6">
              <Submissions submissions={submissions} />
            </div>
          )}

          {tab === "problems" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Problem List */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                {problems.length > 0 ? (
                  problems.map((p, idx) => (
                    <div key={p._id}>
                      <ContestProblemCard
                        problem={p}
                        index={idx}
                        contestId={id}
                      />
                    </div>
                  ))
                ) : (
                  <div className="glass-card p-12 text-center text-slate-500 rounded-xl">
                    No problems available for this contest yet.
                  </div>
                )}
              </div>

              {/* Sidebar Info */}
              <aside className="lg:col-span-4 sticky top-24">
                <div className="rounded-xl">
                  <ContestSidebar
                    contest={contest}
                    user={user}
                    leaderboard={leaderboard}
                  />
                </div>
              </aside>
            </div>
          )}
        </section>
      </main>
    </MainLayout>
  );
}