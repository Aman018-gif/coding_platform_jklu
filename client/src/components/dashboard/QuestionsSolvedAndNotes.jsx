import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
          <div className="w-2 h-2 bg-amber-300 rounded-full shadow-[0_0_5px_#e6d15a]"></div>
          <span className="text-zinc-400 text-xs font-medium tracking-wide">Correct</span>
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
                  className="w-3 bg-amber-300 rounded-t-sm transition-all duration-500 relative shadow-[0_0_10px_rgba(230,209,90,0.2)] group-hover:shadow-[0_0_15px_rgba(230,209,90,0.6)] group-hover:bg-[#fceb77]"
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
        <div className="absolute bottom-0 left-0 w-full flex justify-between text-[10px] text-zinc-400 px-8 font-semibold z-20">
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
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const { data } = await api.get("/notes");
        if (data.notes) {
          setNotes(data.notes);
        }
      } catch (err) {
        console.error("Failed to fetch notes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  if (loading) {
    return (
      <div className="bg-card-dark rounded-xl p-6 border border-white/5 flex flex-col items-center justify-center text-center shadow-lg h-full">
        <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="bg-card-dark rounded-xl p-6 border border-white/5 flex flex-col items-center justify-center text-center shadow-lg h-full">
        <div className="w-full flex justify-between items-center mb-auto self-start">
          <h3 className="font-semibold text-sm">My Notes</h3>
          <Link to="/practice" className="w-6 h-6 bg-white/5 hover:bg-white/10 rounded flex items-center justify-center text-white/60 hover:text-white transition-colors pb-0.5 font-bold">
            +
          </Link>
        </div>

        <div className="w-16 h-16 rounded-full border border-white/5 flex items-center justify-center mb-4 mt-6">
          <svg className="w-6 h-6 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <h4 className="font-semibold text-sm mb-1">Nothing Here</h4>
        <p className="text-zinc-500 text-xs leading-relaxed mb-4 max-w-[200px]">
          Start documenting your algorithm logic or contest strategies!
        </p>
        <Link
          to="/practice"
          className="text-amber-300 text-xs font-semibold underline decoration-amber-300/30 hover:decoration-amber-300 underline-offset-4 transition-all pb-6"
        >
          Create first note
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-card-dark rounded-xl p-6 border border-white/5 flex flex-col shadow-lg h-full max-h-80">
      <div className="w-full flex justify-between items-center mb-4 shrink-0">
        <h3 className="font-semibold text-sm">My Notes</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
        {notes.map(note => (
          <div 
            key={note._id}
            onClick={() => {
              if (note.contest_id) {
                navigate(`/contests/${note.contest_id._id}?problem=${note.problem_id?._id}`);
              } else if (note.problem_id) {
                navigate(`/problems/${note.problem_id._id}`);
              }
            }}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors group border border-white/5"
          >
            <h4 className="font-semibold text-xs text-white mb-1 truncate">
              {note.problem_id?.title || "Problem"}
            </h4>
            <p className="text-zinc-400 text-[10px] line-clamp-2 mb-2 whitespace-pre-wrap">
              {note.content}
            </p>
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-zinc-500 font-medium">
                {new Date(note.updatedAt).toLocaleDateString()}
              </span>
              <span className="text-[9px] text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                View →
              </span>
            </div>
          </div>
        ))}
      </div>
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
