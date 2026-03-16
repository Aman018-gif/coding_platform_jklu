import { Users, Calendar, Blocks, CheckCircle, Loader2 } from "lucide-react";
import { useCountdown } from "../../hooks/useCountdown";

export default function UpcomingContestCard({
  contest,
  currentUser,
  onRegister,
  registeringId,
}) {
  const { formatTime, isExpired } = useCountdown(contest.start_time);
  const isRegistered = contest.participants?.some(
    (p) => p === currentUser?._id || p._id === currentUser?._id,
  );
  const isRegistering = registeringId === contest._id;

  // Get appropriate icon
  const IconComponent = contest.problems?.length > 0 ? Blocks : Calendar;

  return (
    <div className="bg-card-dark border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:-translate-y-1 transition-all hover:border-accent-yellow/30">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="bg-white/5 rounded-lg p-2 text-accent-yellow flex items-center justify-center">
            <IconComponent className="w-5 h-5" />
          </div>
          <div className="flex items-center h-7">
            <span className="text-slate-500 text-xs font-bold uppercase">
              {isRegistered ? (
                <span className="flex items-center gap-1 text-slate-500">
                  Starts in {formatTime(false)}
                </span>
              ) : isExpired ? (
                <span className="text-red-500">Starting soon</span>
              ) : (
                `Starts in ${formatTime(false)}`
              )}
            </span>
          </div>
        </div>
        <h4 className="text-xl font-bold text-white mb-2">{contest.name}</h4>
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-1 text-xs bg-white/5 text-slate-300 px-2 py-1 rounded font-bold uppercase">
            <Users className="w-[1rem] h-[1rem] text-accent-yellow "/>{contest.participants?.length || 0} Registered
          </div>
          <div className="flex items-center gap-1 text-xs bg-white/5 text-slate-300 px-2 py-1 rounded font-bold uppercase">
            <Blocks className="w-[1rem] h-[1rem] text-accent-yellow "/>{contest.problems?.length || 0} Problems
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        {isRegistered ? (
          <span className="flex items-center gap-1.5 text-green-400 text-xs font-black uppercase tracking-wider">
            <CheckCircle className="w-4 h-4" /> Registered
          </span>
        ) : (
          <button
            onClick={() => onRegister(contest._id)}
            disabled={isRegistering || isExpired}
            className="px-4 py-2 bg-white/5 hover:bg-brand-yellow hover:text-black text-white text-xs font-bold rounded-lg border border-white/10 transition-colors uppercase"
          >
            {isRegistering ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Registering...
              </>
            ) : isExpired ? (
              "Registration Closed"
            ) : (
              "Register Now"
            )}
          </button>
        )}
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-xs font-bold text-accent-yellow">
            {new Date(contest.start_time).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
          <span className="text-slate-600 text-[10px]">•</span>
          <span className="text-xs text-slate-400 font-medium">
            {new Date(contest.start_time).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
