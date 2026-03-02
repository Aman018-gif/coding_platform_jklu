// Loading Skeleton Components
export function LiveContestSkeleton() {
  return (
    <div className="bg-card-dark border border-white/5 rounded-2xl p-8 lg:p-10 animate-pulse">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-4 max-w-2xl">
          <div className="bg-white/10 rounded h-12 w-3/4" />
          <div className="flex flex-wrap gap-6">
            <div className="bg-white/10 rounded h-5 w-32" />
            <div className="bg-white/10 rounded h-5 w-32" />
            <div className="bg-white/10 rounded h-5 w-32" />
          </div>
        </div>
        <div className="bg-accent-yellow/20 rounded-xl h-16 w-48" />
      </div>
    </div>
  );
}

export function ContestCardSkeleton() {
  return (
    <div className="bg-card-dark border border-white/5 rounded-2xl p-6 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="bg-white/10 rounded-lg p-2 w-10 h-10" />
        <div className="bg-white/10 rounded h-4 w-24" />
      </div>
      <div className="bg-white/10 rounded h-6 w-3/4 mb-2" />
      <div className="flex gap-2 mb-6">
        <div className="bg-white/10 rounded h-5 w-24" />
        <div className="bg-white/10 rounded h-5 w-20" />
      </div>
      <div className="bg-white/5 rounded h-8 w-full mt-4" />
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="bg-card-dark border border-white/5 rounded-2xl overflow-hidden">
      <div className="animate-pulse p-4 space-y-3">
        <div className="bg-white/10 rounded h-8 w-full" />
        <div className="bg-white/10 rounded h-8 w-full" />
        <div className="bg-white/10 rounded h-8 w-full" />
      </div>
    </div>
  );
}
