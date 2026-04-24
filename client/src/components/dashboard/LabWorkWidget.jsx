import { BookOpen, Clock, CheckCircle2, AlertCircle, Circle } from "lucide-react";

// ── Placeholder data matching the Lab + Class schema ──────────────────────────
// Lab: { title, deadline }  |  Class: { name, courseCode (to-be-added) }
const PLACEHOLDER_LABS = [
  {
    id: "1",
    title: "Binary Search Tree Implementation",
    courseCode: "CS301",
    courseName: "Data Structures & Algorithms",
    deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // tomorrow
    maxMarks: 20,
    marksObtained: null,
    status: "pending", // pending | submitted | graded | overdue
  },
  {
    id: "2",
    title: "Merge Sort & Quick Sort",
    courseCode: "CS301",
    courseName: "Data Structures & Algorithms",
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    maxMarks: 15,
    marksObtained: null,
    status: "submitted",
  },
  {
    id: "3",
    title: "Graph Traversal (BFS & DFS)",
    courseCode: "CS402",
    courseName: "Algorithm Design",
    deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // past
    maxMarks: 25,
    marksObtained: 22,
    status: "graded",
  },
  {
    id: "4",
    title: "Dynamic Programming Problems",
    courseCode: "CS402",
    courseName: "Algorithm Design",
    deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    maxMarks: 30,
    marksObtained: null,
    status: "overdue",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDeadline(date) {
  const now = new Date();
  const diff = date - now;
  const absDiff = Math.abs(diff);
  const hours = Math.floor(absDiff / (1000 * 60 * 60));
  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));

  if (diff < 0) {
    return { label: `${days}d overdue`, urgent: true };
  }
  if (hours < 24) {
    return { label: `${hours}h left`, urgent: true };
  }
  if (days === 1) {
    return { label: "Tomorrow", urgent: true };
  }
  return {
    label: date.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    urgent: false,
  };
}

const STATUS_CONFIG = {
  pending: {
    icon: Circle,
    color: "text-white/40",
    bg: "bg-white/5",
    border: "border-white/10",
    label: "Pending",
  },
  submitted: {
    icon: CheckCircle2,
    color: "text-sky-400",
    bg: "bg-sky-400/10",
    border: "border-sky-400/20",
    label: "Submitted",
  },
  graded: {
    icon: CheckCircle2,
    color: "text-[#e6d15a]",
    bg: "bg-[#e6d15a]/10",
    border: "border-[#e6d15a]/20",
    label: "Graded",
  },
  overdue: {
    icon: AlertCircle,
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/20",
    label: "Overdue",
  },
};

// ── Marks display ─────────────────────────────────────────────────────────────
function MarksDisplay({ lab }) {
  if (lab.status === "graded" && lab.marksObtained !== null) {
    const pct = (lab.marksObtained / lab.maxMarks) * 100;
    const color =
      pct >= 80
        ? "text-[#e6d15a]"
        : pct >= 50
        ? "text-sky-400"
        : "text-red-400";
    return (
      <div className="text-right shrink-0">
        <span className={`text-sm font-bold ${color}`}>
          {lab.marksObtained}
        </span>
        <span className="text-[10px] text-white/30">/{lab.maxMarks}</span>
      </div>
    );
  }
  return (
    <div className="text-right shrink-0">
      <span className="text-[11px] text-white/30 font-medium">
        {lab.maxMarks} marks
      </span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function LabWorkWidget() {
  const labs = PLACEHOLDER_LABS;

  const pending = labs.filter((l) => l.status === "pending" || l.status === "overdue").length;
  const submitted = labs.filter((l) => l.status === "submitted" || l.status === "graded").length;

  return (
    <div className="bg-card-dark rounded-xl border border-white/5 shadow-lg overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#e6d15a]/10 flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5 text-[#e6d15a]" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-white">Lab Work</h3>
            <p className="text-[10px] text-white/40 mt-0.5">
              {pending} pending &middot; {submitted} done
            </p>
          </div>
        </div>
        <a
          href="/labs"
          className="text-[11px] font-semibold text-[#e6d15a] hover:text-white transition-colors"
        >
          View All
        </a>
      </div>

      {/* ── Column Headers ── */}
      <div className="grid grid-cols-12 gap-3 px-6 py-2 border-b border-white/5 bg-white/[0.02]">
        <div className="col-span-5 text-[10px] font-semibold tracking-wider uppercase text-white/25">
          Lab / Course
        </div>
        <div className="col-span-3 text-[10px] font-semibold tracking-wider uppercase text-white/25 text-center">
          Deadline
        </div>
        <div className="col-span-2 text-[10px] font-semibold tracking-wider uppercase text-white/25 text-center">
          Status
        </div>
        <div className="col-span-2 text-[10px] font-semibold tracking-wider uppercase text-white/25 text-right">
          Marks
        </div>
      </div>

      {/* ── Rows ── */}
      <div className="divide-y divide-white/[0.04]">
        {labs.map((lab) => {
          const deadline = formatDeadline(lab.deadline);
          const statusCfg = STATUS_CONFIG[lab.status];
          const StatusIcon = statusCfg.icon;

          return (
            <div
              key={lab.id}
              className="grid grid-cols-12 gap-3 px-6 py-3.5 items-center hover:bg-white/[0.02] transition-colors group"
            >
              {/* Lab name + course */}
              <div className="col-span-5 min-w-0">
                <p className="text-[13px] font-medium text-white truncate group-hover:text-[#e6d15a] transition-colors">
                  {lab.title}
                </p>
                <p className="text-[10px] text-white/40 mt-0.5 truncate">
                  <span className="font-semibold text-white/50">
                    {lab.courseCode}
                  </span>{" "}
                  &middot; {lab.courseName}
                </p>
              </div>

              {/* Deadline */}
              <div className="col-span-3 flex items-center justify-center gap-1.5">
                <Clock
                  className={`w-3 h-3 shrink-0 ${
                    deadline.urgent ? "text-red-400" : "text-white/30"
                  }`}
                />
                <span
                  className={`text-[11px] font-medium ${
                    deadline.urgent ? "text-red-400" : "text-white/50"
                  }`}
                >
                  {deadline.label}
                </span>
              </div>

              {/* Status chip */}
              <div className="col-span-2 flex justify-center">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusCfg.bg} ${statusCfg.border} ${statusCfg.color}`}
                >
                  <StatusIcon className="w-2.5 h-2.5" />
                  {statusCfg.label}
                </span>
              </div>

              {/* Marks */}
              <div className="col-span-2">
                <MarksDisplay lab={lab} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Footer hint ── */}
      <div className="px-6 py-3 border-t border-white/5 bg-white/[0.01]">
        <p className="text-[10px] text-white/25 text-center">
          Marks are updated after grading by your instructor
        </p>
      </div>
    </div>
  );
}
