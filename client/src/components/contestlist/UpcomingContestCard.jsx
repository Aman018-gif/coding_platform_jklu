import { Calendar, Blocks, CheckCircle, CalendarClock, Loader2 } from "lucide-react";
import { useCountdown } from "../../hooks/useCountdown";

export default function UpcomingContestCard({
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

  // Get appropriate icon
  const IconComponent = contest.problems?.length > 0 ? Blocks : Calendar;

  return (
    <div className="bg-card-dark border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:-translate-y-1 transition-all hover:border-accent-yellow/30">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="bg-white/5 rounded-lg p-2 text-accent-yellow">
            <IconComponent className="w-5 h-5" />
          </div>
          <span className="text-slate-500 text-xs font-bold uppercase">
            {isRegistered ? (
              <span className="flex items-center gap-1 text-green-500">
                <CheckCircle className="w-4 h-4" /> Registered
              </span>
            ) : isExpired ? (
              <span className="text-red-500">Starting soon</span>
            ) : (
              `Starts in ${formatTime(false)}`
            )}
          </span>
        </div>
        <h4 className="text-xl font-bold text-white mb-2">{contest.name}</h4>
        <div className="flex items-center gap-2 mb-6">
          {/* <span className="text-xs bg-accent-yellow/10 text-accent-yellow px-2 py-1 rounded font-bold uppercase">
            Prize Pool
          </span> */}
          <span className="text-xs bg-white/5 text-slate-300 px-2 py-1 rounded font-bold uppercase">
            {contest.participants?.length || 0} Registered
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        {isRegistered ? (
          <span className="text-slate-400 text-sm font-black uppercase tracking-wider">
            Registered
          </span>
        ) : (
          <button
            onClick={() => onRegister(contest._id)}
            disabled={isRegistering || isExpired}
            className="text-accent-yellow text-sm font-black uppercase tracking-wider flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed hover:underline"
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
        <button className="text-slate-500 hover:text-white transition-colors">
          <CalendarClock className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
