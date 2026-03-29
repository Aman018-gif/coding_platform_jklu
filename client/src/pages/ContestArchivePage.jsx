import { useEffect, useState, useContext, useMemo } from "react";
import { Navigate, Link } from "react-router-dom";
import { ChevronLeft, Search, ChevronRight } from "lucide-react";
import { Context } from "../main";
import api from "../api/client";
import MainLayout from "../layout/MainLayout";
import {
  PastContestRow,
  TableSkeleton,
  NoPastContests,
} from "../components/contestlist";

export default function ContestArchivePage() {
  const { isAuthenticated, user } = useContext(Context);
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch all contests and filter for past ones
  useEffect(() => {
    const fetchArchive = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/contests");
        
        const now = new Date();
        const past = data.contests.filter(
          (contest) => new Date(contest.end_time) < now
        );

        // Sort past contests by start time (most recent first)
        past.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
        
        setContests(past);
      } catch (err) {
        console.error("Failed to load archive:", err);
        setError("Failed to load contest archive. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchArchive();
  }, []);

  // Filter based on search query
  const filteredContests = useMemo(() => {
    if (!searchQuery.trim()) return contests;
    return contests.filter((contest) =>
      contest.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [contests, searchQuery]);

  // Reset to page 1
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredContests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentContests = filteredContests.slice(startIndex, startIndex + itemsPerPage);

  if (!isAuthenticated) return <Navigate to="/auth" />;

  return (
    <MainLayout>
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Link 
              to="/contests" 
              className="text-muted hover:text-white text-sm font-medium flex items-center gap-1 mb-4 w-fit transition-colors"
            >
              <ChevronLeft size={16} /> Back to Contests
            </Link>
            <h1 className="text-3xl font-bold text-white tracking-tight">Contest Archive</h1>
            <p className="text-sm text-muted mt-1">
              Review past problems, view final standings, and analyze your performance.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search past contests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card-dark border border-card-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-muted focus:outline-none focus:border-brand-yellow/50 transition-colors"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Archive Table */}
        <section>
          {loading ? (
            <TableSkeleton />
          ) : filteredContests.length > 0 ? (
            <div className="bg-card-dark border border-card-border rounded-xl overflow-hidden flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-card-border">
                      <th className="px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Contest Name</th>
                      <th className="px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Date</th>
                      <th className="px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider text-center">Final Standings</th>
                      <th className="px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Personal Result</th>
                      <th className="px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border">
                    {/* Render current slice of contests instead of the full filtered array */}
                    {currentContests.map((contest) => (
                      <PastContestRow
                        key={contest._id}
                        contest={contest}
                        currentUser={user}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Controls Footer */}
              <div className="px-5 py-4 border-t border-card-border bg-white/[0.02] flex items-center justify-between mt-auto">
                <span className="text-xs text-muted">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredContests.length)} of {filteredContests.length} entries
                </span>
                
                {/* Only show buttons if there's more than 1 page */}
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-md border border-card-border text-muted hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    
                    <span className="text-xs font-medium text-white px-2">
                      Page {currentPage} of {totalPages}
                    </span>
                    
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded-md border border-card-border text-muted hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-card-dark border border-card-border rounded-xl p-12 text-center">
              {searchQuery ? (
                <>
                  <p className="text-white font-medium mb-1">No matches found</p>
                  <p className="text-muted text-sm">We couldn&apos;t find any past contests matching &quot;{searchQuery}&quot;</p>
                </>
              ) : (
                <NoPastContests />
              )}
            </div>
          )}
        </section>
      </main>
    </MainLayout>
  );
}