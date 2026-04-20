import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard, User, PlusCircle, Calendar, Users, MoreHorizontal } from "lucide-react";
import { Context } from "../main";
import api from "../api/client";
import MainLayout from "../layout/MainLayout";
import { fetchMyContests } from "../api/contestApi";

export default function TADashboard() {
  const { user } = useContext(Context);
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContests = async () => {
      try {
        const data = await fetchMyContests();
        setContests(data);
      } catch (err) {
        console.error("Failed to load contests:", err);
      } finally {
        setLoading(false);
      }
    };
    loadContests();
  }, []);

  const getStatusBadge = (contest) => {
    const now = new Date();
    const start = new Date(contest.start_time);
    const end = new Date(contest.end_time);

    if (now < start) {
      return { label: "Upcoming", className: "bg-blue-500/10 text-blue-400 border-blue-500/30" };
    } else if (now >= start && now <= end) {
      return { label: "Live", className: "bg-green-500/10 text-green-400 border-green-500/30" };
    } else {
      return { label: "Ended", className: "bg-gray-500/10 text-gray-400 border-gray-500/30" };
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <MainLayout>
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <LayoutDashboard className="text-brand-yellow" size={28} />
              TA Dashboard
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-bg-light border border-white/10 text-white hover:bg-white/5 hover:border-white/20 transition-all group"
            >
              <User size={18} className="text-muted group-hover:text-white transition-colors" />
              Switch to User Dashboard
            </Link>

            <Link
              to="/create-contest" 
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-white text-bg-dark hover:opacity-90 transition-all shadow-lg"
            >
              <PlusCircle size={18} />
              Create Contest
            </Link>
            
          </div>
        </div>

        {loading ? (
          <div className="bg-card-dark border border-white/10 rounded-2xl p-10 flex flex-col items-center justify-center text-center min-h-[200px]">
            <div className="w-8 h-8 border-2 border-brand-yellow/30 border-t-brand-yellow rounded-full animate-spin" />
            <p className="text-sm text-muted mt-4">Loading your contests...</p>
          </div>
        ) : contests.length === 0 ? (
          <div className="bg-card-dark border border-white/10 rounded-2xl p-10 flex flex-col items-center justify-center text-center min-h-[200px]">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <LayoutDashboard size={32} className="text-muted" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No contests yet</h3>
            <p className="text-sm text-muted max-w-md">
              You haven't created or moderated any contests. Click Create Contest above to set up your first assessment.
            </p>
          </div>
        ) : (
          <div className="bg-card-dark border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-5 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Contest Name</th>
                    <th className="px-5 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                    <th className="px-5 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Date & Time</th>
                    <th className="px-5 py-4 text-xs font-semibold text-muted uppercase tracking-wider text-center">Participants</th>
                    <th className="px-5 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Problems</th>
                    <th className="px-5 py-4 text-xs font-semibold text-muted uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {contests.map((contest) => {
                    const status = getStatusBadge(contest);
                    return (
                      <tr key={contest._id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-white">{contest.name}</span>
                            <span className="text-xs text-muted mt-0.5">
                              {contest.isOwner ? "Owner" : "Moderator"}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${status.className}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm text-white">{formatDate(contest.start_time)}</span>
                            <span className="text-xs text-muted mt-0.5">{formatTime(contest.start_time)}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="inline-flex items-center gap-1.5 text-sm text-muted">
                            <Users size={14} />
                            {contest.participants?.length || 0}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-muted">{contest.problems?.length || 0}</span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link
                            to={`/contests/${contest._id}`}
                            className="inline-flex items-center gap-1 text-sm text-brand-yellow hover:underline"
                          >
                            Manage <MoreHorizontal size={14} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </MainLayout>
  );
}