import React, { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export default function Submissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_BASE_URL}/api/v1/submissions`, {
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
        setSubmissions(data.submissions || []);
      } catch (err) {
        console.error("Error fetching submissions:", err);
        setError("Failed to load submissions.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  return (
    <div className="submissions-table-wrap">
      <h2 className="submissions-table__title">Recent Submissions</h2>

      {error && (
        <div className="submissions-table__error">
          {error}
        </div>
      )}

      <div className="submissions-table">
        <table className="submissions-table__table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Problem</th>
              <th>Language</th>
              <th>Time</th>
              <th>Memory</th>
              <th>Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="submissions-table__loading">
                  Loading submissions...
                </td>
              </tr>
            ) : submissions.length === 0 ? (
              <tr>
                <td colSpan={6} className="submissions-table__empty">
                  No submissions found.
                </td>
              </tr>
            ) : (
              submissions.map((s, index) => (
                <tr key={s._id || index}>
                  <td
                    className={`status-${s.status
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                    style={{ fontWeight: "bold" }}
                  >
                    {s.status}
                  </td>
                  <td>{s.problem_id?.title || "Problem"}</td>
                  <td>{s.language || ""}</td>
                  <td>{s.execution_time ? `${s.execution_time}s` : "N/A"}</td>
                  <td>{s.memory ? `${s.memory} KB` : "N/A"}</td>
                  <td>
                    {s.submitted_at
                      ? new Date(s.submitted_at).toLocaleString()
                      : "N/A"}
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