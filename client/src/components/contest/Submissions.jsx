import React, { useEffect, useState } from "react";
import { Check, X } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const StatusBadge = (status)=>{
  if (status === "Accepted"){
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-400">
        <Check size="15" strokeWidth={3} />
        
      </span>
    );
  }
  if (status == "Wrong Answer"){
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-400">
        <X size="15" strokeWidth={3} />
      </span>
    );
  }
  return <span className="text-slate-300 font-medium">{status}</span>
}

export default function Submissions({ isWidget = false, limit, contestId, labId }) {

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        setError("");

        let url = `${API_BASE_URL}/api/v1/submissions`;
        if (contestId) {
          url += `?contest_id=${contestId}`;
        } else if (labId) {
          url += `?lab_id=${labId}`;
        }


        const res = await fetch(url, {
          method: "GET",
          credentials: "include", // needed because backend auth uses cookies
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Request failed with status ${res.status}`);
        }

        const data = await res.json();
        let fetchedData = (data.submissions || []);
        if (limit) {
          fetchedData = fetchedData.slice(0, limit);
        }
        setSubmissions(fetchedData);
      } catch (err) {
        console.error("Error fetching submissions:", err);
        setError("Failed to load submissions.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [limit, contestId, labId]);


  return (
    <div className={isWidget ? "" : "mb-6"}>
      {!isWidget && (
        <h2 className="text-xl font-bold text-white mb-4">Recent Submissions</h2>
      )}
      {error && (
        <div className="text-red-400 bg-red-400/10 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="bg-card-dark border border-white/5 rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-slate-400 font-medium text-sm px-8 py-3">Problem</th>
              <th className="text-slate-400 font-medium text-sm px-8 py-3">Status</th>
              <th className="text-slate-400 font-medium text-sm px-8 py-3">Language</th>
              {!isWidget && (
                <>
                  <th className="text-slate-400 font-medium text-sm text-center px-8 py-3">Time</th>
                  <th className="text-slate-400 font-medium text-sm text-center px-8 py-3">Memory</th>
                </>
              )}
              <th className="text-slate-400 font-medium text-sm px-8 py-3">Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={isWidget ? 4 : 6} className="text-slate-500 text-center p-4">
                  Loading...
                </td>
              </tr>
            ) : submissions.length === 0 ? (
              <tr>
                <td colSpan={isWidget ? 4 : 6} className="text-slate-500 text-center p-4">
                  No submissions found.
                </td>
              </tr>
            ) : (
              submissions.map((s, index) => (
                <tr key={s._id || index} className="border-b border-white/10 hover:bg-white/[0.02]">
                  <td className="px-8 py-3 text-white">{s.problem_id?.title || "Problem"}</td>
                  <td className="px-8 py-3 text-white">{StatusBadge(s.status)}</td>
                  <td className="px-8 py-3 text-slate-300">{s.language || ""}</td>
                  {!isWidget && (
                    <>
                      <td className="px-8 py-3 text-slate-400 text-center">{s.execution_time ? `${s.execution_time}s` : "N/A"}</td>
                      <td className="px-8 py-3 text-slate-400 text-center">{s.memory ? `${s.memory} KB` : "N/A"}</td>
                    </>
                  )}
                  <td className="px-8 py-3 text-slate-400">
                    {s.submitted_at ? new Date(s.submitted_at).toLocaleString() : "N/A"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}