import React, { useState, useEffect } from "react";
import MainLayout from "../layout/MainLayout";
import { Plus, X, Users, Activity, Clock } from "lucide-react";
import api from "../api/client";
import { toast } from "react-toastify";

// Helper to extract initials
const getInitials = (name) => {
  if (!name) return "?";
  return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
};

// Colors for the banners to give variety
const BANNER_COLORS = [
  "from-blue-600 to-blue-800",
  "from-purple-600 to-purple-800",
  "from-emerald-600 to-emerald-800",
  "from-rose-600 to-rose-800",
  "from-amber-600 to-amber-800"
];

// Mock Due Assignments for the timeline
const MOCK_ASSIGNMENTS = [
  { id: 1, title: "Graph Algorithms Problem Set", course: "Data Structures", date: "Tomorrow, 11:59 PM", color: "bg-blue-500" },
  { id: 2, title: "React Components Lab", course: "Web Dev", date: "Friday, 5:00 PM", color: "bg-purple-500" },
  { id: 3, title: "Midterm Project Proposal", course: "Software Engineering", date: "Next Monday", color: "bg-emerald-500" }
];

export default function StudentClassDashboard() {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get("/classes");
      setClasses(data.classes || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load classes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinClass = async (e) => {
    e.preventDefault();
    if (!joinCode || joinCode.length < 6) {
      toast.error("Please enter a valid 6-7 character join code.");
      return;
    }

    try {
      setIsJoining(true);
      await api.post("/classes/join", { joinCode: joinCode.toUpperCase() });
      toast.success("Successfully joined the class!");
      setIsJoinModalOpen(false);
      setJoinCode("");
      fetchClasses();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to join class");
    } finally {
      setIsJoining(false);
    }
  };

  const handleJoinCodeChange = (e) => {
    const val = e.target.value.toUpperCase();
    if (val.length <= 7) {
      setJoinCode(val);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">My Classes</h1>
            <p className="text-zinc-400 mt-1">View and manage your enrolled classes.</p>
          </div>
          <button 
            onClick={() => setIsJoinModalOpen(true)}
            className="flex items-center gap-2 bg-brand-yellow text-bg-dark px-5 py-2.5 rounded-xl font-semibold hover:bg-yellow-400 transition-colors shadow-lg"
          >
            <Plus size={18} />
            Join a Class
          </button>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            <div className="col-span-full text-center py-12 text-zinc-500">Loading classes...</div>
          ) : (
            <>
              {classes.map((cls, idx) => {
                const colorClass = BANNER_COLORS[idx % BANNER_COLORS.length];
                // Mock a due status randomly or based on index for visual variety
                const hasDue = idx % 2 === 0; 

                return (
                  <div key={cls._id} className="bg-card-dark rounded-2xl overflow-hidden border border-white/10 flex flex-col hover:border-white/20 transition-all shadow-xl group relative">
                    
                    {/* Banner */}
                    <div className={`h-28 bg-gradient-to-br ${colorClass} relative overflow-hidden p-4 flex flex-col justify-end`}>
                      {/* Geometric Pattern Overlay */}
                      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
                      
                      <h3 className="text-lg font-bold text-white relative z-10 truncate leading-tight">{cls.name}</h3>
                      <p className="text-white/80 text-sm font-medium relative z-10 truncate">{cls.branch} • {cls.year}</p>
                      
                      {/* Teacher Avatar positioned at banner edge */}
                      <div className="absolute -bottom-6 right-4 w-12 h-12 rounded-full bg-slate-800 border-4 border-card-dark flex items-center justify-center shadow-lg z-20">
                        <span className="text-white font-bold text-sm tracking-wider">
                          {getInitials(cls.teacher?.name)}
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-5 pt-8 flex flex-col gap-4 flex-1">
                      
                      {/* Stats row */}
                      <div className="flex items-center gap-4 text-sm text-zinc-400">
                        <div className="flex items-center gap-1.5" title="Enrolled Students">
                          <Users size={15} />
                          <span>{cls.students?.length || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5" title="Status">
                          <Activity size={15} />
                          <span>Active</span>
                        </div>
                      </div>

                      {/* Due Badge */}
                      <div className="mt-auto">
                        {hasDue ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-medium border border-red-500/20">
                            <Clock size={12} />
                            Due soon
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-500/10 text-zinc-400 text-xs font-medium border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                            No assignments due
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* "+" Placeholder Card */}
              <div 
                onClick={() => setIsJoinModalOpen(true)}
                className="h-[240px] rounded-2xl border-2 border-dashed border-white/10 hover:border-brand-yellow/50 hover:bg-brand-yellow/5 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all group"
              >
                <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform group-hover:bg-brand-yellow/20">
                  <Plus size={24} className="text-zinc-400 group-hover:text-brand-yellow transition-colors" />
                </div>
                <span className="text-sm font-medium text-zinc-400 group-hover:text-brand-yellow transition-colors">Join another class</span>
              </div>
            </>
          )}
        </div>

        {/* Due Soon Section (Timeline) */}
        <section className="pt-8 border-t border-white/5">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Clock className="text-brand-yellow" size={20} />
            Due Soon
          </h2>
          
          <div className="bg-card-dark rounded-2xl border border-white/10 p-6">
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
              
              {MOCK_ASSIGNMENTS.map((assignment, i) => (
                <div key={assignment.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  
                  {/* Timeline Dot */}
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-card-dark ${assignment.color} shadow-lg shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10`}>
                    <Clock size={16} className="text-white" />
                  </div>
                  
                  {/* Card */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-white/5 bg-bg-dark shadow-sm hover:border-white/20 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold uppercase tracking-wider ${assignment.color.replace('bg-', 'text-')}`}>
                        {assignment.course}
                      </span>
                      <span className="text-xs text-zinc-400 bg-white/5 px-2 py-0.5 rounded-full">{assignment.date}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-white">{assignment.title}</h4>
                  </div>

                </div>
              ))}
            </div>
          </div>
        </section>

      </div>

      {/* Join Class Modal */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div 
            className="bg-card-dark w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-bg-dark/50">
              <h3 className="text-lg font-bold text-white">Join class</h3>
              <button 
                onClick={() => setIsJoinModalOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleJoinClass} className="p-6">
              <div className="mb-6">
                <p className="text-sm text-zinc-400 mb-4">
                  Ask your teacher for the class code, then enter it here.
                </p>
                <div className="bg-bg-dark rounded-xl p-4 border border-white/5 focus-within:border-brand-yellow/50 transition-colors">
                  <label htmlFor="joinCode" className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                    Class Code
                  </label>
                  <input
                    id="joinCode"
                    type="text"
                    value={joinCode}
                    onChange={handleJoinCodeChange}
                    placeholder="e.g. 5DF3A2"
                    className="w-full bg-transparent border-none p-0 text-xl font-mono text-white placeholder-zinc-700 focus:ring-0 uppercase tracking-widest outline-none"
                    maxLength={7}
                    autoComplete="off"
                    autoFocus
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsJoinModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isJoining || joinCode.length < 6}
                  className="px-5 py-2 bg-brand-yellow text-bg-dark rounded-xl text-sm font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isJoining ? "Joining..." : "Join"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
