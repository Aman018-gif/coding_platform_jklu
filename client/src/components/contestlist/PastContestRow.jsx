import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export default function PastContestRow({ contest, currentUser }) {
  const participated = contest.participants?.some(
    (p) => p === currentUser?._id || p._id === currentUser?._id
  );

  return (
    <tr className="group hover:bg-white/[0.02] transition-colors">
      <td className="px-5 py-4">
        <div className="font-bold text-white">{contest.name}</div>
      </td>
      <td className="px-5 text-muted text-sm py-4">
        {new Date(contest.start_time).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </td>
      <td className="px-5 text-center py-4">
        <Link
          to={`/contests/${contest._id}/leaderboard`}
          className="text-muted hover:underline hover:text-brand-yellow text-sm font-bold inline-flex items-center gap-1"
        >
          View Board <ArrowUpRight className="w-3 h-3" /> 
        </Link>
      </td>
      <td className="px-5 py-4">
        {participated ? (
          <div className="flex items-center gap-3">
            <span className="text-muted font-bold">Participated</span>
            {/* <span className="text-green-500 text-xs font-bold px-2 py-0.5 bg-green-500/10 rounded">
              Completed
            </span> */}
          </div>
        ) : (
          <div className="text-slate-400 italic text-sm">Did not participate</div>
        )}
      </td>
      <td className="px-5 text-right py-4">
        <Link
          to={`/contests/${contest._id}`}
          className="px-2 py-1 bg-white/5 hover:bg-brand-yellow hover:text-black text-white text-xs font-bold rounded-lg border border-card-border transition-colors uppercase inline-block tracking-tighter"
        >
          Upsolve
        </Link>
      </td>
    </tr>
  );
}
