import { Link } from "react-router-dom";
import { Users, Medal, ChevronRight, Radio } from "lucide-react";
import { useCountdown } from "../../hooks/useCountdown";

export default function LiveContestCard({ contest, currentUser }) {
  const { formatTime } = useCountdown(contest.end_time);
  const isRegistered = contest.participants?.some(
    (p) => p === currentUser?._id || p._id === currentUser?._id,
  );

  return (
    <div className="bg-card-dark border border-accent-yellow/25 rounded-2xl p-[2rem] lg:p-[2.5rem] relative overflow-hidden group hover:bordolors min-h-[10rem] flex flex-col justify-center">
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-[2rem]">
        <div className="space-y-[1rem] max-w-[40rem]">
          {/* Live Now Badge */}
          <div className="flex items-center gap-[0.75rem] mb-[0.5rem]">
            <span className="bg-red-500/10 text-red-500 text-[0.7rem] font-black px-[0.75rem] py-[0.35rem] rounded-full uppercase tracking-tighter flex items-center gap-[0.4rem]">
              <Radio className="w-[0.85rem] h-[0.85rem] animate-pulse" />
              Live Now
            </span>
          </div>

          <h1 className="text-[clamp(1.5rem,4vw,2rem)] lg:text-[2rem] font-black text-white leading-[1.1]">
            {contest.name}
          </h1>

          <div className="flex flex-wrap gap-[1.5rem] pt-[0.5rem]">
            <div className="flex items-center gap-[0.5rem]">
              <Users className="w-[1.25rem] h-[1.25rem] text-accent-yellow" />
              <span className="text-slate-200 font-semibold text-[1rem]">
                {contest.participants?.length || 0}{" "}
                <span className="text-slate-500 font-normal">Participants</span>
              </span>
            </div>

            <div className="flex items-center gap-[0.5rem] border-l border-white/10 pl-[1.5rem]">
              <Medal className="w-[1.25rem] h-[1.25rem] text-accent-yellow" />
              <span className="text-slate-200 font-semibold text-[1rem]">
                {formatTime()}
                <span className="text-slate-500 font-normal ml-[0.25rem]">
                  remaining
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0">
          {isRegistered ? (
            <Link
              to={`/contests/${contest._id}`}
              className="bg-accent-yellow hover:scale-105 transition-transform text-black px-[2.5rem] py-[1.25rem] rounded-xl font-black text-[1.25rem] flex items-center gap-[0.75rem] shadow-[0_0_1.875rem_rgba(236,189,84,0.2)]"
            >
              ENTER CONTEST
              <ChevronRight className="w-[1.5rem] h-[1.5rem]" />
            </Link>
          ) : (
            <div className="text-slate-400 text-[1rem]">
              Registration closed
            </div>
          )}
        </div>
      </div>
    </div>
  );
}