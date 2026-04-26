import { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Context } from "../main";
import api from "../api/client";
import { toast } from "react-toastify";
import {
  BarChart2, Users, Trophy, Code2, BookOpen, Medal, FileText,
  Plus, Trash2, Edit2, Search, Shield, ChevronDown,
  ChevronLeft, ChevronRight, X, Download, Printer,
  Loader2, LogOut, UserCheck, Info,
} from "lucide-react";
import { TableSkeleton } from "../components/contestlist/Skeletons";

// ── Pagination ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 8;

function usePagination(items, resetKey = "") {
  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [resetKey]);
  const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const paginated = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return { page, setPage, pages, paginated };
}

function FilterSelect({ value, onChange, className = "", children }) {
  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      <select
        value={value}
        onChange={onChange}
        className="appearance-none w-full bg-zinc-800 border border-white/10 rounded-lg pl-3 pr-8 py-2 text-sm text-white focus:outline-none focus:border-amber-400/40 focus:ring-1 focus:ring-amber-400/10 hover:border-white/20 transition-colors cursor-pointer"
      >
        {children}
      </select>
      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
    </div>
  );
}

function PaginationBar({ page, pages, setPage }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-4">
      <span className="text-xs text-zinc-500">Page {page} of {pages}</span>
      <div className="flex gap-2">
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg bg-zinc-800 border border-white/10 text-zinc-400 disabled:opacity-40 hover:text-white transition-colors">
          <ChevronLeft size={14} />
        </button>
        <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="p-2 rounded-lg bg-zinc-800 border border-white/10 text-zinc-400 disabled:opacity-40 hover:text-white transition-colors">
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ── Shared helpers ────────────────────────────────────────────────────────────
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
  w.document.close();
  w.print();
}

function SectionHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-semibold font-display text-white">{title}</h2>
      {action}
    </div>
  );
}

function Card({ children, className = "" }) {
  return <div className={`bg-zinc-800 border border-white/10 rounded-xl p-5 ${className}`}>{children}</div>;
}

