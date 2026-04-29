import React, { useEffect, useState, useRef, useContext } from "react";
import { useParams, useSearchParams, Navigate } from "react-router-dom";
import { Context } from "../main";
import api from "../api/client";
import Navbar from "../layout/Navbar";
import CodeEditor, { LANGUAGE_IDS } from "../components/editor/CodeEditor";
import TestCasesConsole from "../components/editor/TestCasesConsole";
import Submissions from "../components/contest/Submissions";
import { NotepadText,NotebookPen } from "lucide-react";

const DEFAULT_CODE = {
  71: `# Write your solution here`,
  63: `// Write your solution here`,
  50: `#include <stdio.h>\n\nint main() {\n    // Write your solution here\n    return 0;\n}`,
  62: `import java.util.*;\nimport java.lang.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws java.lang.Exception {\n        // Write your solution here\n    }\n}`,
};

const AUTOSAVE_DELAY = 1000;

function getSavedCode(problemId, languageId) {
  try { return localStorage.getItem(`code_${problemId}_${languageId}`) || null; } catch { return null; }
}
function saveCode(problemId, languageId, code) {
  try { localStorage.setItem(`code_${problemId}_${languageId}`, code); } catch { }
}

const difficultyClasses = {
  easy: "bg-emerald-400/15 text-emerald-400",
  medium: "bg-yellow-400/15 text-yellow-400",
  hard: "bg-red-400/15 text-red-400",
};

