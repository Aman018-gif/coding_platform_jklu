import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import api from "../../api/client";
import { BookOpen, Clock, CheckCircle2, AlertCircle, Circle, Loader2 } from "lucide-react";

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
  const [labs, setLabs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const { data } = await api.get("/labs/my-labs");
        // Convert string dates to Date objects
        const formattedLabs = data.labs.map(lab => ({
          ...lab,
          deadline: lab.deadline ? new Date(lab.deadline) : null
        }));
        setLabs(formattedLabs);
      } catch (error) {
        console.error("Error fetching labs for widget:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLabs();
  }, []);

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
        <Link
          to="/my-classes"
          className="text-[11px] font-semibold text-[#e6d15a] hover:text-white transition-colors"
        >
          View All
        </Link>

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
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-5 h-5 text-white/50 animate-spin" />
          </div>
        ) : labs.length === 0 ? (
          <div className="text-center py-8 text-[11px] text-white/40">
            No lab work assigned yet.
          </div>
        ) : (
          labs.map((lab) => {
            const deadline = lab.deadline ? formatDeadline(lab.deadline) : { label: "No deadline", urgent: false };
            const statusCfg = STATUS_CONFIG[lab.status] || STATUS_CONFIG.pending;
            const StatusIcon = statusCfg.icon;

            return (
              <Link
                key={lab.id}
                to={`/class/${lab.class_id}/labs/${lab.id}`}
                className="grid grid-cols-12 gap-3 px-6 py-3.5 items-center hover:bg-white/[0.02] transition-colors group cursor-pointer"
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
                    className={`w-3 h-3 shrink-0 ${deadline.urgent ? "text-red-400" : "text-white/30"
                      }`}
                  />
                  <span
                    className={`text-[11px] font-medium ${deadline.urgent ? "text-red-400" : "text-white/50"
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
              </Link>
            );
          }))}
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