function Badge({ color, children }) {
  const colors = {
    green: "bg-emerald-500/15 text-emerald-400",
    red: "bg-red-500/15 text-red-400",
    amber: "bg-amber-400/15 text-amber-400",
    blue: "bg-blue-500/15 text-blue-400",
    zinc: "bg-zinc-700 text-zinc-400",
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[color] ?? colors.zinc}`}>{children}</span>;
}

// ── OVERVIEW ──────────────────────────────────────────────────────────────────
function OverviewSection() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/stats").then(({ data }) => setStats(data.stats)).catch(() => toast.error("Failed to load stats")).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-amber-400" size={32} /></div>;
  if (!stats) return null;

  const maxCount = Math.max(...(stats.recentActivity.map((d) => d.count) || [1]), 1);

  return (
    <div className="space-y-6">
      <SectionHeader title="Platform Overview" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <p className="text-sm font-medium text-zinc-300 mb-4">Submissions — Last 7 Days</p>
          <div className="flex items-end gap-2 h-32">
            {stats.recentActivity.length === 0 ? (
              <p className="text-zinc-500 text-sm">No data</p>
            ) : (
              stats.recentActivity.map((d) => (
                <div key={d._id} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-zinc-500">{d.count}</span>
                  <div
                    className="w-full bg-amber-400/80 rounded-t"
                    style={{ height: `${(d.count / maxCount) * 96}px`, minHeight: "4px" }}
                  />
                  <span className="text-xs text-zinc-600 truncate w-full text-center">{d._id.slice(5)}</span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <p className="text-sm font-medium text-zinc-300 mb-4">Users by Role</p>
          <div className="space-y-3">
            {Object.entries(stats.usersByRole).map(([role, count]) => (
              <div key={role} className="flex items-center gap-3">
                <span className="text-sm text-zinc-400 w-20">{role}</span>
                <div className="flex-1 bg-zinc-700 rounded-full h-2">
                  <div
                    className="bg-amber-400 h-2 rounded-full transition-all"
                    style={{ width: `${stats.totalUsers ? (count / stats.totalUsers) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm text-white w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── USERS ─────────────────────────────────────────────────────────────────────
function UsersSection() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [roleDropdown, setRoleDropdown] = useState(null);

  const fetchUsers = async (p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 8 });
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);
      const { data } = await api.get(`/admin/users?${params}`);
      setUsers(data.users);
      setTotal(data.total);
      setPages(data.pages);
    } catch { toast.error("Failed to load users"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(1); setPage(1); }, [search, roleFilter]);

  const changeRole = async (userId, role) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      toast.success(`Role updated to ${role}`);
      setRoleDropdown(null);
      fetchUsers(page);
    } catch (e) { toast.error(e.response?.data?.message || "Failed"); }
  };

  const deleteUser = async (userId, name) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success("User deleted");
      fetchUsers(page);
    } catch (e) { toast.error(e.response?.data?.message || "Failed"); }
  };

  const roleColors = { Admin: "amber", Teacher: "blue", TA: "purple", Student: "zinc" };
  const ROLES = ["Student", "Teacher", "TA", "Admin"];

  return (
    <div>
      <SectionHeader title="User Management" action={<span className="text-sm text-zinc-400">{total} users</span>} />

      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email…"
            className="w-full bg-zinc-800 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/50"
          />
        </div>
        <FilterSelect value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </FilterSelect>
      </div>

      {loading ? <TableSkeleton /> : <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-zinc-900/50">
              {["Name", "Email", "Role", "Group", "Points", "Solved", "Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-zinc-500">No users found</td></tr>
            ) : users.map((u) => (
              <tr key={u._id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                <td className="px-4 py-3 text-white font-medium">{u.name}</td>
                <td className="px-4 py-3 text-zinc-400">{u.email}</td>
                <td className="px-4 py-3">
                  {(u.role === "Student" || u.role === "TA") ? (
                    <div className="relative inline-block">
                      <button
                        onClick={() => setRoleDropdown(roleDropdown === u._id ? null : u._id)}
                        className="flex items-center gap-1"
                      >
                        <Badge color={roleColors[u.role] ?? "zinc"}>{u.role}</Badge>
                        <ChevronDown size={12} className="text-zinc-500" />
                      </button>
                      {roleDropdown === u._id && (
                        <div className="absolute z-20 top-7 left-0 bg-zinc-800 border border-white/10 rounded-lg shadow-xl py-1 w-28">
                          {["Student", "TA"].map((r) => (
                            <button
                              key={r}
                              onClick={() => changeRole(u._id, r)}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-white/5 transition-colors ${u.role === r ? "text-amber-400" : "text-zinc-300"}`}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Badge color={roleColors[u.role] ?? "zinc"}>{u.role}</Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-zinc-400">{u.group || "—"}</td>
                <td className="px-4 py-3 text-amber-400 font-medium">{u.contest_points ?? 0}</td>
                <td className="px-4 py-3 text-zinc-300">{u.total_solved ?? 0}</td>
                <td className="px-4 py-3">
                  <button onClick={() => deleteUser(u._id, u.name)} className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>}

      <div className="flex items-center justify-between mt-4">
        <span className="text-xs text-zinc-500">Page {page} of {pages}</span>
        <div className="flex gap-2">
          <button onClick={() => { const p = Math.max(1, page - 1); setPage(p); fetchUsers(p); }} disabled={page === 1} className="p-2 rounded-lg bg-zinc-800 border border-white/10 text-zinc-400 disabled:opacity-40 hover:text-white transition-colors">
            <ChevronLeft size={14} />
          </button>
          <button onClick={() => { const p = Math.min(pages, page + 1); setPage(p); fetchUsers(p); }} disabled={page === pages} className="p-2 rounded-lg bg-zinc-800 border border-white/10 text-zinc-400 disabled:opacity-40 hover:text-white transition-colors">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── CONTESTS ──────────────────────────────────────────────────────────────────
function ContestsSection() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchContests = () => {
    setLoading(true);
    api.get("/admin/contests").then(({ data }) => setContests(data.contests)).catch(() => toast.error("Failed")).finally(() => setLoading(false));
  };
  useEffect(fetchContests, []);

  const endContest = async (id, name) => {
    if (!confirm(`End contest "${name}"?`)) return;
    try { await api.post(`/contests/${id}/end`); toast.success("Contest ended"); fetchContests(); }
    catch (e) { toast.error(e.response?.data?.message || "Failed"); }
  };

  const deleteContest = async (id, name) => {
    if (!confirm(`Delete contest "${name}"? This cannot be undone.`)) return;
    try { await api.delete(`/contests/${id}`); toast.success("Deleted"); fetchContests(); }
    catch (e) { toast.error(e.response?.data?.message || "Failed"); }
  };

  const now = new Date();
  const getStatus = (c) => {
    const start = new Date(c.start_time), end = new Date(c.end_time);
    if (c.is_active && now >= start && now <= end) return "Live";
    if (now < start) return "Upcoming";
    return "Ended";
  };

  const filtered = contests.filter((c) => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.created_by?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || getStatus(c) === statusFilter;
    return matchSearch && matchStatus;
  });
  const { page, setPage, pages, paginated: pageContests } = usePagination(filtered, search + statusFilter);

  return (
    <div>
      <SectionHeader title="All Contests" action={<span className="text-sm text-zinc-400">{filtered.length} / {contests.length}</span>} />
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or creator…" className="w-full bg-zinc-800 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/50" />
        </div>
        <FilterSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {["All", "Live", "Upcoming", "Ended"].map((s) => <option key={s}>{s}</option>)}
        </FilterSelect>
      </div>
      {loading ? <TableSkeleton /> : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-zinc-900/50">
                {["Name", "Creator", "Start", "End", "Status", "Participants", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageContests.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-zinc-500">No contests match filters</td></tr>
              ) : pageContests.map((c) => {
                const start = new Date(c.start_time), end = new Date(c.end_time);
                const statusLabel = getStatus(c);
                const isPast = statusLabel === "Ended";
                const statusColor = statusLabel === "Live" ? "green" : statusLabel === "Upcoming" ? "amber" : "zinc";
                return (
                  <tr key={c._id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3 text-white font-medium max-w-48 truncate">{c.name}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{c.created_by?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{start.toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{end.toLocaleDateString()}</td>
                    <td className="px-4 py-3"><Badge color={statusColor}>{statusLabel}</Badge></td>
                    <td className="px-4 py-3 text-zinc-300">{c.participants?.length ?? 0}</td>
                    <td className="px-4 py-3 flex gap-2">
                      {!isPast && <button onClick={() => endContest(c._id, c.name)} className="px-2 py-1 rounded text-xs bg-amber-400/10 text-amber-400 hover:bg-amber-400/20 transition-colors">End</button>}
                      <button onClick={() => deleteContest(c._id, c.name)} className="p-1.5 rounded text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={13} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
      <PaginationBar page={page} pages={pages} setPage={setPage} total={filtered.length} />
    </div>
  );
}

// ── PROBLEMS ──────────────────────────────────────────────────────────────────
const EMPTY_PROBLEM = { title: "", description: "", difficulty: "MEDIUM", category: "", time_limit: 2, memory_limit: 256, input_format: "", constraints: "", test_cases: [{ input: "", expected_output: "", is_sample: true }] };

function ProblemsSection() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | { mode: "create"|"edit", data: {} }
  const [form, setForm] = useState(EMPTY_PROBLEM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const fetch = () => {
    setLoading(true);
    api.get("/problems").then(({ data }) => setProblems(data.problems)).catch(() => toast.error("Failed")).finally(() => setLoading(false));
  };
  useEffect(fetch, []);

  const openCreate = () => { setForm(EMPTY_PROBLEM); setModal({ mode: "create" }); };
  const openEdit = (p) => {
    setForm({ ...p, test_cases: p.test_cases?.length ? p.test_cases : [{ input: "", expected_output: "", is_sample: true }] });
    setModal({ mode: "edit", id: p._id });
  };

  const save = async () => {
    if (!form.title || !form.description) { toast.error("Title and description required"); return; }
    setSaving(true);
    try {
      if (modal.mode === "create") {
        await api.post("/problems", form);
        toast.success("Problem created");
      } else {
        await api.put(`/problems/${modal.id}`, form);
        toast.success("Problem updated");
      }
      setModal(null);
      fetch();
    } catch (e) { toast.error(e.response?.data?.message || "Failed"); }
    finally { setSaving(false); }
  };

  const deleteProblem = async (id, title) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try { await api.delete(`/problems/${id}`); toast.success("Deleted"); fetch(); }
    catch (e) { toast.error(e.response?.data?.message || "Failed"); }
  };

  const addTestCase = () => setForm((f) => ({ ...f, test_cases: [...f.test_cases, { input: "", expected_output: "", is_sample: false }] }));
  const removeTestCase = (i) => setForm((f) => ({ ...f, test_cases: f.test_cases.filter((_, idx) => idx !== i) }));
  const updateTC = (i, field, value) => setForm((f) => ({ ...f, test_cases: f.test_cases.map((tc, idx) => idx === i ? { ...tc, [field]: value } : tc) }));

  const [diffFilter, setDiffFilter] = useState("All");
  const filtered = problems.filter((p) => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || (p.category || "").toLowerCase().includes(search.toLowerCase());
    const matchDiff = diffFilter === "All" || p.difficulty === diffFilter;
    return matchSearch && matchDiff;
  });
  const { page: probPage, setPage: setProbPage, pages: probPages, paginated: pageProblems } = usePagination(filtered, search + diffFilter);
  const diffColor = { EASY: "green", MEDIUM: "amber", HARD: "red" };

  return (
    <div>
      <SectionHeader
        title="Problem Bank"
        action={<span className="text-sm text-zinc-400">{filtered.length} / {problems.length} problems</span>}
      />

      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title or category…" className="w-full bg-zinc-800 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/50" />
        </div>
        <FilterSelect value={diffFilter} onChange={(e) => setDiffFilter(e.target.value)}>
          {["All", "EASY", "MEDIUM", "HARD"].map((d) => <option key={d}>{d}</option>)}
        </FilterSelect>
      </div>

      {loading ? <TableSkeleton /> : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-zinc-900/50">
                {["Title", "Difficulty", "Category", "Type", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageProblems.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-zinc-500">No problems match filters</td></tr>
              ) : pageProblems.map((p) => (
                <tr key={p._id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{p.title}</td>
                  <td className="px-4 py-3"><Badge color={diffColor[p.difficulty] ?? "zinc"}>{p.difficulty}</Badge></td>
                  <td className="px-4 py-3 text-zinc-400">{p.category || "—"}</td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">{p.contest_id ? "Linked" : <span className="text-emerald-400">Standalone</span>}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => openEdit(p)} className="p-1.5 rounded text-zinc-400 hover:text-amber-400 hover:bg-amber-400/10 transition-colors"><Edit2 size={13} /></button>
                    <button onClick={() => deleteProblem(p._id, p.title)} className="p-1.5 rounded text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      <PaginationBar page={probPage} pages={probPages} setPage={setProbPage} total={filtered.length} />

      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-8">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-2xl mx-4 shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="font-semibold text-white font-display">{modal.mode === "create" ? "Create Problem" : "Edit Problem"}</h3>
              <button onClick={() => setModal(null)} className="text-zinc-400 hover:text-white transition-colors"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs text-zinc-400 mb-1 block">Title *</label>
                  <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400/50" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Difficulty</label>
                  <select value={form.difficulty} onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))} className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400/50">
                    <option>EASY</option><option>MEDIUM</option><option>HARD</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Category</label>
                  <input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400/50" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Time Limit (s)</label>
                  <input type="number" value={form.time_limit} onChange={(e) => setForm((f) => ({ ...f, time_limit: e.target.value }))} className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400/50" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Memory Limit (MB)</label>
                  <input type="number" value={form.memory_limit} onChange={(e) => setForm((f) => ({ ...f, memory_limit: e.target.value }))} className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400/50" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-zinc-400 mb-1 block">Description *</label>
                  <textarea rows={4} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400/50 resize-none" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Input Format</label>
                  <textarea rows={2} value={form.input_format} onChange={(e) => setForm((f) => ({ ...f, input_format: e.target.value }))} className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400/50 resize-none" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Constraints</label>
                  <textarea rows={2} value={form.constraints} onChange={(e) => setForm((f) => ({ ...f, constraints: e.target.value }))} className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400/50 resize-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-zinc-400">Test Cases</label>
                  <button onClick={addTestCase} className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors"><Plus size={12} /> Add</button>
                </div>
                <div className="space-y-3">
                  {form.test_cases.map((tc, i) => (
                    <div key={i} className="bg-zinc-800/60 border border-white/5 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                          <input type="checkbox" checked={tc.is_sample} onChange={(e) => updateTC(i, "is_sample", e.target.checked)} className="accent-amber-400" />
                          Sample test case
                        </label>
                        {form.test_cases.length > 1 && (
                          <button onClick={() => removeTestCase(i)} className="text-zinc-600 hover:text-red-400 transition-colors"><X size={13} /></button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-zinc-500 mb-1">Input</p>
                          <textarea rows={2} value={tc.input} onChange={(e) => updateTC(i, "input", e.target.value)} className="w-full bg-zinc-900 border border-white/5 rounded px-2 py-1.5 text-xs text-white font-mono focus:outline-none resize-none" />
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500 mb-1">Expected Output</p>
                          <textarea rows={2} value={tc.expected_output} onChange={(e) => updateTC(i, "expected_output", e.target.value)} className="w-full bg-zinc-900 border border-white/5 rounded px-2 py-1.5 text-xs text-white font-mono focus:outline-none resize-none" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-white/10 flex justify-end gap-3">
              <button onClick={() => setModal(null)} className="px-4 py-2 rounded-lg text-sm text-zinc-400 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">Cancel</button>
              <button onClick={save} disabled={saving} className="px-4 py-2 rounded-lg text-sm bg-amber-400 text-black font-medium hover:bg-amber-300 disabled:opacity-50 transition-colors flex items-center gap-2">
                {saving && <Loader2 size={13} className="animate-spin" />}
                {modal.mode === "create" ? "Create" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── CLASSES ───────────────────────────────────────────────────────────────────
function ClassesSection() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [joinFilter, setJoinFilter] = useState("All");

  useEffect(() => {
    api.get("/admin/classes").then(({ data }) => setClasses(data.classes)).catch(() => toast.error("Failed")).finally(() => setLoading(false));
  }, []);

  const filtered = classes.filter((c) => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.teacher?.name?.toLowerCase().includes(search.toLowerCase()) || c.branch?.toLowerCase().includes(search.toLowerCase());
    const matchJoin = joinFilter === "All" || (joinFilter === "Open" ? c.joiningOpen : !c.joiningOpen);
    return matchSearch && matchJoin;
  });
  const { page: clsPage, setPage: setClsPage, pages: clsPages, paginated: pageClasses } = usePagination(filtered, search + joinFilter);

  return (
    <div>
      <SectionHeader title="All Classes" action={<span className="text-sm text-zinc-400">{filtered.length} / {classes.length}</span>} />
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search class name, teacher, branch…" className="w-full bg-zinc-800 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/50" />
        </div>
        <FilterSelect value={joinFilter} onChange={(e) => setJoinFilter(e.target.value)}>
          {["All", "Open", "Closed"].map((s) => <option key={s}>{s}</option>)}
        </FilterSelect>
      </div>
      {loading ? <TableSkeleton /> : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-zinc-900/50">
                {["Class Name", "Teacher", "Year / Branch", "Section", "Students", "Join Code", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageClasses.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-zinc-500">No classes match filters</td></tr>
              ) : pageClasses.map((c) => (
                <tr key={c._id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-zinc-400">{c.teacher?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-zinc-400">{c.year} / {c.branch}</td>
                  <td className="px-4 py-3 text-zinc-400">{c.section}</td>
                  <td className="px-4 py-3 text-zinc-300">{c.students?.length ?? 0}</td>
                  <td className="px-4 py-3 font-mono text-xs text-amber-400">{c.joinCode}</td>
                  <td className="px-4 py-3"><Badge color={c.joiningOpen ? "green" : "zinc"}>{c.joiningOpen ? "Open" : "Closed"}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      <PaginationBar page={clsPage} pages={clsPages} setPage={setClsPage} total={filtered.length} />
    </div>
  );
}

// ── LEADERBOARD ───────────────────────────────────────────────────────────────
function LeaderboardSection() {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/admin/users?sort=points&limit=200").then(({ data }) => setAllUsers(data.users)).catch(() => toast.error("Failed")).finally(() => setLoading(false));
  }, []);

  // Only Students and TAs
  const filtered = allUsers
    .filter((u) => u.role === "Student" || u.role === "TA")
    .filter((u) => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
  const rows = filtered.map((u, i) => ({ ...u, rank: i + 1 }));
  const { page: lbPage, setPage: setLbPage, pages: lbPages, paginated: pageRows } = usePagination(rows, search);

  const cols = [
    { key: "rank", label: "Rank" }, { key: "name", label: "Name" },
    { key: "email", label: "Email" }, { key: "role", label: "Role" },
    { key: "contest_points", label: "Points" }, { key: "total_solved", label: "Solved" }, { key: "streak", label: "Streak" },
  ];

  return (
    <div>
      <SectionHeader
        title="Global Leaderboard"
        action={
          <div className="flex gap-2">
            <button onClick={() => exportCSV(rows, cols, "leaderboard.csv")} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors">
              <Download size={14} /> CSV
            </button>
            <button onClick={() => exportPDF(rows, cols, "Global Leaderboard")} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors">
              <Printer size={14} /> PDF
            </button>
          </div>
        }
      />
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search student or TA…" className="w-full max-w-sm bg-zinc-800 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/50" />
      </div>
      {loading ? <TableSkeleton /> : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-zinc-900/50">
                {["#", "Name", "Email", "Role", "Points", "Solved", "Streak"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-zinc-500">No results</td></tr>
              ) : pageRows.map((u) => (
                <tr key={u._id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3">
                    {u.rank <= 3 ? <span className={`font-bold text-base ${u.rank === 1 ? "text-amber-400" : u.rank === 2 ? "text-zinc-300" : "text-amber-700"}`}>#{u.rank}</span>
                      : <span className="text-zinc-500">{u.rank}</span>}
                  </td>
                  <td className="px-4 py-3 text-white font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-zinc-400">{u.email}</td>
                  <td className="px-4 py-3"><Badge color={u.role === "TA" ? "purple" : "zinc"}>{u.role}</Badge></td>
                  <td className="px-4 py-3 text-amber-400 font-semibold">{u.contest_points ?? 0}</td>
                  <td className="px-4 py-3 text-zinc-300">{u.total_solved ?? 0}</td>
                  <td className="px-4 py-3 text-zinc-300">{u.streak ?? 0} 🔥</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      <PaginationBar page={lbPage} pages={lbPages} setPage={setLbPage} total={rows.length} />
    </div>
  );
}

// ── REPORTS ───────────────────────────────────────────────────────────────────
function ReportsSection() {
  const [contests, setContests] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    api.get("/admin/contests").then(({ data }) => setContests(data.contests)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedId) { setLogs([]); return; }
    setLoading(true);
    api.get(`/admin/contests/${selectedId}/ip-logs`).then(({ data }) => setLogs(data.logs)).catch(() => toast.error("Failed to load logs")).finally(() => setLoading(false));
  }, [selectedId]);

  const cols = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "ip", label: "IP Address" },
    { key: "event", label: "Event" },
    { key: "timestamp", label: "Timestamp" },
  ];
  const rows = logs.map((l) => ({ name: l.user_id?.name ?? "—", email: l.user_id?.email ?? "—", ip: l.ip, event: l.event, timestamp: new Date(l.timestamp).toLocaleString() }));
  const selectedContest = contests.find((c) => c._id === selectedId);
  const { page: ipPage, setPage: setIpPage, pages: ipPages, paginated: pageIpRows } = usePagination(rows, selectedId);

  return (
    <div>
      <SectionHeader title="Reports & IP Logs" />

      <Card className="mb-4">
        <label className="text-xs text-zinc-400 mb-2 block">Select Contest</label>
        <FilterSelect value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="w-full max-w-sm">
          <option value="">— Choose a contest —</option>
          {contests.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </FilterSelect>
      </Card>

      {selectedId && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-zinc-400">{logs.length} log entries for <span className="text-white">{selectedContest?.name}</span></p>
            <div className="relative">
              <button onClick={() => setExportOpen((v) => !v)} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-white/10 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors">
                <Download size={14} /> Export <ChevronDown size={13} className={`transition-transform ${exportOpen ? "rotate-180" : ""}`} />
              </button>
              {exportOpen && (
                <div className="absolute right-0 top-full mt-1 bg-zinc-800 border border-white/10 rounded-lg shadow-xl py-1 z-10 w-40">
                  <button onClick={() => { exportCSV(rows, cols, `ip-logs-${selectedId}.csv`); setExportOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors">
                    <Download size={13} /> Download CSV
                  </button>
                  <button onClick={() => { exportPDF(rows, cols, `IP Logs — ${selectedContest?.name}`); setExportOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors">
                    <Printer size={13} /> Print / PDF
                  </button>
                </div>
              )}
            </div>
          </div>

          {loading ? <TableSkeleton /> : (
          <Card className="p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-zinc-900/50">
                  {["Name", "Email", "IP Address", "Event", "Timestamp"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageIpRows.length === 0 ? <tr><td colSpan={5} className="text-center py-8 text-zinc-500">No IP logs yet for this contest</td></tr>
                  : pageIpRows.map((r, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3 text-white">{r.name}</td>
                      <td className="px-4 py-3 text-zinc-400">{r.email}</td>
                      <td className="px-4 py-3 font-mono text-sm text-amber-400">{r.ip}</td>
                      <td className="px-4 py-3"><Badge color={r.event === "register" ? "blue" : "green"}>{r.event}</Badge></td>
                      <td className="px-4 py-3 text-zinc-400 text-xs">{r.timestamp}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </Card>)}
          <PaginationBar page={ipPage} pages={ipPages} setPage={setIpPage} total={rows.length} />
        </div>
      )}
    </div>
  );
}

// ── TEACHER WHITELIST ─────────────────────────────────────────────────────────
function WhitelistSection() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchEntries = () => {
    setLoading(true);
    api.get("/admin/whitelist").then(({ data }) => setEntries(data.entries)).catch(() => toast.error("Failed to load whitelist")).finally(() => setLoading(false));
  };
  useEffect(fetchEntries, []);

  const addEntry = async () => {
    if (!email.trim()) return;
    setAdding(true);
    try {
      await api.post("/admin/whitelist", { email: email.trim() });
      toast.success(`${email.trim()} added to whitelist`);
      setEmail("");
      fetchEntries();
    } catch (e) { toast.error(e.response?.data?.message || "Failed"); }
    finally { setAdding(false); }
  };

  const removeEntry = async (id, entryEmail) => {
    if (!confirm(`Remove "${entryEmail}" from the whitelist?`)) return;
    try {
      await api.delete(`/admin/whitelist/${id}`);
      toast.success("Entry removed");
      fetchEntries();
    } catch (e) { toast.error(e.response?.data?.message || "Failed"); }
  };

  const filtered = entries.filter((e) => {
    if (statusFilter === "Pending") return !e.usedAt;
    if (statusFilter === "Used") return !!e.usedAt;
    return true;
  });
  const { page, setPage, pages, paginated } = usePagination(filtered, statusFilter);

  return (
    <div>
      <SectionHeader title="Teacher Whitelist" action={<span className="text-sm text-zinc-400">{entries.filter((e) => !e.usedAt).length} pending</span>} />

      <Card className="mb-4">
        <p className="text-xs text-zinc-400 mb-3 flex items-center gap-1.5">
          <Info size={12} className="text-amber-400" />
          Add a teacher's email here before they register. Only whitelisted emails will receive the Teacher role — all others are downgraded to Student on OTP verification.
        </p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addEntry()}
              placeholder="teacher@jklu.edu.in"
              className="w-full bg-zinc-900 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/50"
            />
          </div>
          <button
            onClick={addEntry}
            disabled={adding || !email.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-amber-400 text-black rounded-lg text-sm font-medium hover:bg-amber-300 disabled:opacity-50 transition-colors"
          >
            {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Add
          </button>
        </div>
      </Card>

      <div className="flex justify-end mb-4">
        <FilterSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {["All", "Pending", "Used"].map((s) => <option key={s}>{s}</option>)}
        </FilterSelect>
      </div>

      {loading ? <TableSkeleton /> : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-zinc-900/50">
                {["Email", "Added By", "Status", "Date Added", "Used On", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-zinc-500">No entries</td></tr>
              ) : paginated.map((entry) => (
                <tr key={entry._id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 font-mono text-sm text-white">{entry.email}</td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">{entry.addedBy?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    {entry.usedAt
                      ? <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/15 text-emerald-400">Used</span>
                      : <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-400/15 text-amber-400">Pending</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">{new Date(entry.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">{entry.usedAt ? new Date(entry.usedAt).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3">
                    {!entry.usedAt && (
                      <button onClick={() => removeEntry(entry._id, entry.email)} className="p-1.5 rounded text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      <PaginationBar page={page} pages={pages} setPage={setPage} total={filtered.length} />
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
const NAV = [
  { key: "overview", label: "Overview", icon: BarChart2 },
  { key: "users", label: "User Management", icon: Users },
  { key: "whitelist", label: "Teacher Whitelist", icon: UserCheck },
  { key: "contests", label: "Contests", icon: Trophy },
  { key: "problems", label: "Problem Bank", icon: Code2 },
  { key: "classes", label: "Classes", icon: BookOpen },
  { key: "leaderboard", label: "Leaderboard", icon: Medal },
  { key: "reports", label: "Reports & IP Logs", icon: FileText },
];

export default function AdminDashboard() {
  const { user, isAuthenticated, setIsAuthenticated, setUser } = useContext(Context);
  const navigate = useNavigate();
  const [active, setActive] = useState("overview");

  const handleSignOut = async () => {
    try { await api.get("/user/logout"); } catch { /* ignore */ }
    setIsAuthenticated(false);
    setUser(null);
    navigate("/auth", { replace: true });
  };

  if (!isAuthenticated) return <Navigate to="/auth" />;
  if (user?.role !== "Admin") return <Navigate to="/" />;

  const SECTIONS = { overview: OverviewSection, users: UsersSection, whitelist: WhitelistSection, contests: ContestsSection, problems: ProblemsSection, classes: ClassesSection, leaderboard: LeaderboardSection, reports: ReportsSection };
  const ActiveSection = SECTIONS[active];

  return (
    <div className="min-h-screen bg-zinc-900 flex font-sans text-white">
      <aside className="w-60 flex-shrink-0 bg-zinc-800/50 border-r border-white/10 flex flex-col sticky top-0 h-screen overflow-y-auto">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 flex items-center justify-center">
              <Shield size={16} className="text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold font-display text-white">Admin Panel</p>
              <p className="text-xs text-zinc-500">JKLU Platform</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${active === key ? "bg-amber-400/10 text-amber-400 font-medium" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>

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

      <main className="flex-1 overflow-y-auto p-8">
        <ActiveSection />
      </main>
    </div>
  );
}
