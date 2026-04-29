import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronLeft, BarChart3, Settings, Users, FileCode, Clock, AlertTriangle, CheckCircle, XCircle, Download } from "lucide-react";
import clsx from "clsx";
import { Context } from "../main";
import api from "../api/client";
import MainLayout from "../layout/MainLayout";
import LeaderboardTable from "../components/contest/LeaderboardTable";

const STATUS_CONFIG = {
  live: { label: "Live", color: "bg-green-500/10 text-green-400 border-green-500/30", icon: "🟢" },
  upcoming: { label: "Upcoming", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30", icon: "🟡" },
  ended: { label: "Ended", color: "bg-red-500/10 text-red-400 border-red-500/30", icon: "🔴" },
  draft: { label: "Draft", color: "bg-gray-500/10 text-gray-400 border-gray-500/30", icon: "⚪" },
};

const TEACHER_ROLES = new Set(["Teacher", "Admin", "TA"]);

function TeacherTopBar({ contestName }) {
  const navigate = useNavigate();
  return (
    <header className="h-14 bg-zinc-900 border-b border-white/10 flex items-center px-6 gap-4 sticky top-0 z-50">
      <button
        onClick={() => navigate('/ta-dashboard')}
        className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
      >
        <ChevronLeft size={16} /> Back to Dashboard
      </button>
      <span className="text-white/20 text-lg">|</span>
      <span className="text-sm font-semibold text-white truncate">{contestName}</span>
      <span className="ml-auto flex items-center gap-1.5 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full px-3 py-1">
        <Settings size={12} /> Manage Contest
      </span>
    </header>
  );
}

export default function ManageContestPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(Context);
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("analytics");
  const [leaderboard, setLeaderboard] = useState([]);

  const isTeacher = TEACHER_ROLES.has(user?.role);

  useEffect(() => {
    const fetchContest = async () => {
      try {
        const { data } = await api.get(`/contests/${id}`);
        setContest(data.contest);

        const now = new Date();
        const start = new Date(data.contest.start_time);

        if (now >= start) {
          setActiveTab("analytics");
        } else {
          setActiveTab("editor");
        }
      } catch (err) {
        console.error("Failed to fetch contest:", err);
        if (err.response?.status === 403 || err.response?.status === 404) {
          navigate("/ta-dashboard", { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchContest();
  }, [id, navigate]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await api.get(`/contests/${id}/leaderboard`);
        setLeaderboard(data.leaderboard || []);
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
      }
    };
    if (activeTab === "analytics" && contest) {
      const now = new Date();
      const start = new Date(contest.start_time);
      if (now >= start) {
        fetchLeaderboard();
      }
    }
  }, [id, activeTab, contest]);

  const exportToCSV = () => {
    if (!leaderboard || leaderboard.length === 0) return;
    const headers = ["Rank", "Name", "Solved"];

    const rows = leaderboard.map(user => [
      user.rank,
      `"${user.name}"`,
      user.solvedCount
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${contest.name.replace(/\s+/g, '_')}_Leaderboard.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getContestStatus = () => {
    if (!contest || contest.is_active === false || !contest.start_time) return "draft";
    const now = new Date();
    const start = new Date(contest.start_time);
    const end = new Date(contest.end_time);
    if (now < start) return "upcoming";
    if (now >= start && now <= end) return "live";
    return "ended";
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "TBD";
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading) {
    if (isTeacher) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-bg-dark text-white">
          <div className="w-8 h-8 border-2 border-brand-yellow/30 border-t-brand-yellow rounded-full animate-spin" />
        </div>
      );
    }
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center bg-bg-dark">
          <div className="w-8 h-8 border-2 border-brand-yellow/30 border-t-brand-yellow rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (!contest) {
    if (isTeacher) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-bg-dark text-white">
          <AlertTriangle size={48} className="text-yellow-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Contest Not Found</h2>
          <p className="text-muted mb-4">The contest you&lsquo;re trying to manage doesn&lsquo;t exist.</p>
          <Link to="/ta-dashboard" className="text-brand-yellow hover:underline">
            Back to TA Dashboard
          </Link>
        </div>
      );
    }
    return (
      <MainLayout>
        <div className="min-h-screen flex flex-col items-center justify-center bg-bg-dark text-white">
          <AlertTriangle size={48} className="text-yellow-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Contest Not Found</h2>
          <p className="text-muted mb-4">The contest you&lsquo;re trying to manage doesn&lsquo;t exist.</p>
          <Link to="/ta-dashboard" className="text-brand-yellow hover:underline">
            Back to TA Dashboard
          </Link>
        </div>
      </MainLayout>
    );
  }

  const status = getContestStatus();
  const statusConfig = STATUS_CONFIG[status];

  const content = (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div>
        {!isTeacher && (
          <Link
            to="/ta-dashboard"
            className="text-muted hover:text-white text-sm font-medium flex items-center gap-1 mb-4 w-fit transition-colors"
          >
            <ChevronLeft size={16} /> Back to Dashboard
          </Link>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white tracking-tight">{contest.name}</h1>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusConfig.color}`}>
                {statusConfig.icon} {statusConfig.label}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted">
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {formatDateTime(contest.start_time)} - {formatDateTime(contest.end_time)}
              </span>
              <span className="flex items-center gap-1">
                <Users size={14} />
                {contest.participants?.length || 0} participants
              </span>
            </div>
          </div>

          <Link
            to={`/contests/${id}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-white text-bg-dark hover:opacity-90 transition-all shadow-lg"
          >
            View Contest Page
          </Link>
        </div>
      </div>

      <div className="border-b border-white/10">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("analytics")}
            className={clsx(
              "pb-4 text-sm font-semibold transition-all duration-200 border-b-2 flex items-center gap-2",
              activeTab === "analytics"
                ? "text-brand-yellow border-brand-yellow"
                : "text-muted border-transparent hover:text-white"
            )}
          >
            <BarChart3 size={16} />
            Analytics & Leaderboard
          </button>
          <button
            onClick={() => setActiveTab("editor")}
            className={clsx(
              "pb-4 text-sm font-semibold transition-all duration-200 border-b-2 flex items-center gap-2",
              activeTab === "editor"
                ? "text-brand-yellow border-brand-yellow"
                : "text-muted border-transparent hover:text-white"
            )}
          >
            <Settings size={16} />
            Edit Contest
          </button>
        </div>
      </div>

      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card-dark border border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="text-brand-yellow" size={20} />
                <span className="text-sm text-muted">Total Participants</span>
              </div>
              <p className="text-3xl font-bold text-white">{contest.participants?.length || 0}</p>
            </div>

            <div className="bg-card-dark border border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="text-green-400" size={20} />
                <span className="text-sm text-muted">Accepted Submissions</span>
              </div>
              <p className="text-3xl font-bold text-white">--</p>
            </div>

            <div className="bg-card-dark border border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <XCircle className="text-red-400" size={20} />
                <span className="text-sm text-muted">Failed Submissions</span>
              </div>
              <p className="text-3xl font-bold text-white">--</p>
            </div>
          </div>

          <div className="bg-card-dark border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <BarChart3 size={20} className="text-brand-yellow" />
                {status === "ended" ? "Final Leaderboard" : "Real-time Leaderboard"}
              </h3>
              {(status === "live" || status === "ended") && leaderboard.length > 0 && (
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                  <Download size={16} />
                  Export CSV
                </button>
              )}
            </div>

            {status === "live" || status === "ended" ? (
              <>
                {leaderboard.length > 0 ? (
                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar mb-4">
                    <LeaderboardTable leaderboard={leaderboard} hideHeader={true} />
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted">
                    <p>No submissions found for this contest yet.</p>
                  </div>
                )}
                <div className="text-center">
                  <Link to={`/contests/${id}`} className="text-brand-yellow hover:underline text-sm inline-block">
                    View Full Contest Page →
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted">
                <p>The leaderboard will become available once the contest starts.</p>
              </div>
            )}
          </div>

          <div className="bg-card-dark border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FileCode size={20} className="text-brand-yellow" />
              Submission Heatmap
            </h3>
            {status === "live" ? (
              <div className="text-center py-8 text-muted">
                <p>Live submission feed will appear here during the contest.</p>
              </div>
            ) : status === "upcoming" ? (
              <div className="text-center py-8 text-muted">
                <p>The submission heatmap will be available once the contest starts.</p>
              </div>
            ) : (
              <div className="text-center py-8 text-muted">
                <p>Contest has ended. View detailed analytics in the contest page.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "editor" && (
        <div className="space-y-6">
          <div className="bg-card-dark border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Settings size={20} className="text-brand-yellow" />
              Contest Configuration
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted block mb-1">Contest Name</label>
                  <p className="text-white font-medium">{contest.name}</p>
                </div>
                <div>
                  <label className="text-sm text-muted block mb-1">Slug</label>
                  <p className="text-white font-medium">{contest.slug}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted block mb-1">Start Time</label>
                  <p className="text-white font-medium">{formatDateTime(contest.start_time)}</p>
                </div>
                <div>
                  <label className="text-sm text-muted block mb-1">End Time</label>
                  <p className="text-white font-medium">{formatDateTime(contest.end_time)}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10 flex gap-3">
              <Link
                to={`/create-contest?edit=${id}`}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-brand-yellow text-bg-dark hover:opacity-90 transition-all"
              >
                <Settings size={16} />
                Edit Contest Details
              </Link>
            </div>
          </div>

          <div className="bg-card-dark border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FileCode size={20} className="text-brand-yellow" />
              Problem Set Management
            </h3>
            <div className="text-center py-8 text-muted">
              <p>{contest.problems?.length || 0} problems configured for this contest.</p>
              <Link
                to={`/create-contest?edit=${id}`}
                className="text-brand-yellow hover:underline text-sm mt-2 inline-block"
              >
                Manage Problems →
              </Link>
            </div>
          </div>

          <div className="bg-card-dark border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users size={20} className="text-brand-yellow" />
              Access Control
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted block mb-2">Moderators</label>
                <div className="flex flex-wrap gap-2">
                  {contest.moderators?.map((mod) => (
                    <span key={mod._id || mod} className="px-3 py-1 bg-white/5 rounded-full text-sm text-white">
                      {mod.name || mod}
                    </span>
                  ))}
                  {(!contest.moderators || contest.moderators.length === 0) && (
                    <span className="text-muted text-sm">No moderators assigned</span>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Link
                to={`/create-contest?edit=${id}`}
                className="text-brand-yellow hover:underline text-sm"
              >
                Manage Moderators →
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );

  if (isTeacher) {
    return (
      <div className="min-h-screen bg-bg-dark text-white font-sans">
        <TeacherTopBar contestName={contest.name} />
        {content}
      </div>
    );
  }

  return (
    <MainLayout>
      {content}
    </MainLayout>
  );
}
