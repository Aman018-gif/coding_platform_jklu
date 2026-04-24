import { useEffect, useState } from "react";
import api from "../../api/client";

// ── Questions Solved Chart Card ────────────────────────────────────────────────
export function QuestionsChart() {
  const [weeklyData, setWeeklyData] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [maxCount, setMaxCount] = useState(4);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const { data } = await api.get("/submissions");
        const submissions = data.submissions || [];

        // Start of current week (Monday at 00:00:00)
        const now = new Date();
        const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1; // 0=Mon, 6=Sun
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - dayOfWeek);
        startOfWeek.setHours(0, 0, 0, 0);

        const counts = [0, 0, 0, 0, 0, 0, 0];

        submissions.forEach((sub) => {
          if (sub.status === "Accepted" && sub.submitted_at) {
            const subDate = new Date(sub.submitted_at);
            if (subDate >= startOfWeek) {
              const subDay = subDate.getDay() === 0 ? 6 : subDate.getDay() - 1;
              counts[subDay]++;
            }
          }
        });

        setWeeklyData(counts);
        setMaxCount(Math.max(4, ...counts));
      } catch (error) {
        console.error("Failed to fetch submissions for chart:", error);
      }
    };
    fetchSubmissions();
  }, []);

  return (
    <div className="bg-card-dark rounded-xl p-6 border border-white/5 flex flex-col h-80 shadow-lg">
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

      {/* Chart Area */}
      <div className="flex-1 relative mt-2 w-full">
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pb-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="border-b border-white/5 w-full" />
          ))}
        </div>

        {/* Bars */}
        <div className="absolute inset-0 flex justify-between items-end px-8 pb-8 z-10">
          {weeklyData.map((count, index) => {
            const heightPct = count === 0 ? 0 : Math.max(5, (count / maxCount) * 100);
            return (
              <div key={index} className="flex flex-col justify-end items-center w-8 h-full group">
                <div
                  className="w-3 bg-[#e6d15a] rounded-t-sm transition-all duration-500 relative shadow-[0_0_10px_rgba(230,209,90,0.2)] group-hover:shadow-[0_0_15px_rgba(230,209,90,0.6)] group-hover:bg-[#fceb77]"
                  style={{ height: `${heightPct}%` }}
                >
                  {count > 0 && (
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      {count}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 w-full flex justify-between text-[10px] text-white/20 px-8 font-semibold z-20">
          {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d) => (
            <span key={d} className="w-8 text-center">{d}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Notes Card ────────────────────────────────────────────────────────────────
export function NotesCard() {
  return (
    <div className="bg-card-dark rounded-xl p-6 border border-white/5 flex flex-col items-center justify-center text-center shadow-lg h-full">
      <div className="w-full flex justify-between items-center mb-auto self-start">
        <h3 className="font-semibold text-sm">My Notes</h3>
        <button className="w-6 h-6 bg-white/5 hover:bg-white/10 rounded flex items-center justify-center text-white/60 hover:text-white transition-colors pb-0.5 font-bold">
          +
        </button>
      </div>

      <div className="w-16 h-16 rounded-full bg-[#121111] border border-white/5 flex items-center justify-center mb-4 mt-6">
        <svg className="w-6 h-6 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </div>
      <h4 className="font-semibold text-sm mb-1">Nothing Here</h4>
      <p className="text-white/40 text-[10px] leading-relaxed mb-4 max-w-[200px]">
        Start documenting your algorithm logic or contest strategies!
      </p>
      <a
        href="#"
        className="text-[#e6d15a] text-[11px] font-semibold underline decoration-[#e6d15a]/30 hover:decoration-[#e6d15a] underline-offset-4 transition-all pb-6"
      >
        Create first note
      </a>
    </div>
  );
}

// ── Default export (backward-compat) ─────────────────────────────────────────
export default function QuestionsSolvedAndNotes() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2">
        <QuestionsChart />
      </div>
      <NotesCard />
    </div>
  );
}
