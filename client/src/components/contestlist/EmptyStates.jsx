import { Clock, Calendar, Trophy } from "lucide-react";

export function NoLiveContest() {
  return (
    <div className="bg-card-dark border border-white/5 rounded-2xl p-12 text-center">
      <Clock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-white mb-2">No Active Contests</h3>
      <p className="text-slate-400 mb-6">
        There are no live contests at the moment. Check out upcoming challenges!
      </p>
      <a href="#upcoming" className="text-accent-yellow font-bold hover:underline">
        View Upcoming
      </a>
    </div>
  );
}

export function NoHeroContests() {
  return (
    <div className="bg-card-dark border border-white/5 rounded-2xl p-8 lg:p-10 min-h-[350px] flex flex-col items-center justify-center text-center">
      <Trophy className="w-20 h-20 text-slate-600 mx-auto mb-6" />
      <h3 className="text-2xl font-bold text-white mb-3">No Contests Available</h3>
      <p className="text-slate-400 max-w-md">
        There are no live or upcoming contests at the moment. Check back later for new challenges!
      </p>
    </div>
  );
}

export function NoUpcomingContests() {
  return (
    <div className="bg-card-dark/50 border border-dashed border-white/10 rounded-2xl p-8 text-center">
      <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
      <p className="text-slate-500">No upcoming contests scheduled</p>
    </div>
  );
}

export function NoPastContests() {
  return (
    <div className="text-center py-8 text-slate-500">
      <p>No past contests to display</p>
    </div>
  );
}
