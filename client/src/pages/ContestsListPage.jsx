import { useEffect, useState, useContext, useMemo, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { Context } from "../main";
import api from "../api/client";
import MainLayout from "../layout/MainLayout";
import {
  LiveContestCard,
  UpcomingContestCard,
  PastContestRow,
  LiveContestSkeleton,
  ContestCardSkeleton,
  TableSkeleton,
  NoLiveContest,
  NoUpcomingContests,
  NoPastContests,
} from "../components/contestlist";

export default function ContestsListPage() {
  const { isAuthenticated, user } = useContext(Context);
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState(null);
  const [error, setError] = useState(null);

  // Fetch contests
  useEffect(() => {
    const fetchContests = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/contests");
        setContests(data.contests || []);
      } catch {
        setError("Failed to load contests");
        setContests([]);
      } finally {
        setLoading(false);
      }
    };
    fetchContests();
  }, []);

  // Handle registration
  const handleRegister = useCallback(
    async (contestId) => {
      try {
        setRegisteringId(contestId);
        await api.put(`/contests/${contestId}/register`);

        // Optimistic UI update
        setContests((prev) =>
          prev.map((c) =>
            c._id === contestId
              ? { ...c, participants: [...(c.participants || []), user._id] }
              : c
          )
        );
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Registration error:", err);
        alert(err.response?.data?.message || "Failed to register for contest");
      } finally {
        setRegisteringId(null);
      }
    },
    [user]
  );

  // Categorize contests
  const { liveContest, upcomingContests, pastContests } = useMemo(() => {
    const now = new Date();

    let live = null;
    const upcoming = [];
    const past = [];

    contests.forEach((contest) => {
      const start = new Date(contest.start_time);
      const end = new Date(contest.end_time);

      if (now >= start && now <= end) {
        if (!live || end < new Date(live.end_time)) {
          live = contest;
        }
      } else if (now < start) {
        upcoming.push(contest);
      } else {
        past.push(contest);
      }
    });

    // Sort upcoming by start time
    upcoming.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

    // Sort past by start time
    past.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));

    return {
      liveContest: live,
      upcomingContests: upcoming.slice(0, 2), // Show only first 2
      pastContests: past.slice(0, 5), // Show only first 5
    };
  }, [contests]);

  if (!isAuthenticated) return <Navigate to="/auth" />;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 lg:px-20 py-10 space-y-12">
        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Live Now Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold flex items-center gap-3">
              Live Now
            </h3>
          </div>

          {loading ? (
            <LiveContestSkeleton />
          ) : liveContest ? (
            <LiveContestCard contest={liveContest} currentUser={user} />
          ) : (
            <NoLiveContest />
          )}
        </section>

        {/* Upcoming Section */}
        <section id="upcoming">
          <h3 className="text-2xl font-bold mb-6">Upcoming Contests</h3>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ContestCardSkeleton />
              <ContestCardSkeleton />
              <ContestCardSkeleton />
            </div>
          ) : upcomingContests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingContests.map((contest) => (
                <UpcomingContestCard
                  key={contest._id}
                  contest={contest}
                  currentUser={user}
                  onRegister={handleRegister}
                  registeringId={registeringId}
                />
              ))}
              {/* More contests placeholder card */}
              {upcomingContests.length < 3 && (
                <div className="bg-card-dark border border-dashed border-white/10 rounded-2xl p-6 flex flex-col justify-between">
                  <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                    <p className="text-slate-500 text-sm font-medium">
                      More contests being announced soon
                    </p>
                    <button className="mt-4 text-xs text-accent-yellow underline font-bold">
                      SET NOTIFICATION
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <NoUpcomingContests />
          )}
        </section>

        {/* Past Contests Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">Past Contests</h3>
            {pastContests.length > 0 && (
              <button className="text-slate-400 hover:text-white text-sm font-semibold flex items-center gap-1 transition-colors">
                View Archive <ExternalLink className="w-4 h-4" />
              </button>
            )}
          </div>

          {loading ? (
            <TableSkeleton />
          ) : pastContests.length > 0 ? (
            <div className="bg-card-dark border border-white/5 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-widest font-black">
                      <th className="px-8 py-4">Contest Name</th>
                      <th className="px-8 py-4">Date</th>
                      <th className="px-8 py-4 text-center">Final Standings</th>
                      <th className="px-8 py-4">Personal Result</th>
                      <th className="px-8 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {pastContests.map((contest) => (
                      <PastContestRow
                        key={contest._id}
                        contest={contest}
                        currentUser={user}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <NoPastContests />
          )}
        </section>
      </div>
    </MainLayout>
  );
}
