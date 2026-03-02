import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export default function PastContestRow({ contest, currentUser }) {
  const participated = contest.participants?.some(
    (p) => p === currentUser?._id || p._id === currentUser?._id
  );

  return (
    <tr className="group hover:bg-white/[0.02] transition-colors">
      <td className="px-8 py-3">
        <div className="font-bold text-white">{contest.name}</div>
      </td>
      <td className="px-8 text-slate-300 text-sm py-3">
        {new Date(contest.start_time).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </td>
      <td className="px-8 text-center py-3">
        <Link
          to={`/contests/${contest._id}/leaderboard`}
          className="text-accent-yellow hover:underline text-sm font-bold inline-flex items-center gap-1"
        >
          View Board <ArrowUpRight className="w-3 h-3" />
        </Link>
      </td>
      <td className="px-8 py-3">
        {participated ? (
          <div className="flex items-center gap-3">
            <span className="text-white font-black">Participated</span>
            <span className="text-green-500 text-xs font-bold px-2 py-0.5 bg-green-500/10 rounded">
              Completed
            </span>
          </div>
        ) : (
          <div className="text-slate-500 italic text-sm">Did not participate</div>
        )}
      </td>
      <td className="px-8 text-right py-3">
        <Link
          to={`/contests/${contest._id}`}
          className="bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-tighter px-4 py-2 rounded-lg transition-colors inline-block"
        >
          Upsolve
        </Link>
      </td>
    </tr>
  );
}
