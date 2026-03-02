import { Calendar, Blocks, CheckCircle, Loader2, ChevronRight } from "lucide-react";
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
  // const IconComponent = contest.problems?.length > 0 ? Blocks : Calendar;

  return (
    <div className="bg-card-dark border border-white/5 rounded-2xl p-[2rem] lg:p-[2.5rem] relative overflow-hidden group hover:bordolors min-h-[10rem] flex flex-col justify-center">
      {/* <div className="absolute top-0 right-0 p-[1.5rem] opacity-10 group-hover:opacity-20 transition-opacity">
        <IconComponent className="w-[7rem] h-[7rem] text-accent-yellow" />
      </div> */}

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-[1.5rem]">
        {/* Left content */}
        <div className="space-y-[0.75rem] max-w-[35rem]">
          {/* Status badges */}
          <div className="flex items-center gap-[0.75rem] mb-[0.5rem]">
            <span className="bg-accent-yellow/10 text-accent-yellow text-[0.7rem] font-black px-[0.75rem] py-[0.35rem] rounded-full uppercase tracking-tighter flex items-center gap-[0.4rem]">
              <Calendar className="w-[0.85rem] h-[0.85rem]" />
              Upcoming
            </span>
            {isRegistered && (
              <span className="bg-green-500/10 text-green-500 text-[0.7rem] font-black px-[0.75rem] py-[0.35rem] rounded-full uppercase tracking-tighter flex items-center gap-[0.4rem]">
                <CheckCircle className="w-[0.85rem] h-[0.85rem]" />
                Registered
              </span>
            )}
          </div>

          <h1 className="text-[clamp(1.5rem,4vw,2rem)] font-black text-white leading-[1.1]">
            {contest.name}
          </h1>

          {/* Contest details - Scaled icons/text */}
          <div className="flex flex-wrap gap-[1.25rem] pt-[0.25rem]">
            <div className="flex items-center gap-[0.4rem]">
              <Calendar className="w-[1.1rem] h-[1.1rem] text-accent-yellow" />
              <span className="text-slate-200 font-semibold text-[0.9rem]">
                {isExpired ? "Starting soon" : `Starts in ${formatTime(false)}`}
              </span>
            </div>
            
            <div className="flex items-center gap-[0.4rem] border-l border-white/10 pl-[1.25rem]">
              <Blocks className="w-[1.1rem] h-[1.1rem] text-accent-yellow" />
              <span className="text-slate-200 font-semibold text-[0.9rem]">
                {contest.problems?.length || 0}{" "}
                <span className="text-slate-500 font-normal">Problems</span>
              </span>
            </div>

            <div className="flex items-center gap-[0.4rem] border-l border-white/10 pl-[1.25rem]">
              <span className="text-slate-200 font-semibold text-[0.9rem]">
                {contest.participants?.length || 0}{" "}
                <span className="text-slate-500 font-normal">Registered</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right side - Action Area */}
        <div className="flex-shrink-0">
          {isRegistered ? (
            <div className="bg-green-500/5 border border-green-500/20 text-green-500 px-[2rem] py-[1rem] rounded-xl font-black text-[1rem] flex items-center gap-[0.5rem] uppercase tracking-wider">
              <CheckCircle className="w-[1.25rem] h-[1.25rem]" />
              Registered
            </div>
          ) : (
            <button
              onClick={() => onRegister(contest._id)}
              disabled={isRegistering || isExpired}
              /* Standardized Button Scaling */
              className="bg-accent-yellow hover:scale-105 active:scale-95 transition-all text-black px-[2rem] py-[1rem] rounded-xl font-black text-[1rem] flex items-center gap-[0.5rem] shadow-[0_0_1.5rem_rgba(236,189,84,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRegistering ? (
                <>
                  <Loader2 className="w-[1.25rem] h-[1.25rem] animate-spin" />
                  REGISTERING...
                </>
              ) : isExpired ? (
                "REGISTRATION CLOSED"
              ) : (
                <>
                  REGISTER NOW
                  <ChevronRight className="w-[1.25rem] h-[1.25rem]" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}