export default function ChallengePage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const contestId = searchParams.get("contest");
  const labId = searchParams.get("lab");
  const classId = searchParams.get("class");
  const { isAuthenticated } = useContext(Context);

  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState(DEFAULT_CODE[71]);
  const [languageId, setLanguageId] = useState(71);
  const [loading, setLoading] = useState(true);
  const [testCasesResult, setTestCasesResult] = useState(null);
  const [customRunResult, setCustomRunResult] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCaseIndex, setSelectedCaseIndex] = useState(0);
  const [personalNotes, setPersonalNotes] = useState("");
  const [autoSaveStatus, setAutoSaveStatus] = useState("saved");
  const autosaveTimer = useRef(null);

  useEffect(() => {
    if (!id) return;
    const saved = getSavedCode(id, languageId);
    setCode(saved || DEFAULT_CODE[languageId] || "");
    setAutoSaveStatus("saved");
  }, [id, languageId]);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const { data } = await api.get(`/problems/${id}`);
        setProblem(data.problem);
      } catch { setProblem(null); }
      finally { setLoading(false); }
    };
    if (id) fetchProblem();
  }, [id]);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    setAutoSaveStatus("saving");
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      saveCode(id, languageId, newCode);
      setAutoSaveStatus("saved");
    }, AUTOSAVE_DELAY);
  };

  const handleLanguageChange = (e) => {
    const newId = Number(e.target.value);
    setLanguageId(newId);
    setRunResult(null);
    setSubmissionResult(null);
  };

  const [customInput, setCustomInput] = useState("");
  const [customExpected, setCustomExpected] = useState("");
  const [activeTab, setActiveTab] = useState("TEST CASES");

  const handleRun = async () => {
    setRunning(true);
    if (activeTab === "CUSTOM TEST CASE") {
      setCustomRunResult(null);
    } else {
      setTestCasesResult(null);
    }
    try {
      const payload = { source_code: code, language_id: languageId, problem_id: id };
      if (activeTab === "CUSTOM TEST CASE" && customInput.trim()) payload.custom_input = customInput;
      const { data } = await api.post("/submissions/run", payload);
      if (activeTab === "CUSTOM TEST CASE") {
        setCustomRunResult(data.run_result || null);
      } else {
        setTestCasesResult(data.run_result || null);
      }
    } catch (err) {
      const res = err.response?.data;
      setRunResult(res?.run_result || { status: "Error", stdout: "", stderr: res?.message || err.message });
    } finally { setRunning(false); }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmissionResult(null);
    try {
      const { data } = await api.post("/submissions/submit", {
        source_code: code,
        language_id: languageId,
        language: selectedLanguageLabel,
        problem_id: id,
        contest_id: contestId || undefined,
        lab_id: labId || undefined,
        class_id: classId || undefined,
      });
      setSubmissionResult(data.submission || null);
    } catch (err) {
      const res = err.response?.data;
      setSubmissionResult({ status: res?.message || "Error", passed_tests: 0, total_tests: 0, run_output: [] });
    } finally { setSubmitting(false); }
  };

  if (!isAuthenticated) return <Navigate to="/auth" />;
  if (loading && !problem) return (
    <div className="min-h-screen flex items-center justify-center bg-bg-dark text-muted">
      <div className="animate-pulse font-display">Loading...</div>
    </div>
  );
  if (!problem) return (
    <div className="min-h-screen flex items-center justify-center bg-bg-dark text-muted">
      Problem not found.
    </div>
  );

  const testCases = problem.test_cases || [];
  const sampleCases = testCases.filter((t) => t.is_sample);
  const displayCases = sampleCases.length ? sampleCases : testCases.slice(0, 3);
  const difficulty = (problem.difficulty || "MEDIUM").toLowerCase();
  const diffStyle = difficultyClasses[difficulty] || difficultyClasses.medium;

  const selectedLanguageLabel =
    Object.keys(LANGUAGE_IDS).find((k) => LANGUAGE_IDS[k] === languageId) || "Python 3.8.1";

  return (
    <div className="h-screen bg-bg-dark text-white font-sans flex flex-col overflow-hidden">
      <Navbar />

      {/* ── Main split: left description | right editor ── */}
      <div className="flex flex-1 min-h-0">

        {/* LEFT PANEL — problem description */}
        <div className="w-[40%] flex flex-col border-r border-card-border min-h-0">

          {/* breadcrumb + title */}
          <div className="px-4 pt-2.5 text-[0.72rem] text-muted tracking-wider shrink-0">
            {contestId ? `JKLU_DAA_CONTEST / PROBLEM` : labId ? `LAB WORK / PROBLEM` : "PROBLEM"}
          </div>
          <div className="px-4 pt-1 pb-3 border-b border-card-border shrink-0">
            <h2 className="font-bold text-xl mb-2">{problem.title}</h2>
            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 rounded text-[0.72rem] font-semibold ${diffStyle}`}>
                {problem.difficulty}
              </span>
            </div>
          </div>

          {/* scrollable content */}
          <div className="flex-1 overflow-y-auto p-4 min-h-0">
            <p className="text-muted text-sm mb-4 leading-relaxed">
              {problem.description}
            </p>

            {/* Input format */}
            {problem.input_format && (
              <div className="bg-white/[0.03] rounded-md p-3 mb-4 border border-card-border">
                <div className="text-muted font-semibold text-xs mb-1.5 flex items-center gap-2">
                  <NotepadText size={14} />
                  INPUT FORMAT
                </div>
                <pre className="text-muted text-xs whitespace-pre-wrap m-0">
                  {problem.input_format}
                </pre>
              </div>
            )}

            {/* Example */}
            {displayCases.length > 0 && (
              <div className="mb-4">
                <div className="text-muted font-semibold text-sm mb-2">
                  EXAMPLE 1
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-muted text-[0.7rem] mb-1">INPUT</div>
                    <pre className="bg-white/[0.04] p-2 rounded-md text-muted text-xs whitespace-pre-wrap m-0 border border-card-border">
                      {displayCases[0].input}
                    </pre>
                  </div>
                  <div>
                    <div className="text-muted text-[0.7rem] mb-1">OUTPUT</div>
                    <pre className="bg-white/[0.04] p-2 rounded-md text-muted text-xs whitespace-pre-wrap m-0 border border-card-border">
                      {displayCases[0].expected_output}
                    </pre>
                  </div>
                </div>
                {displayCases[0].explanation && (
                  <p className="text-xs text-muted mt-2">
                    {displayCases[0].explanation}
                  </p>
                )}
              </div>
            )}

            {/* Constraints */}
            {problem.constraints && (
              <div className="bg-white/[0.03] rounded-md p-3 mb-4 border border-card-border">
                <div className="text-muted font-semibold text-xs mb-1.5">
                  CONSTRAINTS
                </div>
                <pre className="text-muted text-xs whitespace-pre-wrap m-0">
                  {problem.constraints}
                </pre>
              </div>
            )}

            {/* Personal notes */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-muted text-[0.72rem] flex items-center gap-2">
                  <NotebookPen size={14} />
                  PERSONAL NOTES
                </span>
                <button
                  type="button"
                  onClick={() => setPersonalNotes("")}
                  className="text-muted text-[0.72rem] bg-transparent border-none cursor-pointer p-0 hover:text-white transition-colors"
                >
                  CLEAR
                </button>
              </div>
              <textarea
                className="w-full bg-transparent text-muted text-sm resize-none min-h-[70px] border-none outline-none placeholder:text-muted/50"
                placeholder="Draft your logic or keep track of edge cases here..."
                value={personalNotes}
                onChange={(e) => setPersonalNotes(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* RIGHT PANEL — editor + console + buttons */}
        <div className="w-[60%] flex flex-col min-h-0 overflow-hidden">

          {/* Editor toolbar */}
          <div className="flex items-center justify-between px-4 py-1.5 border-b border-card-border bg-bg-dark shrink-0">
            <select
              value={languageId}
              onChange={handleLanguageChange}
              className="bg-card-dark text-muted rounded px-2.5 py-1.5 text-sm border border-card-border outline-none cursor-pointer hover:border-brand-yellow/30 transition-colors"
            >
              {Object.entries(LANGUAGE_IDS).map(([label, lid]) => (
                <option key={lid} value={lid}>{label}</option>
              ))}
            </select>
            <span className="text-[0.72rem] text-muted flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full inline-block ${autoSaveStatus === "saved" ? "bg-emerald-500" : "bg-amber-500"}`} />
              {autoSaveStatus === "saved" ? "AUTOSAVED" : "SAVING..."}
            </span>
          </div>

          {/* Monaco editor — position:relative wrapper so Monaco can fill it */}
          <div className="flex-1 min-h-0 relative">
            <div className="absolute inset-0">
              <CodeEditor value={code} onChange={handleCodeChange} language={selectedLanguageLabel} />
            </div>
          </div>

          {/* TestCasesConsole — fixed 260px, scrolls internally */}
          <div className="h-[260px] shrink-0 flex flex-col border-t border-card-border">

            {/* Console body — scrollable */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <TestCasesConsole
                testCases={displayCases.length ? displayCases : [{ input: "", expected_output: "" }]}
                runResult={
                  activeTab === "CUSTOM TEST CASE"
                    ? customRunResult
                    : testCasesResult
                }
                submissionResult={submissionResult}
                selectedCaseIndex={selectedCaseIndex}
                onSelectCase={setSelectedCaseIndex}
                customInput={customInput}
                customExpected={customExpected}
                onCustomInputChange={setCustomInput}
                onCustomExpectedChange={setCustomExpected}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                running={running}
              />
              
              {activeTab === "SUBMISSIONS" && (
                  <div className="absolute inset-x-0 bottom-0 h-[calc(100%-40px)] p-0 z-10 overflow-hidden bg-bg-dark">
                    <div className="h-full overflow-auto">
                      <Submissions isWidget={true} contestId={contestId} labId={labId} />
                    </div>
                  </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="shrink-0 flex justify-end items-center gap-3 px-4 py-2.5 border-t border-card-border bg-bg-dark">
              <button
                type="button"
                onClick={() => handleRun()}
                disabled={running}
                className="px-5 py-2 rounded font-medium border border-card-border cursor-pointer bg-card-dark text-muted text-sm hover:bg-white/10 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {running ? "Running..." : "RUN CODE"}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-5 py-2 rounded font-semibold border-none cursor-pointer bg-brand-yellow text-black text-sm hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : "SUBMIT"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}