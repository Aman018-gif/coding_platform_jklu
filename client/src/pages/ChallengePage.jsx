import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useContext } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import api from "../api/client";
import Navbar from "../layout/Navbar";
import CodeEditor, { LANGUAGE_IDS } from "../components/editor/CodeEditor";
import TestCasesConsole from "../components/editor/TestCasesConsole";
import "../styles/ChallengePage.css";

const defaultCode = `# WRITE CODE HERE
def solve():
    pass
`;

export default function ChallengePage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const contestId = searchParams.get("contest");
  const { isAuthenticated } = useContext(Context);

  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState(defaultCode);
  const [languageId, setLanguageId] = useState(71);
  const [loading, setLoading] = useState(true);
  const [runResult, setRunResult] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCaseIndex, setSelectedCaseIndex] = useState(0);
  const [personalNotes, setPersonalNotes] = useState("");

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const { data } = await api.get(`/problems/${id}`);
        setProblem(data.problem);
      } catch {
        setProblem(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProblem();
  }, [id]);

  const handleRun = async () => {
    setRunning(true);
    setRunResult(null);
    try {
      const { data } = await api.post("/submissions/run", {
        source_code: code,
        language_id: languageId,
        problem_id: id,
      });
      setRunResult(data.run_result || null);
    } catch (err) {
      const res = err.response?.data;
      setRunResult(res?.run_result || { status: "Error", stdout: "", stderr: res?.message || err.message });
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmissionResult(null);
    try {
      const { data } = await api.post("/submissions/submit", {
        source_code: code,
        language_id: languageId,
        problem_id: id,
        contest_id: contestId || undefined,
      });
      setSubmissionResult(data.submission || null);
    } catch (err) {
      const res = err.response?.data;
      setSubmissionResult({
        status: res?.message || "Error",
        passed_tests: 0,
        total_tests: 0,
        run_output: [],
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) return <Navigate to="/auth" />;
  if (loading && !problem) return <div className="challenge-page__loading">Loading...</div>;
  if (!problem) return <div className="challenge-page__error">Problem not found.</div>;

  const testCases = problem.test_cases || [];
  const sampleCases = testCases.filter((t) => t.is_sample);
  const displayCases = sampleCases.length ? sampleCases : testCases.slice(0, 3);
  const difficulty = (problem.difficulty || "MEDIUM").toLowerCase();

  return (
    <div className="challenge-page">
      <Navbar />
      <div className="challenge-page__body">
        <div className="challenge-page__split">
          <div className="challenge-page__panel-left">
            <div className="challenge-page__header">
              <h2 className="challenge-page__title">
                {contestId ? "CONTEST" : "PROBLEM"} / {problem.title}
              </h2>
              <span className={`challenge-page__badge challenge-page__badge--${difficulty}`}>
                {problem.difficulty}
              </span>
            </div>
            <div className="challenge-page__scroll">
              <p className="challenge-page__desc">{problem.description}</p>
              {problem.input_format && (
                <details className="challenge-page__details">
                  <summary>INPUT FORMAT</summary>
                  <pre>{problem.input_format}</pre>
                </details>
              )}
              {displayCases.length > 0 && (
                <div>
                  <div className="challenge-page__example-title">Example</div>
                  <div className="challenge-page__example-grid">
                    <div>
                      <div className="challenge-page__example-label">INPUT</div>
                      <pre className="challenge-page__example-pre">{displayCases[0].input}</pre>
                    </div>
                    <div>
                      <div className="challenge-page__example-label">OUTPUT</div>
                      <pre className="challenge-page__example-pre">{displayCases[0].expected_output}</pre>
                    </div>
                  </div>
                </div>
              )}
              {problem.constraints && (
                <details className="challenge-page__details">
                  <summary>CONSTRAINTS</summary>
                  <pre>{problem.constraints}</pre>
                </details>
              )}
              <details className="challenge-page__details" open>
                <summary>PERSONAL NOTES</summary>
                <textarea
                  className="challenge-page__notes-textarea"
                  placeholder="Draft your logic or keep track of edge cases here..."
                  value={personalNotes}
                  onChange={(e) => setPersonalNotes(e.target.value)}
                />
                <button type="button" onClick={() => setPersonalNotes("")} className="challenge-page__notes-clear">
                  CLEAR
                </button>
              </details>
            </div>
          </div>

          <div className="challenge-page__panel-right">
            <div className="challenge-page__editor-head">
              <select
                className="challenge-page__editor-select"
                value={languageId}
                onChange={(e) => setLanguageId(Number(e.target.value))}
              >
                {Object.entries(LANGUAGE_IDS).map(([label, lid]) => (
                  <option key={lid} value={lid}>{label}</option>
                ))}
              </select>
              <span className="challenge-page__autosaved">
                <span className="challenge-page__autosaved-dot" /> AUTOSAVED
              </span>
            </div>
            <div className="challenge-page__editor-area">
              <CodeEditor value={code} onChange={setCode} />
            </div>
          </div>
        </div>

        <div className="challenge-page__footer">
          <TestCasesConsole
            testCases={displayCases.length ? displayCases : [{ input: "", expected_output: "" }]}
            runResult={runResult}
            submissionResult={submissionResult}
            selectedCaseIndex={selectedCaseIndex}
            onSelectCase={setSelectedCaseIndex}
          />
          <div className="challenge-page__actions">
            <button
              type="button"
              onClick={handleRun}
              disabled={running}
              className="challenge-page__btn challenge-page__btn--run"
            >
              {running ? "Running..." : "RUN CODE"}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="challenge-page__btn challenge-page__btn--submit"
            >
              {submitting ? "Submitting..." : "SUBMIT"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
