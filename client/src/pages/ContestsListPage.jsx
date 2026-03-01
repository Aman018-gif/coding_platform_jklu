import { useEffect, useState, useContext, useMemo } from "react";
import { Link, Navigate } from "react-router-dom";
// ... (keep your existing icon imports)
import { Context } from "../main";
import api from "../api/client";
import MainLayout from "../layout/MainLayout";

export default function ContestsListPage() {
  const { isAuthenticated, user } = useContext(Context);
  const [rawContests, setRawContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const { data } = await api.get("/contests");
        // Ensure we always have an array even if the API fails or is empty
        setRawContests(data.contests || []);
      } catch (err) {
        console.error("Fetch error:", err);
        setRawContests([]);
      } finally {
        setLoading(false);
      }
    };
    fetchContests();
  }, []);

  // --- DATA TRANSFORMATION LAYER ---
  const { live, upcoming, past } = useMemo(() => {
    const now = new Date();
    
    // Helper to format backend data into our UI structure
    const format = (c) => ({
      id: c._id || c.id,
      name: c.title || c.name || "Untitled Contest",
      startTime: new Date(c.startTime),
      endTime: new Date(c.endTime),
      participants: c.participants?.length || 0,
      prize: c.prizePool || "Credits",
      registered: c.participants?.includes(user?._id),
      // Add fallback defaults for mock fields not yet in backend
      leader: c.currentLeader || "TBD",
      division: c.division || "All",
      dateLabel: new Date(c.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    });

    return {
      live: rawContests.find(c => new Date(c.startTime) <= now && new Date(c.endTime) >= now),
      upcoming: rawContests.filter(c => new Date(c.startTime) > now).map(format),
      past: rawContests.filter(c => new Date(c.endTime) < now).map(format),
    };
  }, [rawContests, user]);

  if (!isAuthenticated) return <Navigate to="/auth" />;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 lg:px-20 py-10 space-y-12">
        
        {/* 1. LIVE SECTION (Conditional Rendering) */}
        {live ? (
          <section>
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-2xl font-bold flex items-center gap-3">
                  Live Now <span className="animate-pulse bg-red-500/10 text-red-500 text-xs px-2 py-1 rounded-full">● Live</span>
               </h3>
            </div>
            {/* ... Render live card using {live.name} etc ... */}
          </section>
        ) : !loading && (
          <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-10 text-center text-slate-500">
            No contests currently live. Check the upcoming schedule below!
          </div>
        )}

        {/* 2. UPCOMING SECTION */}
        <section>
          <h3 className="text-2xl font-bold mb-6">Upcoming Challenges</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcoming.length > 0 ? (
              upcoming.map((contest) => (
                <UpcomingCard key={contest.id} contest={contest} />
              ))
            ) : !loading && (
              <p className="text-slate-500">No upcoming contests scheduled yet.</p>
            )}
          </div>
        </section>

        {/* 3. PAST CONTESTS SECTION */}
        <section>
          <h3 className="text-2xl font-bold mb-6">Past Contests</h3>
          <div className="bg-card-dark border border-white/5 rounded-2xl overflow-hidden">
            {past.length > 0 ? (
              <PastContestTable contests={past} />
            ) : (
              <div className="p-10 text-center text-slate-500">Archive is currently empty.</div>
            )}
          </div>
        </section>

      </div>
    </MainLayout>
  );
}

// Sub-components to keep the main file clean
function UpcomingCard({ contest }) { /* ... move your card JSX here ... */ }
function PastContestTable({ contests }) { /* ... move your table JSX here ... */ }