import { useEffect, useState, useCallback, useMemo, useContext } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

  // Get current contest for hero
  const currentContest = heroContests[currentIndex];

  return (
    <MainLayout onBack={() => navigate("/")}>
      <div className="w-full p-4 md:p-8" style={{ fontFamily: "Inter, sans-serif" }}>
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* Hero Carousel Banner */}
          <div
            className="relative rounded-xl overflow-hidden shadow-lg"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {loading ? (
              <LiveContestSkeleton />
            ) : heroContests.length > 0 ? (
              <>
                {/* Contest Slide */}
                <div className="transition-opacity duration-300">
                  {currentContest?.status === "Live" ? (
                    <LiveContestCard contest={currentContest} currentUser={user} />
                  ) : (
                    <UpcomingContestHero
                      contest={currentContest}
                      currentUser={user}
                      onRegister={handleRegister}
                      registeringId={registeringId}
                    />
                  )}
                </div>

                {/* Navigation Arrows - appear on hover */}
                {heroContests.length > 1 && (
                  <>
                    <button
                      onClick={goToPrevious}
                      className={`absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 ${
                        isHovering ? "opacity-100" : "opacity-0"
                      }`}
                      aria-label="Previous contest"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={goToNext}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 ${
                        isHovering ? "opacity-100" : "opacity-0"
                      }`}
                      aria-label="Next contest"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Pagination Dots */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {heroContests.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToSlide(index)}
                          className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                            index === currentIndex
                              ? "bg-accent-yellow w-6"
                              : "bg-white/50 hover:bg-white/70"
                          }`}
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

          {/* Middle Section: Attendance & Streak */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Attendance */}
            <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/5 flex flex-col items-center shadow-lg">
              <div className="w-full flex justify-between items-center mb-8">
                <h3 className="font-semibold text-sm">Attendance</h3>
                <button className="text-white/40 hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </button>
              </div>

              {/* Circle Progress */}
              <div className="relative w-36 h-36 mb-8">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 drop-shadow-[0_0_10px_rgba(230,209,90,0.2)]">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#FFFFFF" strokeOpacity="0.05" strokeWidth="8" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#e6d15a" strokeWidth="8" strokeLinecap="round" strokeDasharray="282.7" strokeDashoffset="42.4" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-4xl font-bold tracking-tighter">85%</div>
                  <div className="text-[9px] text-[#e6d15a] font-bold tracking-widest mt-1">TARGET 90%</div>
                </div>
              </div>

              <div className="w-full bg-[#121111] border border-white/5 rounded-md p-3 px-4 flex justify-between items-center mb-5">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D94] shadow-[0_0_5px_#FF4D94]"></span>
                  <span className="text-white/60 text-xs">Penalty: 2 absent days</span>
                </div>
                <span className="text-[#FF4D94] text-xs font-bold drop-shadow-[0_0_2px_#FF4D94]">-5%</span>
              </div>

              <div className="flex gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D94] shadow-[0_0_5px_#FF4D94]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
              </div>
            </div>

            {/* Daily Streak */}
            <div className="bg-[#1a1a1a] rounded-xl p-8 border border-white/5 lg:col-span-2 flex flex-col sm:flex-row items-center gap-10 shadow-lg">
              {/* Glowing Icon */}
              <div className="w-32 h-32 rounded-full bg-[#e6d15a]/10 flex items-center justify-center relative shadow-[0_0_50px_rgba(230,209,90,0.15)] shrink-0">
                <div className="w-24 h-24 bg-[#e6d15a] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(230,209,90,0.6)]">
                  <svg className="w-10 h-10 text-[#1a1a1a]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="4"></circle>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>
                  </svg>
                </div>
              </div>

              <div className="flex-1 w-full text-center sm:text-left">
                <h2 className="text-4xl font-bold mb-1">4 Days</h2>
                <div className="text-[#e6d15a] text-[10px] font-bold tracking-widest uppercase mb-8">Daily Practice Streak</div>

                <div className="flex justify-center sm:justify-start gap-3 sm:gap-5 mb-6">
                  {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day, i) => {
                    const isComplete = i < 4;
                    return (
                      <div key={day} className="flex flex-col items-center gap-2">
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${isComplete ? "text-white/80" : "text-white/40"}`}>{day}</span>
                        <div className={`w-8 h-8 rounded shrink-0 flex items-center justify-center transition-all ${isComplete ? "bg-[#e6d15a] shadow-[0_0_10px_rgba(230,209,90,0.4)]" : "bg-[#121111] border border-white/5"}`}>
                          {isComplete && <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-white/40 text-xs">Solve 1 more problem today to maintain your consistency!</div>
              </div>
            </div>
          </div>

          {/* Grid 2: Chart and Notes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Section */}
            <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/5 lg:col-span-2 flex flex-col h-80 shadow-lg">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-semibold text-sm mb-1">Questions Solved</h3>
                  <p className="text-white/40 text-[10px]">Daily performance for the current week</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#e6d15a] rounded-full shadow-[0_0_5px_#e6d15a]"></div>
                  <span className="text-white/60 text-[10px] font-medium tracking-wide">Correct</span>
                </div>
              </div>

              {/* Mock Chart Area */}
              <div className="flex-1 relative mt-2 w-full">
                <div className="absolute inset-0 flex flex-col justify-between pb-6">
                  <div className="border-b border-white/5 w-full"></div>
                  <div className="border-b border-white/5 w-full"></div>
                  <div className="border-b border-white/5 w-full"></div>
                  <div className="border-b border-white/5 w-full"></div>
                </div>
                {/* Fake chart data visualization can be added here if needed */}
                <div className="absolute bottom-0 left-0 w-full flex justify-between text-[10px] text-white/20 px-8 font-semibold">
                  <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/5 flex flex-col items-center justify-center text-center shadow-lg">
              <div className="w-full flex justify-between items-center mb-auto self-start">
                <h3 className="font-semibold text-sm">My Notes</h3>
                <button className="w-6 h-6 bg-white/5 hover:bg-white/10 rounded flex items-center justify-center text-white/60 hover:text-white transition-colors pb-0.5 font-bold">
                  +
                </button>
              </div>

              <div className="w-16 h-16 rounded-full bg-[#121111] border border-white/5 flex items-center justify-center mb-4 mt-6">
                <svg className="w-6 h-6 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </div>
              <h4 className="font-semibold text-sm mb-1">Nothing Here</h4>
              <p className="text-white/40 text-[10px] leading-relaxed mb-4 max-w-[200px]">Start documenting your algorithm logic or contest strategies!</p>
              <a href="#" className="text-[#e6d15a] text-[11px] font-semibold underline decoration-[#e6d15a]/30 hover:decoration-[#e6d15a] underline-offset-4 transition-all pb-6">Create first note</a>
            </div>
          </div>

          {/* Submissions Table */}
          <div className="bg-[#1a1a1a] rounded-xl border border-white/5 overflow-hidden shadow-lg">
            <div className="p-5 px-6 flex justify-between items-center border-b border-white/5">
              <h3 className="font-semibold text-sm">Recent Submissions</h3>
              <a href="#" className="text-[#e6d15a] text-[11px] font-bold tracking-wide hover:underline underline-offset-4">View All</a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="text-white/40 text-[11px] border-b border-white/5 tracking-wider">
                    <th className="py-4 px-6 font-medium w-2/5">Problem</th>
                    <th className="py-4 px-6 font-medium w-1/5">Language</th>
                    <th className="py-4 px-6 font-medium w-1/5">Status</th>
                    <th className="py-4 px-6 font-medium w-1/5 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="text-[13px]">
                  <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-5 px-6 font-medium text-[#ffffff] text-opacity-90">Trapping Rain Water</td>
                    <td className="py-5 px-6 text-white/60">C++</td>
                    <td className="py-5 px-6">
                      <span className="bg-[#95E935]/10 text-[#95E935] border border-[#95E935]/20 px-2.5 py-1 rounded text-[9px] font-extrabold tracking-widest uppercase inline-block mt-1">ACCEPTED</span>
                    </td>
                    <td className="py-5 px-6 text-white/40 text-right">2 hours ago</td>
                  </tr>
                  <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-5 px-6 font-medium text-[#ffffff] text-opacity-90">Longest Palindromic Substring</td>
                    <td className="py-5 px-6 text-white/60">Python</td>
                    <td className="py-5 px-6">
                      <span className="bg-[#FF4D94]/10 text-[#FF4D94] border border-[#FF4D94]/20 px-2.5 py-1 rounded text-[9px] font-extrabold tracking-widest uppercase inline-block mt-1">WRONG ANSWER</span>
                    </td>
                    <td className="py-5 px-6 text-white/40 text-right">5 hours ago</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-5 px-6 font-medium text-[#ffffff] text-opacity-90">Valid Parentheses</td>
                    <td className="py-5 px-6 text-white/60">Java</td>
                    <td className="py-5 px-6">
                      <span className="bg-[#95E935]/10 text-[#95E935] border border-[#95E935]/20 px-2.5 py-1 rounded text-[9px] font-extrabold tracking-widest uppercase inline-block mt-1">ACCEPTED</span>
                    </td>
                    <td className="py-5 px-6 text-white/40 text-right">Yesterday</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
