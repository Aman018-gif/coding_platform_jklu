import React, { useEffect, useState, useContext } from "react";
import { useParams, Navigate, useNavigate, Link } from "react-router-dom";
import { ChevronLeft, Eye } from "lucide-react";
import { Context } from "../main";
import api from "../api/client";
import MainLayout from "../layout/MainLayout";
import ContestProblemCard from "../components/contest/ContestProblemCard";
import ContestSidebar from "../components/contest/ContestSidebar";
import LeaderboardTable from "../components/contest/LeaderboardTable";
import Submissions from "../components/contest/Submissions";

const TEACHER_ROLES = new Set(["Teacher", "Sadmin", "TA"]);

/** Minimal top bar shown to teachers instead of the student Navbar */
function TeacherTopBar({ contestName, contestId }) {
  const navigate = useNavigate();
  return (
    <header className="h-14 bg-zinc-900 border-b border-white/10 flex items-center px-6 gap-4 sticky top-0 z-50">
      <button
        onClick={() => {
          const isExam = window.location.pathname.includes('/exams/');
          navigate(isExam ? `/manage-exam/${contestId}` : `/manage-contest/${contestId}`);
        }}
        className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
      >
        <ChevronLeft size={16} /> Back to Manage
      </button>
      <span className="text-white/20 text-lg">|</span>
      <span className="text-sm font-semibold text-white truncate">{contestName}</span>
      <span className="ml-auto flex items-center gap-1.5 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full px-3 py-1">
        <Eye size={12} /> Teacher Preview
      </span>
    </header>
  );
}

export default function ContestPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useContext(Context);
  const [contest, setContest] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("problems");

  const isTeacher = TEACHER_ROLES.has(user?.role);

  const isExam = window.location.pathname.includes('/exams/');

  useEffect(() => {
    const fetchContest = async () => {
      try {
        let response;
        const isObjectId = id && /^[0-9a-fA-F]{24}$/.test(id);
        const url = isObjectId 
          ? (isExam ? `/exams/${id}` : `/contests/${id}`) 
          : (isExam ? `/exams/slug/${id}` : `/contests/slug/${id}`);
        response = await api.get(url);
        const contestData = isExam ? response.data.exam : response.data.contest;
        setContest({...contestData});
      } catch (err) {
        console.error('Error fetching contest:', err.response?.data || err.message);
        setContest(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchContest();
  }, [id, isExam]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        let endpoint;
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
        if (isObjectId) {
          endpoint = `/contests/${id}/leaderboard`;
        } else {
          const url = isExam ? `/exams/slug/${id}` : `/contests/slug/${id}`;
          const { data } = await api.get(url);
          const entityId = isExam ? data.exam._id : data.contest._id;
          endpoint = `/contests/${entityId}/leaderboard`;
        }
        const { data } = await api.get(endpoint);
        setLeaderboard(data.leaderboard || []);
      } catch {
        setLeaderboard([]);
      }
    };
    if (id && contest && !isExam) fetchLeaderboard();
  }, [id, contest, isExam]);

  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading && !contest) {
    if (isTeacher) {
      return (
        <div className="min-h-screen bg-zinc-900 flex items-center justify-center text-zinc-400 text-sm animate-pulse">
          Loading Contest…
        </div>
      );
    }
    return (
      <MainLayout onBack={() => navigate("/contests")} activeNav="Contests">
        <div className="min-h-screen flex items-center justify-center bg-bg-dark text-slate-400">
          <div className="animate-pulse font-display">Loading Contest...</div>
        </div>
      </MainLayout>
    );
  }

  // ── Not found ────────────────────────────────────────────────────────────────
  if (!contest) {
    if (isTeacher) {
      return (
        <div className="min-h-screen bg-zinc-900 flex items-center justify-center text-zinc-400 text-sm">
          Contest not found.
        </div>
      );
    }
    return (
      <MainLayout onBack={() => navigate("/contests")} activeNav="Contests">
        <div className="min-h-screen flex items-center justify-center bg-bg-dark text-slate-400">
          Contest not found.
        </div>
      </MainLayout>
    );
  }

  const problems = contest.problems || [];

  // ── Shared content (tabs + problem list) ─────────────────────────────────────
  const content = (
    <main className="relative z-10 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Back Button — only for students */}
      {!isTeacher && (
        <button
          onClick={() => navigate("/contests")}
          className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors mb-2 w-fit"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Contests
        </button>
      )}

      <header className="mb-8">
        <h1 className="text-4xl font-sans font-extrabold text-white tracking-tight uppercase">
          {contest.name}
        </h1>
      </header>

      {/* Tab Navigation */}
      <div className="flex gap-6 mb-8 border-b border-card-border">
        {["problems", "leaderboard", "submissions"]
          .filter((t) => !(isExam && t === "leaderboard"))
          .map((t) => (
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
            <Submissions contestId={contest._id} />
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
                      contestName={contest.name}
                    />
                  </div>
                ))
              ) : (
                <div className="glass-card p-12 text-center text-slate-500 rounded-xl">
                  No problems available for this contest yet.
                </div>
              )}
            </div>

            {/* Sidebar — only shown to students */}
            {!isTeacher && (
              <aside className="lg:col-span-4 sticky top-24">
                <div className="rounded-xl">
                  <ContestSidebar
                    contest={contest}
                    user={user}
                    leaderboard={leaderboard}
                  />
                </div>
              </aside>
            )}

            {/* Teacher sidebar replacement — quick info */}
            {isTeacher && (
              <aside className="lg:col-span-4 sticky top-24 space-y-3">
                <div className="bg-zinc-800 border border-white/10 rounded-xl p-5">
                  <p className="text-xs text-zinc-500 mb-3 uppercase tracking-wide font-medium">Contest Info</p>
                  <div className="space-y-2 text-sm text-zinc-300">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Problems</span>
                      <span>{problems.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Participants</span>
                      <span>{contest.participants?.length ?? 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Leaderboard entries</span>
                      <span>{leaderboard.length}</span>
                    </div>
                  </div>
                  <Link
                    to={window.location.pathname.includes('/exams/') ? `/manage-exam/${contest._id}` : `/manage-contest/${contest._id}`}
                    className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm bg-amber-400 text-black font-medium hover:bg-amber-300 transition-colors"
                  >
                    ← Back to Manage
                  </Link>
                </div>
              </aside>
            )}
          </div>
        )}
      </section>
    </main>
  );

  // ── Teacher layout: minimal dark bar, no student Navbar ──────────────────────
  if (isTeacher) {
    return (
      <div className="min-h-screen bg-bg-dark text-white font-sans">
        <TeacherTopBar contestName={contest.name} contestId={contest._id} />
        {content}
      </div>
    );
  }

  // ── Student layout: full MainLayout with Navbar ───────────────────────────────
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
      {content}
    </MainLayout>
  );
}