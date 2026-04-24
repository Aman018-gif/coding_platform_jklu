import { useContext, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronLeft, Trash2, Loader2 } from "lucide-react";
import clsx from "clsx";
import MainLayout from "../layout/MainLayout";
import { Context } from "../main";
import AddProblemPanel from "../components/AddProblemPanel";
import SectionLabel from "../components/CreateContest/SectionLabel";
import FieldWrapper, {
  inputCls,
} from "../components/CreateContest/FieldWrapper";
import LandingPageTab from "../components/CreateContest/Tabs/LandingPageTab";
import ProblemsTab from "../components/CreateContest/Tabs/ProblemsTab";
import ModeratorsTab from "../components/CreateContest/Tabs/ModeratorsTab";
import ParticipantsTab from "../components/CreateContest/Tabs/ParticipantsTab";
import { useContestForm, TABS } from "../hooks/useContestForm";
import { fetchContestBySlug, fetchMyContests, fetchContestById } from "../api/contestApi";

export default function CreateContestPage() {
  const { user: currentUser } = useContext(Context);
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  
  const {
    form,
    duration,
    activeTab,
    contestCreated,
    savedSlug,
    setSavedSlug,
    savedContestId,
    setSavedContestId,
    problems,
    moderators,
    participantsList,
    panelOpen,
    newProblemId,
    isSubmitting,
    errors,
    showDeleteModal,
    isLoadingParticipants,
    setForm,
    setProblems,
    setModerators,
    setParticipantsList,
    setPanelOpen,
    setActiveTab,
    setContestCreated,
    handlers,
  } = useContestForm(currentUser);

  const { 
    handleFieldChange, 
    handleAddProblem, 
    handleCreateContest, 
    handleUpdateContest,
    handleDeleteContest, 
    confirmDeleteContest, 
    cancelDeleteContest 
  } = handlers;

  useEffect(() => {
    if (showDeleteModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showDeleteModal]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && showDeleteModal) {
        cancelDeleteContest();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [showDeleteModal, cancelDeleteContest]);

  useEffect(() => {
    if (!editId) return;
    const loadContestForEdit = async () => {
      setIsLoadingEdit(true);
      try {
        const contest = await fetchContestById(editId);
        if (contest) {
          const startDate = new Date(contest.start_time);
          const endDate = new Date(contest.end_time);
          setForm({
            name: contest.name || '',
            startDate: startDate.toISOString().split('T')[0] || '',
            startTime: startDate.toTimeString().slice(0, 5) || '',
            endDate: endDate.toISOString().split('T')[0] || '',
            endTime: endDate.toTimeString().slice(0, 5) || '',
            organizer: contest.organizer || '',
            participantGroup: contest.participantGroup || '',
            notifyStart: contest.notifyStart || false,
            notifyResults: contest.notifyResults || false,
            bannerImageURL: contest.bannerImageURL || '',
            description: contest.description || '',
            isPublic: contest.isPublic !== false,
            isDraft: !contest.is_active,
            markForAttendance: contest.markForAttendance || false,
          });
          setSavedSlug(contest.slug);
          setSavedContestId(contest._id);
          setContestCreated(true);
          if (contest.moderators && contest.moderators.length > 0) {
            const mods = contest.moderators.map(m => ({
              name: m.name || m.username || 'Unknown',
              email: m.email || '',
              role: m._id === contest.created_by?.toString() ? 'Owner' : 'Moderator',
              isCurrentUser: m._id === currentUser?._id,
            }));
            setModerators(mods);
          }
          if (contest.problems && contest.problems.length > 0) {
            setProblems(contest.problems.map((p, i) => ({
              id: String.fromCharCode(65 + i),
              name: p.title,
              score: 100,
              description: p.description || '',
              difficulty: p.difficulty || 'Medium',
              category: p.category || '',
              testCases: [],
            })));
          }
        } else {
          console.log('Contest not found');
        }
      } catch (err) {
        console.error('Failed to load contest for edit:', err);
      } finally {
        setIsLoadingEdit(false);
      }
    };
    if (editId) {
      loadContestForEdit();
    }
  }, [editId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (contestCreated) {
      handleUpdateContest();
    } else {
      handleCreateContest();
    }
  };

  const renderDeleteModal = () => {
    if (!showDeleteModal) return null;

    const modalContent = (
      <div
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        onClick={cancelDeleteContest}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-card-dark border border-white/20 rounded-2xl p-6 max-w-sm w-full shadow-xl"
          role="document"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 id="delete-modal-title" className="text-[15px] font-semibold text-white">
                Delete Contest?
              </h3>
              <p className="text-[12px] text-muted">This action cannot be undone</p>
            </div>
          </div>
          <p className="text-[13px] text-muted leading-relaxed mb-6">
            Are you sure you want to delete this contest? All configuration including problems, moderators, and participants will be permanently removed.
          </p>
          <div className="flex gap-2.5 justify-end">
            <button
              type="button"
              onClick={cancelDeleteContest}
              className="px-4 py-2 rounded-lg text-[13px] font-medium border border-white/20 text-white hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDeleteContest}
              className="px-4 py-2 rounded-lg text-[13px] font-medium bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20"
            >
              Delete Contest
            </button>
          </div>
        </div>
      </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
  };

  return (
    <MainLayout>
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Link
              to="/ta-dashboard"
              className="text-muted hover:text-white text-sm font-medium flex items-center gap-1 mb-4 w-fit transition-colors"
            >
              <ChevronLeft size={16} /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {isLoadingEdit ? "Loading..." : editId || contestCreated ? "Edit Contest" : "Create New Contest"}
            </h1>
          </div>
        </div>

        {/* Section: Contest Details */}
        <section className="mb-10">
          <SectionLabel number="1" title="Contest details" />

          <form onSubmit={handleSubmit} className="bg-card-dark border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col gap-5">
            <FieldWrapper label="Contest name" htmlFor="contest-name">
              <input
                id="contest-name"
                type="text"
                value={form.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                placeholder="e.g. DAA Mid-Semester Contest 2025"
                className={clsx(inputCls, errors.name && "border-red-500/50")}
              />
              <div className="min-h-[20px]">
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>
            </FieldWrapper>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldWrapper label="Start date" htmlFor="start-date">
                <input
                  id="start-date"
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    handleFieldChange("startDate", e.target.value)
                  }
                  className={inputCls}
                />
              </FieldWrapper>
              <FieldWrapper label="Start time (IST)" htmlFor="start-time">
                <input
                  id="start-time"
                  type="time"
                  value={form.startTime}
                  onChange={(e) =>
                    handleFieldChange("startTime", e.target.value)
                  }
                  className={inputCls}
                />
              </FieldWrapper>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldWrapper label="End date" htmlFor="end-date">
                <input
                  id="end-date"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => handleFieldChange("endDate", e.target.value)}
                  className={clsx(inputCls, errors.dates && "border-red-500/50")}
                />
              </FieldWrapper>
              <FieldWrapper label="End time (IST)" htmlFor="end-time">
                <input
                  id="end-time"
                  type="time"
                  value={form.endTime}
                  onChange={(e) => handleFieldChange("endTime", e.target.value)}
                  className={clsx(inputCls, errors.dates && "border-red-500/50")}
                />
              </FieldWrapper>
            </div>

            <div className="min-h-[20px]">
              {errors.dates && (
                <p className="text-red-500 text-xs -mt-3">{errors.dates}</p>
              )}
            </div>

            {duration && (
              <p className="text-[13px] text-muted -mt-2">
                Duration:{" "}
                <span className="text-brand-yellow font-medium">
                  {duration}
                </span>
              </p>
            )}

            <hr className="border-dashed border-white/10" />

            <FieldWrapper label="Organizer" htmlFor="organizer">
              <input
                id="organizer"
                type="text"
                value={form.organizer}
                onChange={(e) => handleFieldChange("organizer", e.target.value)}
                placeholder="e.g. Dept. of CS — Year 2"
                className={inputCls}
              />
            </FieldWrapper>

            <FieldWrapper label="Attendance" htmlFor="mark-for-attendance">
              <div className="flex items-center gap-2">
                <input
                  id="mark-for-attendance"
                  type="checkbox"
                  checked={form.markForAttendance || false}
                  onChange={(e) =>
                    handleFieldChange("markForAttendance", e.target.checked)
                  }
                  className="w-4 h-4 rounded border-white/20 bg-card-dark text-brand-yellow focus:ring-brand-yellow/50 focus:ring-offset-0 cursor-pointer"
                />
                <label
                  htmlFor="mark-for-attendance"
                  className="text-[13px] text-white/50 cursor-pointer select-none"
                >
                  Mark this contest for attendance
                </label>
              </div>
            </FieldWrapper>

            <label className="flex items-center gap-3 cursor-pointer select-none group">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={!form.isDraft}
                  onChange={(e) => handleFieldChange("isDraft", !e.target.checked)}
                />
                <div className="w-9 h-5 bg-white/10 border border-white/20 rounded-full peer-checked:bg-brand-yellow/10 peer-checked:border-brand-yellow/30" />
                <div className="absolute top-[3px] left-[3px] w-[14px] h-[14px] bg-white/50 rounded-full peer-checked:translate-x-4 peer-checked:bg-brand-yellow" />
              </div>
              <span className="text-sm text-white">
                Publish immediately (uncheck to save as draft)
              </span>
            </label>

            <div className="flex justify-end pt-2 gap-3 items-center">
              {isSubmitting && (
                <span className="text-muted text-xs flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" /> 
                  {contestCreated ? "Saving..." : "Creating..."}
                </span>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={clsx(
                  "px-6 py-2.5 rounded-xl text-[13px] font-semibold flex items-center gap-2 transition-all",
                  contestCreated
                    ? "bg-brand-yellow text-bg-dark hover:bg-yellow-300"
                    : "bg-zinc-200 text-bg-dark hover:bg-yellow-300 disabled:opacity-50",
                )}
              >
                {contestCreated ? "Save Changes" : "Create Contest"}
              </button>

              {contestCreated && (
                <button
                  type="button"
                  onClick={handleDeleteContest}
                  className="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-2.5 rounded-xl text-[13px] font-semibold hover:bg-red-500/20 flex items-center gap-2"
                >
                  <Trash2 size={14} /> Delete
                </button>
              )}
            </div>
          </form>

          {savedSlug && contestCreated && (
            <div className="mt-3">
              <Link
                to={`/contests/${savedSlug}`}
                target="_blank"
                className="text-sm text-brand-yellow hover:underline"
              >
                Contest Link: /contests/{savedSlug}
              </Link>
            </div>
          )}
        </section>

        {/* Section: Configure */}
        <section>
          <SectionLabel number="2" title="Configure" />

          <div
            className={clsx(
              "border border-white/10 rounded-2xl overflow-hidden",
              !contestCreated && "opacity-40 pointer-events-none select-none",
            )}
          >
            {!contestCreated && (
              <div className="px-5 py-3 bg-bg-light border-b border-white/10 text-[11px] font-medium text-muted tracking-wide flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-white/20 inline-block" />
                Available once contest is created
              </div>
            )}

            <div className="flex border-b border-white/10 overflow-x-auto bg-card-dark">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={clsx(
                    "px-5 py-3.5 text-[13px] font-medium border-b-2 whitespace-nowrap",
                    activeTab === tab
                      ? "text-white border-white bg-bg-light"
                      : "text-muted border-transparent hover:text-white hover:bg-bg-light",
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-6 md:p-8 bg-card-dark overflow-y-auto">
              {activeTab === "Landing Page" && (
                <LandingPageTab
                  bannerImageURL={form.bannerImageURL}
                  description={form.description}
                  isPublic={form.isPublic}
                  onChangeBannerImageURL={(val) => handleFieldChange("bannerImageURL", val)}
                  onChangeDescription={(val) => handleFieldChange("description", val)}
                  onChangeIsPublic={(val) => handleFieldChange("isPublic", val)}
                />
              )}
              {activeTab === "Problems" && (
                <ProblemsTab
                  problems={problems}
                  setProblems={setProblems}
                  onOpenPanel={() => setPanelOpen(true)}
                  newProblemId={newProblemId}
                />
              )}
              {activeTab === "Moderators" && (
                <ModeratorsTab
                  moderators={moderators}
                  setModerators={setModerators}
                />
              )}
              {activeTab === "Participants" && (
                <ParticipantsTab
                  group={form.participantGroup}
                  onChangeGroup={(val) =>
                    handleFieldChange("participantGroup", val)
                  }
                  participants={participantsList}
                  setParticipants={setParticipantsList}
                  notifyStart={form.notifyStart}
                  onChangeNotifyStart={(val) => handleFieldChange("notifyStart", val)}
                  notifyResults={form.notifyResults}
                  onChangeNotifyResults={(val) => handleFieldChange("notifyResults", val)}
                  isLoadingParticipants={isLoadingParticipants}
                />
              )}
            </div>
          </div>
        </section>

        <AddProblemPanel
          open={panelOpen}
          onClose={() => setPanelOpen(false)}
          onAdd={handleAddProblem}
        />

        {renderDeleteModal()}
      </main>
    </MainLayout>
  );
}