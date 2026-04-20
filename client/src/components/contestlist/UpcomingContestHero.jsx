import { Users, Calendar, CheckCircle, Loader2, ChevronRight } from "lucide-react";
import { useCountdown } from "../../hooks/useCountdown";

export default function UpcomingContestHero({
  contest,
  currentUser,
  onRegister,
  registeringId,
}) {
  const { formatTime, isExpired } = useCountdown(contest.start_time);
  const isRegistered = contest.participants?.some(
    (p) => p === currentUser?._id || p._id === currentUser?._id
  );
  const isRegistering = registeringId === contest._id;

  return (
    <div className="bg-card-dark border border-white/5 rounded-xl p-[1.25rem] lg:p-[1.75rem] relative overflow-hidden group hover:border-white/10 transition-colors min-h-[8rem] flex flex-col justify-center">
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-[1rem]">
        {/* Left content */}
        <div className="space-y-[0.75rem] max-w-[30rem]">
          {/* Status badges */}
          <div className="flex items-center gap-[0.5rem] mb-[0.25rem]">
            <span className="bg-accent-yellow/10 text-accent-yellow text-[0.65rem] font-black px-[0.6rem] py-[0.25rem] rounded-full uppercase tracking-tight flex items-center gap-[0.3rem]">
              <Calendar className="w-[0.75rem] h-[0.75rem]" />
              Upcoming
            </span>
            {isRegistered && (
              <span className="bg-green-500/10 text-green-500 text-[0.65rem] font-black px-[0.6rem] py-[0.25rem] rounded-full uppercase tracking-tight flex items-center gap-[0.3rem]">
                <CheckCircle className="w-[0.75rem] h-[0.75rem]" />
                Registered
              </span>
            )}
          </div>

          {/* Scaled down title */}
          <h1 className="text-[clamp(1.25rem,3vw,1.75rem)] font-black text-white leading-tight">
            {contest.name}
          </h1>

          {/* Contest details */}
          <div className="flex flex-wrap gap-[1rem] pt-[0.1rem]">
            <div className="flex items-center gap-[0.35rem]">
              <Calendar className="w-[1.1rem] h-[1.1rem] text-accent-yellow" />
              <span className="text-slate-200 font-semibold text-[0.85rem]">
                {isExpired ? "Starting soon" : `Starts in ${formatTime(false)}`}
              </span>
            </div>

            <div className="flex items-center gap-[0.35rem] border-l border-white/10 pl-[1rem]">
              <Users className="w-[1.1rem] h-[1.1rem] text-accent-yellow" />
              <span className="text-slate-200 font-semibold text-[0.85rem]">
                {contest.participants?.length || 0}{" "}
                <span className="text-slate-500 font-normal">Registered</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex-shrink-0 lg:mr-[0.5rem]">
          {isRegistered ? (
            <div className="bg-green-500/5 border border-green-500/20 text-green-500 px-[1.5rem] py-[0.75rem] rounded-lg font-black text-[0.9rem] flex items-center justify-center gap-[0.5rem] uppercase tracking-wider">
              <CheckCircle className="w-[1.1rem] h-[1.1rem]" />
              Registered
            </div>
          ) : (
            <button
              onClick={() => onRegister(contest._id)}
              disabled={isRegistering || isExpired}
              className="bg-accent-yellow hover:scale-105 active:scale-95 transition-all text-black px-[1.5rem] py-[0.75rem] rounded-lg font-black text-[0.9rem] flex items-center justify-center gap-[0.5rem] shadow-[0_0_1rem_rgba(236,189,84,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRegistering ? (
                <>
                  <Loader2 className="w-[1.1rem] h-[1.1rem] animate-spin" />
                  REGISTERING...
                </>
              ) : isExpired ? (
                "REGISTRATION CLOSED"
              ) : (
                <>
                  REGISTER NOW
                  <ChevronRight className="w-[1.1rem] h-[1.1rem]" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}