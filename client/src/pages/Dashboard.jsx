import { useEffect, useState, useCallback, useMemo, useContext } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, UserCog, Shield, GraduationCap } from "lucide-react";
import { Context } from "../main";
import api from "../api/client";
import { toast } from "react-toastify";
import MainLayout from "../layout/MainLayout";
import {
  LiveContestCard,
  UpcomingContestHero,
  LiveContestSkeleton,
  NoHeroContests,
} from "../components/contestlist";
import { AttendanceCard, StreakCard } from "../components/dashboard/AttendanceAndStreak";
import { QuestionsChart, NotesCard } from "../components/dashboard/QuestionsSolvedAndNotes";
import RecentSubmissions from "../components/dashboard/RecentSubmissions";
import LabWorkWidget from "../components/dashboard/LabWorkWidget";

export default function Dashboard() {
  const { isAuthenticated, user } = useContext(Context);
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const navigate = useNavigate();

  // Fetch all contests
  useEffect(() => {
    const fetchContests = async () => {
      try {
        setLoading(true);
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

  // Categorize and sort contests: Live first, then Upcoming by start_time
  const heroContests = useMemo(() => {
    const now = new Date();
    const live = [];
    const upcoming = [];

    contests.forEach((contest) => {
      const start = new Date(contest.start_time);
      const end = new Date(contest.end_time);

      if (now >= start && now <= end) {
        live.push({ ...contest, status: "Live" });
      } else if (now < start) {
        upcoming.push({ ...contest, status: "Upcoming" });
      }
    });

    upcoming.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
    return [...live, ...upcoming];
  }, [contests]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [heroContests.length]);

  // registration
  const handleRegister = useCallback(
    async (contestId) => {
      try {
        setRegisteringId(contestId);
        await api.put(`/contests/${contestId}/register`);

        // update main contests state
        setContests((prev) =>
          prev.map((c) =>
            c._id === contestId
              ? { ...c, participants: [...(c.participants || []), user._id] }
              : c
          )
        );

        toast.success("Registered successfully!");
      } catch (err) {
        console.error("Registration error:", err);
        toast.error(err.response?.data?.message || "Failed to register for contest");
      } finally {
        setRegisteringId(null);
      }
    },
    [user]
  );

  // Carousel navigation
  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === 0 ? heroContests.length - 1 : prev - 1
    );
  }, [heroContests.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === heroContests.length - 1 ? 0 : prev + 1
    );
  }, [heroContests.length]);

  const goToSlide = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  if (!isAuthenticated) return <Navigate to="/auth" />;
  if (user?.role === "Admin") return <Navigate to="/admin" replace />;
  if (user?.role === "Teacher") return <Navigate to="/teacher-dashboard" replace />;

  // Get current contest for hero
  const currentContest = heroContests[currentIndex];

  return (
    <MainLayout onBack={() => navigate("/")}>
      <div className="max-w-7xl mx-auto px-6 lg:px-20 py-10 space-y-4">

          {/* --- HEADER SECTION --- */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Welcome, {user?.name || "User"}!
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Ready to continue your coding journey?
              </p>
            </div>
            
            {/* Role-based dashboard buttons */}
            <div className="flex gap-2 flex-wrap">
              {user?.role === "TA" && (
                <button
                  onClick={() => navigate("/ta-dashboard")}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
                >
                  <UserCog size={16} className="text-slate-400 group-hover:text-white transition-colors" />
                  TA Dashboard
                </button>
              )}
              {(user?.role === "Teacher" || user?.role === "Admin") && (
                <button
                  onClick={() => navigate("/teacher-dashboard")}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-white/5 text-white border border-white/10 hover:bg-amber-400/10 hover:border-amber-400/20 hover:text-amber-400 transition-all group"
                >
                  <GraduationCap size={16} className="text-zinc-400 group-hover:text-amber-400 transition-colors" />
                  Teacher Dashboard
                </button>
              )}
              {user?.role === "Admin" && (
                <button
                  onClick={() => navigate("/admin")}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20 hover:bg-amber-400/20 transition-all"
                >
                  <Shield size={16} />
                  Admin Panel
                </button>
              )}
            </div>
          </div>
          {/* -------------------------- */}

          {/* ── Main Grid Layout ─────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">

            {/* ── LEFT COLUMN (col-span-2): Contest → Chart → Lab ── */}
            <div className="lg:col-span-2 flex flex-col gap-4">

              {/* Row 1 Left: Contest Carousel */}
              <div
                className="relative rounded-xl overflow-hidden shadow-lg"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                {loading ? (
                  <LiveContestSkeleton />
                ) : heroContests.length > 0 ? (
                  <>
                    <div className="transition-opacity duration-300">
                      {currentContest?.status === "Live" ? (
                        <LiveContestCard contest={currentContest} currentUser={user} onRegister={handleRegister} registeringId={registeringId} />
                      ) : (
                        <UpcomingContestHero contest={currentContest} currentUser={user} onRegister={handleRegister} registeringId={registeringId} />
                      )}
                    </div>
                    {heroContests.length > 1 && (
                      <>
                        <button onClick={goToPrevious} className={`absolute left-4 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition-all duration-300 hover:bg-accent-yellow hover:text-black ${isHovering ? "opacity-100" : "opacity-0"}`} aria-label="Previous contest">
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button onClick={goToNext} className={`absolute right-4 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition-all duration-300 hover:bg-accent-yellow hover:text-black ${isHovering ? "opacity-100" : "opacity-0"}`} aria-label="Next contest">
                          <ChevronRight className="w-6 h-6" />
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {heroContests.map((_, index) => (
                            <button key={index} onClick={() => goToSlide(index)}
                              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === currentIndex ? "bg-accent-yellow w-6" : "bg-white/50 hover:bg-white/70"}`}
                              aria-label={`Go to slide ${index + 1}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <NoHeroContests />
                )}
              </div>

              {/* Row 2 Left: Questions Solved Chart */}
              <QuestionsChart />

              {/* Row 3 Left: Lab Work */}
              <LabWorkWidget />
            </div>

            {/* ── RIGHT COLUMN (col-span-1): Attendance → Streak → Notes ── */}
            <div className="flex flex-col gap-4">
              <AttendanceCard contests={contests} user={user} />
              <StreakCard user={user} />
              <NotesCard />
            </div>
          </div>

          {/* ── Full-width: Recent Submissions ─────────────────── */}
          <RecentSubmissions />
      </div>
    </MainLayout>
  );
}