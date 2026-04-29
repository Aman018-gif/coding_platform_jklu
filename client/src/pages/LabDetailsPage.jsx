import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import { 
  FileText, 
  Clock, 
  ChevronRight, 
  CheckCircle2, 
  Circle, 
  ArrowLeft,
  BookOpen
} from "lucide-react";
import api from "../api/client";
import { toast } from "react-toastify";

// Helper to format dates
const formatDateTime = (dateString) => {
  if (!dateString) return "No deadline";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getDifficultyColor = (difficulty) => {
  switch (difficulty?.toUpperCase()) {
    case "EASY": return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
    case "MEDIUM": return "text-amber-400 bg-amber-400/10 border-amber-400/20";
    case "HARD": return "text-red-400 bg-red-400/10 border-red-400/20";
    default: return "text-zinc-400 bg-zinc-400/10 border-zinc-400/20";
  }
};

export default function LabDetailsPage() {
  const { classId, labId } = useParams();
  const navigate = useNavigate();
  
  const [lab, setLab] = useState(null);
  const [classDetails, setClassDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    fetchLabDetails();
  }, [labId]);

  const fetchLabDetails = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/labs/${labId}`);
      setLab(res.data.lab);
      
      // Fetch class details for breadcrumbs/context if needed
      const classRes = await api.get(`/classes/${classId}`);
      setClassDetails(classRes.data.classDetails);

      // Fetch user's submissions for these problems to show status
      const subRes = await api.get("/submissions", { params: { lab_id: labId } });
      setSubmissions(subRes.data.submissions || []);

    } catch (error) {
      console.error("Error fetching lab details:", error);
      toast.error(error.response?.data?.message || "Failed to load lab details");
    } finally {
      setIsLoading(false);
    }
  };

  const getProblemStatus = (problemId) => {
    const problemSubmissions = submissions.filter(s => s.problem_id === problemId || s.problem_id?._id === problemId);
    if (problemSubmissions.some(s => s.status === "Accepted")) return "Accepted";
    if (problemSubmissions.length > 0) return "Attempted";
    return "Pending";
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin"></div>
            <div className="text-zinc-400 font-medium">Loading lab details...</div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!lab) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
            <FileText className="text-zinc-600" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Lab not found</h2>
          <p className="text-zinc-400 max-w-md mb-8">The lab you're looking for might have been removed or is no longer visible.</p>
          <button 
            onClick={() => navigate(`/class/${classId}`)}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-6 py-2.5 rounded-xl transition-all border border-white/10"
          >
            <ArrowLeft size={18} />
            Back to Class
          </button>
        </div>
      </MainLayout>
    );
  }

  const isOverdue = lab.deadline && new Date(lab.deadline) < new Date();
  const solvedCount = lab.questions?.filter(q => getProblemStatus(q._id) === "Accepted").length || 0;
  const totalCount = lab.questions?.length || 0;
  const progress = totalCount > 0 ? (solvedCount / totalCount) * 100 : 0;

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-zinc-500 mb-8 overflow-x-auto whitespace-nowrap pb-2">
          <Link to="/my-classes" className="hover:text-white transition-colors">My Classes</Link>
          <ChevronRight size={14} />
          <Link to={`/class/${classId}`} className="hover:text-white transition-colors truncate max-w-[150px]">
            {classDetails?.name || "Class"}
          </Link>
          <ChevronRight size={14} />
          <span className="text-zinc-300 font-medium truncate max-w-[200px]">{lab.title}</span>
        </nav>

        {/* Header Section */}
        <div className="bg-card-dark border border-white/10 rounded-2xl p-6 sm:p-8 mb-8 shadow-xl relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-yellow/10 flex items-center justify-center">
                  <BookOpen className="text-brand-yellow" size={24} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">{lab.title}</h1>
                  <p className="text-zinc-400 text-sm font-medium">{classDetails?.name} • {classDetails?.branch}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isOverdue ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-white/5 border-white/10 text-zinc-400'}`}>
                  <Clock size={14} />
                  <span>Due {formatDateTime(lab.deadline)}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <FileText size={14} />
                  <span>{totalCount} Problems</span>
                </div>
              </div>
            </div>

            <div className="md:text-right space-y-2 min-w-[200px]">
              <div className="flex items-center justify-between md:justify-end gap-4 text-sm mb-1">
                <span className="text-zinc-400 font-medium">Completion Progress</span>
                <span className="text-white font-bold">{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-brand-yellow to-yellow-500 transition-all duration-1000 ease-out" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold pt-1">
                {solvedCount} of {totalCount} tasks completed
              </p>
            </div>
          </div>
        </div>

        {/* Problems List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
            <FileText className="text-brand-yellow" size={20} />
            Assigned Problems
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {lab.questions?.length === 0 ? (
              <div className="bg-card-dark border border-white/10 rounded-2xl p-12 text-center">
                <p className="text-zinc-500">No problems have been added to this lab yet.</p>
              </div>
            ) : (
              lab.questions.map((problem, index) => {
                const status = getProblemStatus(problem._id);
                return (
                  <div 
                    key={problem._id}
                    onClick={() => navigate(`/problems/${problem._id}?lab=${labId}&class=${classId}`)}
                    className="group bg-card-dark border border-white/10 rounded-2xl p-5 sm:p-6 hover:border-brand-yellow/30 hover:bg-white/[0.02] transition-all cursor-pointer flex items-center gap-4 sm:gap-6 shadow-lg"
                  >
                    <div className="hidden sm:flex w-10 h-10 rounded-xl bg-white/5 items-center justify-center text-zinc-500 font-bold group-hover:text-brand-yellow transition-colors shrink-0">
                      {index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <h3 className="text-lg font-bold text-white group-hover:text-brand-yellow transition-colors truncate">
                          {problem.title}
                        </h3>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getDifficultyColor(problem.difficulty)}`}>
                            {problem.difficulty}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-zinc-500">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 size={14} className={status === "Accepted" ? "text-emerald-400" : "text-zinc-600"} />
                          <span className={status === "Accepted" ? "text-emerald-400 font-medium" : ""}>
                            {status === "Accepted" ? "Solved" : status === "Attempted" ? "Attempted" : "Not started"}
                          </span>
                        </div>
                        <div className="h-1 w-1 rounded-full bg-zinc-700"></div>
                        <span>10 Points</span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {status === "Accepted" ? (
                        <div className="w-10 h-10 rounded-full bg-emerald-400/10 flex items-center justify-center text-emerald-400 border border-emerald-400/20">
                          <CheckCircle2 size={20} />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-600 group-hover:bg-brand-yellow group-hover:text-bg-dark transition-all">
                          <ChevronRight size={20} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Lab Instructions/Policy */}
        <div className="mt-12 bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Lab Instructions</h3>
          <ul className="space-y-3 text-sm text-zinc-500 list-disc pl-5">
            <li>Ensure all test cases pass before final submission.</li>
            <li>Solutions must be your own original work. Plagiarism is strictly prohibited.</li>
            <li>You can submit multiple times before the deadline. The last accepted submission will be considered.</li>
            <li>Reach out to your instructor if you face any technical difficulties with the platform.</li>
          </ul>
        </div>

      </div>
    </MainLayout>
  );
}
