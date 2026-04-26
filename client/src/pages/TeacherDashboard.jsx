import { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import CreateContestPage from "./CreateContestPage";
import { Context } from "../main";
import api from "../api/client";
import { toast } from "react-toastify";
import {
  ArrowLeft, Plus, Trash2, Edit2, Users, Trophy,
  BarChart2, Megaphone, X, ChevronDown, Search, Download,
  Printer, Eye, EyeOff, Loader2, Copy, Check, CalendarDays,
  GraduationCap, ClipboardList, ExternalLink, LogOut,
} from "lucide-react";
import { TableSkeleton } from "../components/contestlist/Skeletons";

// ── Shared helpers ───────────────────────────────────────────────────��────────
function exportCSV(rows, cols, filename) {
  const header = cols.map((c) => `"${c.label}"`).join(",");
  const body = rows.map((r) => cols.map((c) => `"${String(r[c.key] ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([header + "\n" + body], { type: "text/csv" });
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: filename });
  a.click();
  URL.revokeObjectURL(a.href);
}

function exportPDF(rows, cols, title) {
  const w = window.open("", "_blank");
  const tHead = `<tr>${cols.map((c) => `<th>${c.label}</th>`).join("")}</tr>`;
  const tBody = rows.map((r) => `<tr>${cols.map((c) => `<td>${r[c.key] ?? ""}</td>`).join("")}</tr>`).join("");
  w.document.write(`<!DOCTYPE html><html><head><title>${title}</title><style>
    body{font-family:Arial;padding:24px;color:#111}h1{margin-bottom:16px}
    table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:8px;text-align:left;font-size:13px}
    th{background:#f5f5f5;font-weight:600}tr:nth-child(even){background:#fafafa}
  </style></head><body><h1>${title}</h1><table><thead>${tHead}</thead><tbody>${tBody}</tbody></table></body></html>`);
  w.document.close(); w.print();
}

function Card({ children, className = "" }) {
  return <div className={`bg-zinc-800 border border-white/10 rounded-xl p-5 ${className}`}>{children}</div>;
}

function Modal({ title, onClose, children, footer, wide = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-8 px-4">
      <div className={`bg-zinc-900 border border-white/10 rounded-2xl w-full shadow-2xl ${wide ? "max-w-3xl" : "max-w-lg"}`}>
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h3 className="font-semibold text-white font-display">{title}</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">{children}</div>
        {footer && <div className="p-5 border-t border-white/10 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      {label && <label className="text-xs text-zinc-400 mb-1 block">{label}</label>}
      <input {...props} className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/50" />
    </div>
  );
}

function Btn({ children, variant = "primary", size = "md", className = "", ...props }) {
  const base = "inline-flex items-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50";
  const sz = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";
  const v = variant === "primary" ? "bg-amber-400 text-black hover:bg-amber-300"
    : variant === "ghost" ? "bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 border border-white/10"
    : variant === "danger" ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
    : "bg-zinc-800 text-zinc-300 hover:text-white border border-white/10";
  return <button className={`${base} ${sz} ${v} ${className}`} {...props}>{children}</button>;
}

// ── STREAM TAB ────────────────────────────────────────────────────────────────
function StreamTab({ cls }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });
  const [saving, setSaving] = useState(false);

  const fetchAnnouncements = useCallback(() => {
    setLoading(true);
    api.get(`/announcements/class/${cls._id}`)
      .then(({ data }) => setAnnouncements(data.announcements))
      .catch(() => toast.error("Failed to load announcements"))
      .finally(() => setLoading(false));
  }, [cls._id]);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

  const post = async () => {
    if (!form.title || !form.content) { toast.error("Title and content required"); return; }
    setSaving(true);
    try {
      await api.post("/announcements", { class_id: cls._id, ...form });
      toast.success("Announcement posted");
      setForm({ title: "", content: "" });
      setShowForm(false);
      fetchAnnouncements();
    } catch (e) { toast.error(e.response?.data?.message || "Failed"); }
    finally { setSaving(false); }
  };

  const deleteAnn = async (id) => {
    if (!confirm("Delete this announcement?")) return;
    try { await api.delete(`/announcements/${id}`); toast.success("Deleted"); fetchAnnouncements(); }
    catch { toast.error("Failed"); }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold font-display text-white">Stream</h3>
        <Btn onClick={() => setShowForm((v) => !v)}><Plus size={14} /> Post Announcement</Btn>
      </div>

      {showForm && (
        <Card>
          <div className="space-y-3">
            <Input label="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Announcement title…" />
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Content</label>
              <textarea rows={4} value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} placeholder="Write your announcement…" className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/50 resize-none" />
            </div>
            <div className="flex justify-end gap-2">
              <Btn variant="ghost" onClick={() => setShowForm(false)}>Cancel</Btn>
              <Btn onClick={post} disabled={saving}>{saving && <Loader2 size={13} className="animate-spin" />}Post</Btn>
            </div>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-amber-400" size={24} /></div>
      ) : announcements.length === 0 ? (
        <Card><p className="text-center text-zinc-500 py-4">No announcements yet. Post the first one!</p></Card>
      ) : (
        announcements.map((a) => (
          <Card key={a._id}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400 text-xs font-bold">
                    {a.author_id?.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <span className="text-sm font-medium text-white">{a.author_id?.name}</span>
                  <span className="text-xs text-zinc-500">· {new Date(a.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm font-semibold text-white mb-1">{a.title}</p>
                <p className="text-sm text-zinc-300 whitespace-pre-wrap">{a.content}</p>
              </div>
              <button onClick={() => deleteAnn(a._id)} className="text-zinc-600 hover:text-red-400 transition-colors flex-shrink-0"><Trash2 size={14} /></button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}

// ── CLASSWORK TAB ─────────────────────────────────────────────────────────────
function ClassworkTab({ cls }) {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [problems, setProblems] = useState([]);
  const [probSearch, setProbSearch] = useState("");
  const [form, setForm] = useState({ title: "", deadline: "", isVisible: true, questions: [] });
  const [saving, setSaving] = useState(false);
  const [createProbModal, setCreateProbModal] = useState(false);
  const [newProb, setNewProb] = useState({ title: "", description: "", difficulty: "MEDIUM", category: "", time_limit: 2, memory_limit: 256, test_cases: [{ input: "", expected_output: "", is_sample: true }] });
  const [savingProb, setSavingProb] = useState(false);

  const fetchLabs = useCallback(() => {
    setLoading(true);
    api.get(`/labs/class/${cls._id}`).then(({ data }) => setLabs(data.labs)).catch(() => toast.error("Failed to load labs")).finally(() => setLoading(false));
  }, [cls._id]);

  const fetchProblems = useCallback(() => {
    api.get("/problems").then(({ data }) => setProblems(data.problems.filter((p) => !p.contest_id))).catch(() => {});
  }, []);

  useEffect(() => { fetchLabs(); fetchProblems(); }, [fetchLabs, fetchProblems]);

  const openCreate = () => { setForm({ title: "", deadline: "", isVisible: true, questions: [] }); setModal("create"); };
  const openEdit = (lab) => { setForm({ title: lab.title, deadline: lab.deadline ? new Date(lab.deadline).toISOString().slice(0, 16) : "", isVisible: lab.isVisible, questions: lab.questions.map((q) => q._id) }); setModal({ mode: "edit", id: lab._id }); };

  const saveLab = async () => {
    if (!form.title) { toast.error("Title required"); return; }
    setSaving(true);
    try {
      if (modal === "create") {
        await api.post("/labs/create", { class_id: cls._id, title: form.title, deadline: form.deadline || undefined, isVisible: form.isVisible, questions: form.questions });
        toast.success("Lab created");
      } else {
        await api.put(`/labs/${modal.id}/update`, { title: form.title, deadline: form.deadline || undefined, isVisible: form.isVisible, questions: form.questions });
        toast.success("Lab updated");
      }
      setModal(null);
      fetchLabs();
    } catch (e) { toast.error(e.response?.data?.message || "Failed"); }
    finally { setSaving(false); }
  };

  const toggleLabVisibility = async (lab) => {
    const next = !lab.isVisible;
    try {
      await api.put(`/labs/${lab._id}/update`, { isVisible: next });
      toast.success(next ? "Lab is now visible to students" : "Lab hidden from students");
      fetchLabs();
    } catch { toast.error("Failed to update visibility"); }
  };

  const toggleQuestion = (id) => setForm((f) => ({ ...f, questions: f.questions.includes(id) ? f.questions.filter((q) => q !== id) : [...f.questions, id] }));

  const saveNewProblem = async () => {
    if (!newProb.title || !newProb.description) { toast.error("Title and description required"); return; }
    setSavingProb(true);
    try {
      const { data } = await api.post("/problems", newProb);
      toast.success("Problem created");
      fetchProblems();
      setForm((f) => ({ ...f, questions: [...f.questions, data.problem._id] }));
      setCreateProbModal(false);
      setNewProb({ title: "", description: "", difficulty: "MEDIUM", category: "", time_limit: 2, memory_limit: 256, test_cases: [{ input: "", expected_output: "", is_sample: true }] });
    } catch (e) { toast.error(e.response?.data?.message || "Failed"); }
    finally { setSavingProb(false); }
  };

  const filteredProbs = problems.filter((p) => !probSearch || p.title.toLowerCase().includes(probSearch.toLowerCase()));
  const diffColor = { EASY: "text-emerald-400", MEDIUM: "text-amber-400", HARD: "text-red-400" };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold font-display text-white">Classwork</h3>
        <Btn onClick={openCreate}><Plus size={14} /> Create Lab</Btn>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-amber-400" size={24} /></div>
      ) : labs.length === 0 ? (
        <Card><p className="text-center text-zinc-500 py-6">No labs yet. Create one to get started.</p></Card>
      ) : (
        <div className="space-y-3">
          {labs.map((lab) => (
            <Card key={lab._id} className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-white">{lab.title}</p>
                  {!lab.isVisible && <span className="text-xs bg-zinc-700 text-zinc-400 px-2 py-0.5 rounded">Hidden</span>}
                </div>
                <div className="flex items-center gap-4 text-xs text-zinc-400">
                  <span>{lab.questions?.length ?? 0} problems</span>
                  {lab.deadline && <span className="flex items-center gap-1"><CalendarDays size={11} /> {new Date(lab.deadline).toLocaleDateString()}</span>}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Btn variant="ghost" size="sm" onClick={() => openEdit(lab)}><Edit2 size={12} /></Btn>
                <Btn
                  variant={lab.isVisible ? "danger" : "ghost"}
                  size="sm"
                  onClick={() => toggleLabVisibility(lab)}
                  title={lab.isVisible ? "Hide from students" : "Make visible to students"}
                >
                  {lab.isVisible ? <EyeOff size={12} /> : <Eye size={12} />}
                </Btn>
              </div>
            </Card>
          ))}
        </div>
      )}

      {modal && (
        <Modal
          title={modal === "create" ? "Create Lab" : "Edit Lab"}
          onClose={() => setModal(null)}
          wide
          footer={
            <>
              <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
              <Btn onClick={saveLab} disabled={saving}>{saving && <Loader2 size={13} className="animate-spin" />}Save Lab</Btn>
            </>
          }
        >
          <Input label="Lab Title *" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Lab 1 — Arrays" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Deadline (optional)</label>
              <input type="datetime-local" value={form.deadline} onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))} className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400/50" />
            </div>
            <div className="flex items-end pb-0.5">
              <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                <input type="checkbox" checked={form.isVisible} onChange={(e) => setForm((f) => ({ ...f, isVisible: e.target.checked }))} className="accent-amber-400 w-4 h-4" />
                Visible to students
              </label>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-zinc-400">Problems ({form.questions.length} selected)</label>
              <Btn variant="ghost" size="sm" onClick={() => setCreateProbModal(true)}><Plus size={12} /> Create New</Btn>
            </div>
            <div className="relative mb-2">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input value={probSearch} onChange={(e) => setProbSearch(e.target.value)} placeholder="Search problems…" className="w-full bg-zinc-900 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400/50" />
            </div>
            <div className="border border-white/10 rounded-lg overflow-hidden max-h-52 overflow-y-auto">
              {filteredProbs.length === 0 ? (
                <p className="text-center text-zinc-500 text-sm py-4">No standalone problems found. Create one above.</p>
              ) : filteredProbs.map((p) => (
                <label key={p._id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/3 cursor-pointer border-b border-white/5 last:border-0 transition-colors">
                  <input type="checkbox" checked={form.questions.includes(p._id)} onChange={() => toggleQuestion(p._id)} className="accent-amber-400" />
                  <span className="flex-1 text-sm text-zinc-200">{p.title}</span>
                  <span className={`text-xs font-medium ${diffColor[p.difficulty] ?? "text-zinc-400"}`}>{p.difficulty}</span>
                </label>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {createProbModal && (
        <Modal
          title="Create Standalone Problem"
          onClose={() => setCreateProbModal(false)}
          footer={
            <>
              <Btn variant="ghost" onClick={() => setCreateProbModal(false)}>Cancel</Btn>
              <Btn onClick={saveNewProblem} disabled={savingProb}>{savingProb && <Loader2 size={13} className="animate-spin" />}Create & Add</Btn>
            </>
          }
        >
          <Input label="Title *" value={newProb.title} onChange={(e) => setNewProb((f) => ({ ...f, title: e.target.value }))} />
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Description *</label>
            <textarea rows={4} value={newProb.description} onChange={(e) => setNewProb((f) => ({ ...f, description: e.target.value }))} className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400/50 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Difficulty</label>
              <select value={newProb.difficulty} onChange={(e) => setNewProb((f) => ({ ...f, difficulty: e.target.value }))} className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
                <option>EASY</option><option>MEDIUM</option><option>HARD</option>
              </select>
            </div>
            <Input label="Category" value={newProb.category} onChange={(e) => setNewProb((f) => ({ ...f, category: e.target.value }))} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-zinc-400">Test Cases</label>
              <button onClick={() => setNewProb((f) => ({ ...f, test_cases: [...f.test_cases, { input: "", expected_output: "", is_sample: false }] }))} className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"><Plus size={11} /> Add</button>
            </div>
            {newProb.test_cases.map((tc, i) => (
              <div key={i} className="bg-zinc-800/60 border border-white/5 rounded-lg p-3 mb-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                    <input type="checkbox" checked={tc.is_sample} onChange={(e) => setNewProb((f) => ({ ...f, test_cases: f.test_cases.map((t, idx) => idx === i ? { ...t, is_sample: e.target.checked } : t) }))} className="accent-amber-400" />
                    Sample
                  </label>
                  {newProb.test_cases.length > 1 && <button onClick={() => setNewProb((f) => ({ ...f, test_cases: f.test_cases.filter((_, idx) => idx !== i) }))} className="text-zinc-600 hover:text-red-400 transition-colors"><X size={12} /></button>}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Input</p>
                    <textarea rows={2} value={tc.input} onChange={(e) => setNewProb((f) => ({ ...f, test_cases: f.test_cases.map((t, idx) => idx === i ? { ...t, input: e.target.value } : t) }))} className="w-full bg-zinc-900 border border-white/5 rounded px-2 py-1.5 text-xs text-white font-mono focus:outline-none resize-none" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Expected Output</p>
                    <textarea rows={2} value={tc.expected_output} onChange={(e) => setNewProb((f) => ({ ...f, test_cases: f.test_cases.map((t, idx) => idx === i ? { ...t, expected_output: e.target.value } : t) }))} className="w-full bg-zinc-900 border border-white/5 rounded px-2 py-1.5 text-xs text-white font-mono focus:outline-none resize-none" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── PEOPLE TAB ────────────────────────────────────────────────────────────────
function PeopleTab({ cls, onRefresh }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinOpen, setJoinOpen] = useState(cls.joiningOpen);
  const [addEmail, setAddEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get(`/classes/${cls._id}`).then(({ data }) => {
      setStudents(data.classDetails.students || []);
      setJoinOpen(data.classDetails.joiningOpen);
    }).catch(() => toast.error("Failed")).finally(() => setLoading(false));
  }, [cls._id]);

  const copyCode = () => {
    navigator.clipboard.writeText(cls.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [toggling, setToggling] = useState(false);

  const toggleJoin = async () => {
    if (toggling) return;
    setToggling(true);
    try {
      await api.patch(`/classes/${cls._id}/toggle-join`);
      const next = !joinOpen;
      setJoinOpen(next);
      toast.success(`Joining ${next ? "opened" : "closed"}`);
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || "Failed to update join status");
    } finally {
      setToggling(false);
    }
  };

  const addStudent = async () => {
    if (!addEmail) return;
    setAdding(true);
    try {
      const { data } = await api.post(`/classes/${cls._id}/add-student`, { email: addEmail });
      toast.success(`${data.student.name} added`);
      setStudents((s) => [...s, data.student]);
      setAddEmail("");
    } catch (e) { toast.error(e.response?.data?.message || "Failed"); }
    finally { setAdding(false); }
  };

  const removeStudent = async (studentId, name) => {
    if (!confirm(`Remove ${name} from class?`)) return;
    try {
      await api.delete(`/classes/${cls._id}/student/${studentId}`);
      toast.success("Student removed");
      setStudents((s) => s.filter((st) => st._id !== studentId));
    } catch { toast.error("Failed"); }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <h3 className="text-lg font-semibold font-display text-white">People</h3>

      <Card>
        <p className="text-xs text-zinc-400 mb-2">Joining Status</p>
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${joinOpen ? "text-emerald-400" : "text-zinc-400"}`}>{joinOpen ? "Open — students can join via code" : "Closed — new joins disabled"}</span>
          <button
            onClick={toggleJoin}
            disabled={toggling}
            className={`relative w-11 h-6 rounded-full transition-colors disabled:opacity-60 ${joinOpen ? "bg-amber-400" : "bg-zinc-600"}`}
          >
            <span
              className={`pointer-events-none absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${joinOpen ? "translate-x-5" : "translate-x-0"}`}
            />
          </button>
        </div>
      </Card>

      <Card>
        <p className="text-xs text-zinc-400 mb-2">Add Student by Email</p>
        <div className="flex gap-2">
          <input value={addEmail} onChange={(e) => setAddEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addStudent()} placeholder="student@example.com" className="flex-1 bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/50" />
          <Btn onClick={addStudent} disabled={adding || !addEmail}>{adding && <Loader2 size={13} className="animate-spin" />}Add</Btn>
        </div>
      </Card>

      <div>
        <p className="text-sm text-zinc-400 mb-3">{students.length} student{students.length !== 1 ? "s" : ""} enrolled</p>
        {loading ? <TableSkeleton />
          : students.length === 0 ? <Card><p className="text-center text-zinc-500 py-4">No students yet.</p></Card>
          : (
            <Card className="p-0 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-zinc-900/50">
                    {["Name", "Email", ""].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s._id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3 text-white font-medium">{s.name}</td>
                      <td className="px-4 py-3 text-zinc-400">{s.email}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => removeStudent(s._id, s.name)} className="text-zinc-600 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
      </div>
    </div>
  );
}

// ── GRADES TAB ────────────────────────────────────────────────────────────────
function GradesTab({ cls }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    api.get(`/labs/class/${cls._id}/grades`).then(({ data: d }) => setData(d)).catch(() => toast.error("Failed to load grades")).finally(() => setLoading(false));
  }, [cls._id]);

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-amber-400" size={24} /></div>;
  if (!data) return null;

  const { labs, students, lookup } = data;
  const columns = labs.flatMap((lab) => lab.questions.map((q) => ({ lab, problem: q, label: `${lab.title} › ${q.title}` })));

  const statusCell = (status) => {
    if (!status) return <span className="text-zinc-600 text-base">—</span>;
    if (status === "Accepted") return <span className="text-emerald-400 text-base">✓</span>;
    return <span className="text-red-400 text-base">✗</span>;
  };

  const rows = students.map((s) => {
    const row = { Name: s.name, Email: s.email };
    let solved = 0;
    columns.forEach(({ lab, problem }) => {
      const st = lookup[`${s._id}:${problem._id}:${lab._id}`];
      row[`${lab.title} › ${problem.title}`] = st || "Missing";
      if (st === "Accepted") solved++;
    });
    row["Total Solved"] = `${solved}/${columns.length}`;
    return row;
  });

  const csvCols = [
    { key: "Name", label: "Name" },
    { key: "Email", label: "Email" },
    ...columns.map((c) => ({ key: c.label, label: c.label })),
    { key: "Total Solved", label: "Total Solved" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold font-display text-white">Grades</h3>
        <div className="relative">
          <button onClick={() => setExportOpen((v) => !v)} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-white/10 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors">
            <Download size={14} /> Export <ChevronDown size={13} className={`transition-transform ${exportOpen ? "rotate-180" : ""}`} />
          </button>
          {exportOpen && (
            <div className="absolute right-0 top-full mt-1 bg-zinc-800 border border-white/10 rounded-lg shadow-xl py-1 z-10 w-44">
              <button onClick={() => { exportCSV(rows, csvCols, `grades-${cls.name}.csv`); setExportOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors">
                <Download size={13} /> Download CSV
              </button>
              <button onClick={() => { exportPDF(rows, csvCols, `Grades — ${cls.name}`); setExportOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors">
                <Printer size={13} /> Print / PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {columns.length === 0 ? (
        <Card><p className="text-center text-zinc-500 py-6">No labs with problems yet. Create a lab with problems first.</p></Card>
      ) : students.length === 0 ? (
        <Card><p className="text-center text-zinc-500 py-6">No students enrolled yet.</p></Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="text-sm min-w-max">
            <thead>
              <tr className="bg-zinc-900/70">
                <th className="sticky left-0 bg-zinc-900 px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wide border-b border-r border-white/10 min-w-40">Student</th>
                {columns.map(({ lab, problem }) => (
                  <th key={`${lab._id}-${problem._id}`} className="px-3 py-3 text-center border-b border-white/10 min-w-28">
                    <p className="text-xs text-zinc-500 truncate max-w-24">{lab.title}</p>
                    <p className="text-xs text-zinc-300 truncate max-w-24 font-medium">{problem.title}</p>
                  </th>
                ))}
                <th className="px-4 py-3 text-center border-b border-l border-white/10 text-xs font-medium text-zinc-400 uppercase tracking-wide">Total</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                let solved = 0;
                return (
                  <tr key={s._id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="sticky left-0 bg-zinc-900 px-4 py-3 border-r border-white/10">
                      <p className="text-sm text-white font-medium">{s.name}</p>
                      <p className="text-xs text-zinc-500">{s.email}</p>
                    </td>
                    {columns.map(({ lab, problem }) => {
                      const st = lookup[`${s._id}:${problem._id}:${lab._id}`];
                      if (st === "Accepted") solved++;
                      return (
                        <td key={`${lab._id}-${problem._id}`} className="px-3 py-3 text-center border-white/5">
                          {statusCell(st)}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-center border-l border-white/10">
                      <span className="text-xs font-medium text-amber-400">{solved}/{columns.length}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── MY CONTESTS TAB ───────────────────────────────────────────────────────────
function ContestsTab() {
  const navigate = useNavigate();
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const fetchContests = () => {
    setLoading(true);
    api.get("/contests/my").then(({ data }) => setContests(data.contests || [])).catch(() => toast.error("Failed")).finally(() => setLoading(false));
  };

  useEffect(() => { fetchContests(); }, []);

  if (showCreate) {
    return (
      <CreateContestPage
        isEmbedded
        onBack={() => { setShowCreate(false); fetchContests(); }}
      />
    );
  }

  const now = new Date();
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold font-display text-white">My Contests</h3>
        <Btn onClick={() => setShowCreate(true)}><Plus size={14} /> Create Contest</Btn>
      </div>
      {loading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-amber-400" size={24} /></div>
        : contests.length === 0 ? <Card><p className="text-center text-zinc-500 py-6">No contests yet.</p></Card>
        : (
          <div className="space-y-3">
            {contests.map((c) => {
              const start = new Date(c.start_time), end = new Date(c.end_time);
              const isLive = c.is_active && now >= start && now <= end;
              const isUpcoming = now < start;
              const statusColor = isLive ? "bg-emerald-500/15 text-emerald-400" : isUpcoming ? "bg-amber-400/15 text-amber-400" : "bg-zinc-700 text-zinc-400";
              const statusLabel = isLive ? "Live" : isUpcoming ? "Upcoming" : "Ended";
              return (
                <Card key={c._id} className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-white">{c.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColor}`}>{statusLabel}</span>
                      {c.isOwner && <span className="text-xs bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded">Owner</span>}
                    </div>
                    <p className="text-xs text-zinc-400">
                      {start.toLocaleDateString()} — {end.toLocaleDateString()} · {c.participants?.length ?? 0} participants · {c.problems?.length ?? 0} problems
                    </p>
                  </div>
                  <Btn variant="ghost" size="sm" onClick={() => navigate(`/manage-contest/${c._id}`)}>
                    <ExternalLink size={13} /> Manage
                  </Btn>
                </Card>
              );
            })}
          </div>
        )}
    </div>
  );
}

// ── CLASS WORKSPACE ───────────────────────────────────────────────────────────
const TABS = [
  { key: "stream", label: "Stream", icon: Megaphone },
  { key: "classwork", label: "Classwork", icon: ClipboardList },
  { key: "people", label: "People", icon: Users },
  { key: "grades", label: "Grades", icon: BarChart2 },
  { key: "contests", label: "My Contests", icon: Trophy },
];

function ClassWorkspace({ cls, onBack }) {
  const [tab, setTab] = useState("stream");
  const [codeCopied, setCodeCopied] = useState(false);

  const copyJoinCode = () => {
    navigator.clipboard.writeText(cls.joinCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <div className="border-b border-white/10 bg-zinc-800/30 px-6 py-4 flex items-center gap-4 flex-shrink-0">
        <button onClick={onBack} className="text-zinc-400 hover:text-white transition-colors"><ArrowLeft size={18} /></button>
        <div className="flex-1">
          <p className="font-semibold text-white font-display">{cls.name}</p>
          <p className="text-xs text-zinc-400">{cls.year} · {cls.branch} · Section {cls.section}</p>
        </div>
        <div className="flex items-center gap-2 bg-zinc-900/60 border border-white/10 rounded-lg px-3 py-2">
          <span className="text-xs text-zinc-500">Join Code</span>
          <span className="font-mono font-bold text-amber-400 tracking-widest text-sm">{cls.joinCode}</span>
          <button onClick={copyJoinCode} className="text-zinc-400 hover:text-amber-400 transition-colors ml-1">
            {codeCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      <div className="border-b border-white/10 px-6 flex gap-1 flex-shrink-0">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === key ? "border-amber-400 text-amber-400" : "border-transparent text-zinc-400 hover:text-white"}`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {tab === "stream" && <StreamTab cls={cls} />}
        {tab === "classwork" && <ClassworkTab cls={cls} />}
        {tab === "people" && <PeopleTab cls={cls} />}
        {tab === "grades" && <GradesTab cls={cls} />}
        {tab === "contests" && <ContestsTab />}
      </div>
    </div>
  );
}

// ── CREATE CLASS MODAL ──────────────────────────────────��─────────────────────
function CreateClassModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", year: "", branch: "", semester: "", section: "" });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (Object.values(form).some((v) => !v)) { toast.error("All fields required"); return; }
    setSaving(true);
    try {
      const { data } = await api.post("/classes/create", form);
      toast.success("Class created");
      onCreated(data.newClass);
    } catch (e) { toast.error(e.response?.data?.message || "Failed"); }
    finally { setSaving(false); }
  };

  return (
    <Modal
      title="Create Class"
      onClose={onClose}
      footer={
        <>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn onClick={save} disabled={saving}>{saving && <Loader2 size={13} className="animate-spin" />}Create</Btn>
        </>
      }
    >
      <Input label="Class Name *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Data Structures" />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Year *" value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))} placeholder="e.g. 2024" />
        <Input label="Branch *" value={form.branch} onChange={(e) => setForm((f) => ({ ...f, branch: e.target.value }))} placeholder="e.g. CSE" />
        <Input label="Semester *" value={form.semester} onChange={(e) => setForm((f) => ({ ...f, semester: e.target.value }))} placeholder="e.g. 3" />
        <Input label="Section *" value={form.section} onChange={(e) => setForm((f) => ({ ...f, section: e.target.value }))} placeholder="e.g. A" />
      </div>
    </Modal>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function TeacherDashboard() {
  const { user, isAuthenticated, setIsAuthenticated, setUser } = useContext(Context);
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleSignOut = async () => {
    try { await api.get("/user/logout"); } catch { /* ignore */ }
    setIsAuthenticated(false);
    setUser(null);
    navigate("/auth", { replace: true });
  };

  useEffect(() => {
    api.get("/classes").then(({ data }) => setClasses(data.classes || [])).catch(() => toast.error("Failed to load classes")).finally(() => setLoadingClasses(false));
  }, []);

  if (!isAuthenticated) return <Navigate to="/auth" />;
  if (!["Teacher", "Admin"].includes(user?.role)) return <Navigate to="/" />;

  return (
    <div className="min-h-screen bg-zinc-900 flex font-sans text-white">
      <aside className="w-64 flex-shrink-0 bg-zinc-800/50 border-r border-white/10 flex flex-col sticky top-0 h-screen overflow-y-auto">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 flex items-center justify-center">
              <GraduationCap size={16} className="text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold font-display text-white">Teacher Dashboard</p>
              <p className="text-xs text-zinc-500">JKLU Platform</p>
            </div>
          </div>
        </div>

        <div className="p-3 border-b border-white/10">
          <button onClick={() => setShowCreateModal(true)} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm bg-amber-400 text-black font-medium hover:bg-amber-300 transition-colors">
            <Plus size={15} /> New Class
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {loadingClasses ? (
            <div className="flex justify-center py-6"><Loader2 className="animate-spin text-amber-400" size={18} /></div>
          ) : classes.length === 0 ? (
            <p className="text-xs text-zinc-600 text-center py-4">No classes yet</p>
          ) : classes.map((cls) => (
            <button
              key={cls._id}
              onClick={() => setSelectedClass(cls)}
              className={`w-full text-left px-3 py-3 rounded-lg transition-all ${selectedClass?._id === cls._id ? "bg-amber-400/10 border border-amber-400/20" : "hover:bg-white/5 border border-transparent"}`}
            >
              <p className={`text-sm font-medium truncate ${selectedClass?._id === cls._id ? "text-amber-400" : "text-zinc-200"}`}>{cls.name}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{cls.year} · {cls.branch} · Sec {cls.section}</p>
              <p className="text-xs text-zinc-600 mt-0.5">{cls.students?.length ?? 0} students</p>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-white/10 space-y-3">
          <div>
            <p className="text-xs text-zinc-500 mb-0.5">Signed in as</p>
            <p className="text-sm text-white font-medium truncate">{user?.name}</p>
            <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        {selectedClass ? (
          <ClassWorkspace cls={selectedClass} onBack={() => setSelectedClass(null)} />
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 rounded-2xl bg-amber-400/10 flex items-center justify-center mx-auto mb-4">
                <GraduationCap size={32} className="text-amber-400" />
              </div>
              <h2 className="text-xl font-semibold font-display text-white mb-2">Teacher Dashboard</h2>
              <p className="text-zinc-400 text-sm mb-6">Select a class from the sidebar to manage its stream, labs, students, grades, and contests.</p>
              <Btn onClick={() => setShowCreateModal(true)} className="mx-auto"><Plus size={15} /> Create Your First Class</Btn>
            </div>
          </div>
        )}
      </main>

      {showCreateModal && (
        <CreateClassModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(newClass) => {
            setClasses((prev) => [...prev, newClass]);
            setSelectedClass(newClass);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}
