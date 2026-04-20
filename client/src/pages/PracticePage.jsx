import React, { useEffect, useState, useContext } from "react";
import { Link, Navigate } from "react-router-dom";
import { Context } from "../main";
import api from "../api/client";
import MainLayout from "../layout/MainLayout";
import { TableSkeleton } from "../components/contestlist/Skeletons";
import { Play, Code2, ChevronLeft, ChevronRight } from "lucide-react";

const difficultyClasses = {
  easy: "bg-emerald-400/20 text-emerald-400 border border-emerald-400/20",
  medium: "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20",
  hard: "bg-red-400/20 text-red-400 border border-red-400/20",
};

export default function PracticePage() {
  const { isAuthenticated } = useContext(Context);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await api.get("/problems");
        setProblems(data.problems || []);
        // .filter((p) => !p.contest_id));
      } catch {
        setError("Failed to fetch problems");
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  if (!isAuthenticated) return <Navigate to="/auth" />;
  if (error) return <p className="text-red-400 p-8">{error}</p>;

  // Pagination Logic
  const totalPages = Math.ceil(problems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProblems = problems.slice(startIndex, startIndex + itemsPerPage);

  return (
    <MainLayout>
      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Practice</h1>
            <p className="text-sm text-muted mt-1">
              Solve problems to sharpen your skills
            </p>
          </div>
          {!loading && (
            <span className="text-sm text-muted">
              <span className="text-white font-semibold">{problems.length}</span> problems
            </span>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <TableSkeleton />
        ) : problems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Code2 className="w-12 h-12 text-muted mb-4" />
            <p className="text-lg font-medium text-white mb-1">No practice problems yet</p>
            <p className="text-sm text-muted">Try Challenges or Contests.</p>
          </div>
        ) : (
          <div className="bg-card-dark border border-card-border rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-card-border">
                  <th className="px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider w-12 text-center">#</th>
                  <th className="px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider w-80">Title</th>
                  <th className="px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider w-28">Difficulty</th>
                  <th className="px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider w-32">Category</th>
                  <th className="px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider w-20 text-right">Solve</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {currentProblems.map((p, idx) => {
                  const difficulty = (p.difficulty || "medium").toLowerCase();
                  return (
                    <tr
                      key={p._id}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      {/* Index */}
                      <td className="px-5 py-4 text-center text-sm text-muted">
                        {startIndex + idx + 1}
                      </td>

                      {/* Title + description */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-white group-hover:text-yellow-400 transition-colors">
                          {p.title}
                        </p>
                        {/* {p.description && (
                          <p className="text-xs text-muted line-clamp-1 mt-0.5">
                            {p.description}
                          </p>
                        )} */}
                      </td>

                      {/* Difficulty badge */}
                      <td className="px-5 py-4">
                        <span className={`text-[11px] font-bold px-2 py-1 rounded ${difficultyClasses[difficulty] ?? difficultyClasses.medium}`}>
                          {p.difficulty || "MEDIUM"}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-4">
                        {p.category ? (
                          <span className="text-xs text-muted">
                            {p.category}
                          </span>
                        ) : (
                          <span className="text-xs text-muted">—</span>
                        )}
                      </td>

                      {/* Solve button */}
                      <td className="px-5 py-4 text-right">
                        <Link
                          to={`/problems/${p._id}`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-card-border text-muted hover:bg-brand-yellow hover:text-black transition-all"
                        >
                          <Play className="w-3.5 h-3.5 ml-0.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination Controls Footer */}
            <div className="px-5 py-4 border-t border-card-border bg-white/[0.02] flex items-center justify-between mt-auto">
              <span className="text-xs text-muted">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, problems.length)} of {problems.length} entries
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
        )}
      </main>
    </MainLayout>
  );
}