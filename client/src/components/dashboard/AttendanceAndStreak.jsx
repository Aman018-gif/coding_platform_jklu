import { useMemo } from "react";
import { Info } from "lucide-react";

// ── Attendance Card ────────────────────────────────────────────────────────────
export function AttendanceCard({ contests = [], user }) {
  const pastAttendanceContests = useMemo(() => {
    if (!user || !user.group) return [];
    return contests
      .filter((c) => c.markForAttendance && c.participantGroup === user.group)
      .filter((c) => new Date(c.start_time) < new Date())
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
  }, [contests, user]);

  const { attendedCount, missedCount, attendanceDots } = useMemo(() => {
    let attended = 0;
    let missed = 0;
    const dots = pastAttendanceContests.map((c) => {
      const didAttend =
        c.participants?.includes(user?._id) ||
        c.additionalParticipants?.includes(user?._id);
      if (didAttend) attended++;
      else missed++;
      return { id: c._id, name: c.name, attended: didAttend };
    });
    return { attendedCount: attended, missedCount: missed, attendanceDots: dots.slice(-7) };
  }, [pastAttendanceContests, user]);

  const totalCount = pastAttendanceContests.length;
  const attendanceRatio =
    totalCount === 0 ? 100 : Math.round((attendedCount / totalCount) * 100);

  return (
    <div className="bg-card-dark rounded-xl p-6 border border-white/5 flex flex-col items-center shadow-lg h-full">
      <div className="w-full flex justify-between items-center mb-6">
        <h3 className="font-semibold text-sm">Attendance</h3>
        <div className="relative group inline-block">
  <div className="hover:bg-white/10 rounded-full p-2">
    <Info className="w-4 h-4" />
  </div>

  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                  bg-gray-900 text-white text-xs rounded px-2 py-1
                  whitespace-nowrap opacity-0 group-hover:opacity-100">
    Attendance is calculated based on number of coding hour contests
  </div>
</div>
      </div>

      {/* Large % number */}
      <div className="text-5xl text-amber-300 font-bold tracking-tighter mb-4">
        {attendanceRatio}%
      </div>

      {/* Status pill */}
      <div className="w-full bg-zinc-800 border border-white/10 rounded-md p-3 px-4 flex justify-between items-center mb-5">
        <div className="flex items-center gap-2">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              missedCount > 0
                ? "bg-[#FF4D94] shadow-[0_0_5px_#FF4D94]"
                : "bg-green-400 shadow-[0_0_5px_#4ade80]"
            }`}
          />
          <span className="text-white/60 text-xs bg">
            {missedCount > 0 ? `${missedCount} missed` : "Perfect Attendance!"}
          </span>
        </div>
        {missedCount > 0 && (
          <span className="text-[#FF4D94] text-xs font-bold drop-shadow-[0_0_2px_#FF4D94]">
            -{100 - attendanceRatio}%
          </span>
        )}
      </div>

      {/* Timeline dots */}
      <div className="flex gap-2">
        {attendanceDots.length === 0 ? (
          <span className="text-xs text-white/40 italic">No recent contests</span>
        ) : (
          attendanceDots.map((dot, index) => (
            <span
              key={dot.id || index}
              title={dot.name}
              className={`w-2 h-2 rounded-full cursor-help transition-all ${
                dot.attended
                  ? "bg-[#e6d15a] shadow-[0_0_5px_rgba(230,209,90,0.5)] scale-110"
                  : "bg-white/20"
              }`}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ── Streak Card ────────────────────────────────────────────────────────────────
export function StreakCard({ user }) {
  const streakDays = user?.streak || 0;
  const currentDayIndex = new Date().getDay();
  const normalizedToday = currentDayIndex === 0 ? 6 : currentDayIndex - 1;

  return (
    <div className="bg-card-dark rounded-xl p-8 border border-white/5 flex flex-col items-center justify-center shadow-lg h-full">
      {/* Glowing sun icon */}
      <div className="w-20 h-20 rounded-full bg-[#e6d15a]/10 flex items-center justify-center shadow-[0_0_40px_rgba(230,209,90,0.15)] mb-4">
        <div className="w-14 h-14 bg-[#e6d15a] rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(230,209,90,0.6)]">
          <svg className="w-7 h-7 text-[#1a1a1a]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="4" />
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
        </div>
      </div>

      <h2 className="text-4xl font-bold mb-1">{streakDays}</h2>
      <div className="text-[#e6d15a] text-[10px] font-bold tracking-widest uppercase mb-5">
        Day Streak
      </div>

      <div className="flex gap-2 mb-3">
        {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => {
          const isComplete = i <= normalizedToday && streakDays > (normalizedToday - i);
          return (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <span className={`text-[9px] font-bold ${isComplete ? "text-white/80" : "text-white/30"}`}>
                {day}
              </span>
              <div className={`w-7 h-7 rounded flex items-center justify-center transition-all ${
                isComplete ? "bg-[#e6d15a] shadow-[0_0_8px_rgba(230,209,90,0.4)]" : "bg-[#121111] border border-white/5"
              }`}>
                {isComplete && (
                  <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-white/30 text-[10px] text-center">
        {streakDays > 0 ? "Keep it going!" : "Solve a problem to start your streak!"}
      </p>
    </div>
  );
}

// ── Default export (backward-compat) ─────────────────────────────────────────
export default function AttendanceAndStreak({ contests = [], user }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <AttendanceCard contests={contests} user={user} />
      <div className="lg:col-span-2">
        <StreakCard user={user} />
      </div>
    </div>
  );
}
