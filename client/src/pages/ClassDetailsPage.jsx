import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import { 
  Megaphone, 
  BookOpen, 
  MessageCircle, 
  MoreVertical,
  Clock,
  FileText,
  Trophy
} from "lucide-react";
import api from "../api/client";
import { toast } from "react-toastify";
import { Context } from "../main";

// Helper to format dates
const formatDateTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getInitials = (name) => {
  if (!name) return "?";
  return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
};

export default function ClassDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(Context) || {};
  const [activeTab, setActiveTab] = useState("stream");
  const [classDetails, setClassDetails] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [labs, setLabs] = useState([]);
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch all data in parallel for faster load
      const [classRes, annRes, labsRes, examsRes] = await Promise.all([
        api.get(`/classes/${id}`),
        api.get(`/announcements/class/${id}`),
        api.get(`/labs/class/${id}`),
        api.get(`/exams/class/${id}`),
      ]);

      setClassDetails(classRes.data.classDetails);
      setAnnouncements(annRes.data.announcements || []);
      // Filter labs to those created by the teacher of this class when possible
      const fetchedLabs = labsRes.data.labs || [];
      const teacherId = classRes.data?.classDetails?.teacher?.id || classRes.data?.classDetails?.teacher?._id;
      const filteredLabs = fetchedLabs.filter((lab) => {
        const creatorId = lab?.creatorId || lab?.creator?._id || lab?.creator?.id;
        if (teacherId) {
          return creatorId ? String(creatorId) === String(teacherId) : true;
        }
        return true;
      });
      setLabs(filteredLabs);
      setExams(examsRes.data.exams || []);
    } catch (error) {
      console.error("Error fetching class details:", error);
      toast.error(error.response?.data?.message || "Failed to load class data");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-zinc-400">Loading class details...</div>
        </div>
      </MainLayout>
    );
  }

  if (!classDetails) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-zinc-400">Class not found.</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-blue-700 to-blue-900 h-40 shadow-lg mb-6">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          <div className="absolute bottom-0 left-0 p-8 w-full bg-gradient-to-t from-black/60 to-transparent">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">{classDetails.name}</h1>
            <p className="text-xl text-white/90 font-medium">
              {classDetails.branch} • {classDetails.year} • Section {classDetails.section}
            </p>
            {classDetails.teacher?.name && (
              <p className="text-sm text-white/70 mt-1 font-medium">
                Teacher: {classDetails.teacher.name}
              </p>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-white/10 mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("stream")}
              className={`pb-4 px-2 relative font-medium transition-colors ${
                activeTab === "stream" 
                  ? "text-brand-yellow" 
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Stream
              {activeTab === "stream" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-yellow rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("classwork")}
              className={`pb-4 px-2 relative font-medium transition-colors ${
                activeTab === "classwork" 
                  ? "text-brand-yellow" 
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Classwork
              {activeTab === "classwork" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-yellow rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("labexams")}
              className={`pb-4 px-2 relative font-medium transition-colors ${
                activeTab === "labexams" 
                  ? "text-brand-yellow" 
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Lab Exams
              {activeTab === "labexams" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-yellow rounded-t-full" />
              )}
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "stream" && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              <div className="md:col-span-1 hidden md:block">
                <div className="bg-card-dark border border-white/10 rounded-xl p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    Upcoming
                  </h3>
                  {labs.filter(l => new Date(l.deadline) > new Date()).length > 0 ? (
                    <div className="space-y-3">
                      {labs
                        .filter(l => new Date(l.deadline) > new Date())
                        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
                        .slice(0, 3)
                        .map(lab => (
                          <div key={lab._id} className="text-sm group cursor-pointer" onClick={() => navigate(`/class/${id}/labs/${lab._id}`)}>
                            <div className="text-zinc-300 group-hover:text-brand-yellow transition-colors truncate">{lab.title}</div>
                            <div className="text-xs text-zinc-500 mt-0.5">Due {formatDateTime(lab.deadline)}</div>
                          </div>
                      ))}
                      <button 
                        onClick={() => setActiveTab("classwork")}
                        className="text-xs font-semibold text-blue-400 hover:text-blue-300 mt-2 inline-block transition-colors"
                      >
                        View all
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500">Woohoo, no work due soon!</p>
                  )}
                </div>
              </div>

              {/* Right Column (Stream Posts) */}
              <div className="md:col-span-3 space-y-6">
                
                {announcements.length === 0 ? (
                  <div className="bg-card-dark border border-white/10 rounded-xl p-12 text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Megaphone className="text-zinc-500" size={24} />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-1">This is where you'll see class updates</h3>
                    <p className="text-sm text-zinc-400">Your teacher hasn't posted any announcements yet.</p>
                  </div>
                ) : (
                  announcements.map((announcement) => (
                    <div key={announcement._id} className="bg-card-dark border border-white/10 rounded-xl overflow-hidden shadow-sm hover:border-white/20 transition-all">
                      
                      {/* Post Header */}
                      <div className="p-5 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-white">
                            {getInitials(announcement.author_id?.name || classDetails.teacher?.name)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-white">
                              {announcement.author_id?.name || classDetails.teacher?.name}
                            </h3>
                            <button className="text-zinc-500 hover:text-white transition-colors">
                              <MoreVertical size={18} />
                            </button>
                          </div>
                          <p className="text-xs text-zinc-400">{formatDateTime(announcement.createdAt)}</p>
                        </div>
                      </div>
                      
                      {/* Post Body */}
                      <div className="px-5 pb-5">
                        <h4 className="text-md font-medium text-white mb-2">{announcement.title}</h4>
                        <div className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                          {announcement.content}
                        </div>
                      </div>
                      
                      {/* Post Footer (Read-only Comments Section placeholder) */}
                      <div className="bg-bg-dark/50 px-5 py-3 border-t border-white/5 flex items-center gap-3">
                        <MessageCircle size={16} className="text-zinc-500" />
                        <span className="text-xs text-zinc-500 font-medium">Class comments are turned off</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "classwork" && (
            <div className="max-w-4xl mx-auto space-y-4">
              {labs.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="text-zinc-500" size={24} />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-1">No classwork yet</h3>
                  <p className="text-sm text-zinc-400">Assignments and labs will appear here when posted by your teacher.</p>
                </div>
              ) : (
                labs.map((lab) => (
                  <div 
                    key={lab._id} 
                    onClick={() => navigate(`/class/${id}/labs/${lab._id}`)}
                    className="bg-card-dark border border-white/10 rounded-xl p-5 shadow-sm hover:bg-white/5 hover:border-white/20 transition-all cursor-pointer flex items-start sm:items-center gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors">
                      <FileText size={20} className="text-blue-400" />
                    </div>
                    
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-white text-base group-hover:text-blue-400 transition-colors">{lab.title}</h3>
                        <p className="text-sm text-zinc-400 flex items-center gap-1.5 mt-1">
                          <span className="bg-white/10 px-2 py-0.5 rounded text-xs">Lab Work</span>
                        </p>
                      </div>
                      
                      {lab.deadline && (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 bg-bg-dark px-3 py-1.5 rounded-full border border-white/5 shrink-0 whitespace-nowrap">
                          <Clock size={14} />
                          Due {formatDateTime(lab.deadline)}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "labexams" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.length === 0 ? (
                <div className="bg-card-dark border border-white/10 rounded-xl p-6 text-center text-zinc-400 w-full col-span-full">
                  No lab exams posted yet for this course.
                </div>
              ) : (
                exams.map((exam) => (
                  <div
                    key={exam._id}
                    onClick={() => navigate(`/exams/${exam._id}`)}
                    className="bg-card-dark border border-white/10 rounded-xl p-5 shadow-sm cursor-pointer hover:bg-white/5 transition-all group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center">
                        <Trophy size={18} className="text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-white truncate">{exam.name}</h4>
                        <p className="text-xs text-zinc-400 truncate">{exam.description || "Lab exam"}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-zinc-500">
                      <span>
                        Starts {exam.start_time ? new Date(exam.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                      </span>
                      <span>{exam.problems?.length || 0} Problems</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

      </div>
    </MainLayout>
  );
}
