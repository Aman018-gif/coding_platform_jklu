import React from "react";

const tabs = ["TEST CASES", "CUSTOM TEST CASE", "CONSOLE"];

const normalize = (str) => String(str || "").replace(/\r\n/g, "\n").trimEnd();

export default function TestCasesConsole({
  testCases = [],
  runResult = null,
  submissionResult = null,
  selectedCaseIndex = 0,
  onSelectCase,
  customInput = "",
  customExpected = "",
  onCustomInputChange,
  onCustomExpectedChange,
  activeTab = "TEST CASES",
  onTabChange,
  running = false,
}) {
  const selectedCase = testCases[selectedCaseIndex];

  const getCaseStatus = (index) => {
    if (submissionResult?.run_output?.length) {
      const out = submissionResult.run_output[index];
      if (!out) return "locked";
      return out.status === "Accepted" ? "pass" : "fail";
    }
    if (runResult?.case_results?.length) {
      const c = runResult.case_results[index];
      if (!c) return "neutral";
      return c.status === "Accepted" ? "pass" : "fail";
    }
    return "neutral";
  };

  const getYourOutput = () => {
    if (submissionResult?.run_output?.[selectedCaseIndex]) {
      const out = submissionResult.run_output[selectedCaseIndex];
      return normalize(out.stdout) || normalize(out.stderr) || "";
    }
    if (runResult?.case_results?.[selectedCaseIndex]) {
      const c = runResult.case_results[selectedCaseIndex];
      return normalize(c.stdout) || normalize(c.stderr) || "";
    }
    if (runResult && selectedCaseIndex === 0) {
      return normalize(runResult.stdout) || normalize(runResult.stderr) || "";
    }
    return null;
  };

  const yourOutput = getYourOutput();
  const hasResult = runResult || submissionResult;

  const consoleOutput =
    runResult?.case_results?.[0]?.stderr ||
    runResult?.case_results?.[0]?.compile_output ||
    runResult?.stderr ||
    runResult?.compile_output ||
    null;

  return (
    <div className="bg-bg-dark border-t border-card-border flex flex-col h-full overflow-hidden">
      
      {/* Tabs */}
      <div className="flex border-b border-card-border shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange?.(tab)}
            className={`px-4 py-2.5 text-[0.8rem] font-medium bg-transparent border-none cursor-pointer transition-all tracking-wide mb-[-1px] border-b-2 ${
              activeTab === tab 
                ? "border-brand-yellow text-brand-yellow" 
                : "border-transparent text-muted hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="p-4 flex-1 overflow-y-auto min-h-0">

        {/* ── TEST CASES ── */}
        {activeTab === "TEST CASES" && (
          <div className="flex gap-4 h-full">
            {/* Sidebar List */}
            <div className="flex flex-col gap-1.5 min-w-[120px] shrink-0">
              {testCases.length === 0 ? (
                <p className="text-muted text-[0.8rem]">No test cases.</p>
              ) : (
                testCases.map((_, i) => {
                  const status = getCaseStatus(i);
                  const isSelected = selectedCaseIndex === i;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onSelectCase?.(i)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded text-[0.85rem] text-left cursor-pointer transition-colors border-none ${
                        isSelected ? "bg-white/10 text-white" : "bg-transparent text-muted hover:bg-white/5"
                      }`}
                    >
                      {status === "pass" && <span className="text-emerald-400 font-bold">✓</span>}
                      {status === "fail" && <span className="text-red-400 font-bold">✗</span>}
                      {status === "locked" && <span className="text-[0.7rem]">🔒</span>}
                      Case {i + 1}
                    </button>
                  );
                })
              )}
            </div>

            {/* Case Details */}
            {selectedCase ? (
              <div className="flex-1 overflow-y-auto flex flex-col gap-4">
                <div>
                  <div className="text-muted text-[0.75rem] mb-1 font-semibold uppercase tracking-tight">Input</div>
                  <pre className="bg-white/[0.04] p-3 rounded text-muted text-[0.875rem] whitespace-pre-wrap break-all border border-card-border">
                    {selectedCase.input || "(none)"}
                  </pre>
                </div>
                <div>
                  <div className="text-muted text-[0.75rem] mb-1 font-semibold uppercase tracking-tight">Expected Output</div>
                  <pre className="bg-white/[0.04] p-3 rounded text-muted text-[0.875rem] whitespace-pre-wrap break-all border border-card-border">
                    {normalize(selectedCase.expected_output) || "(none)"}
                  </pre>
                </div>
                {hasResult && yourOutput !== null && (
                  <div>
                    <div className="text-muted text-[0.75rem] mb-1 font-semibold uppercase tracking-tight">Your Output</div>
                    <pre className={`p-3 rounded text-[0.875rem] whitespace-pre-wrap break-all border ${
                      getCaseStatus(selectedCaseIndex) === "pass" 
                      ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" 
                      : "bg-red-500/5 border-red-500/20 text-red-400"
                    }`}>
                      {yourOutput || "(no output)"}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted text-[0.8rem]">Select a test case.</p>
            )}
          </div>
        )}

        {/* ── CUSTOM TEST CASE ── */}
        {activeTab === "CUSTOM TEST CASE" && (
          <div className="flex flex-col gap-4">
            <div>
              <div className="text-muted text-[0.75rem] mb-1 font-semibold uppercase tracking-tight">Your Input</div>
              <textarea
                className="w-full bg-white/[0.04] border border-card-border rounded p-3 text-muted text-[0.875rem] font-mono outline-none focus:border-brand-yellow/50 min-h-[80px] resize-y"
                placeholder="Enter custom input here..."
                value={customInput}
                onChange={(e) => onCustomInputChange?.(e.target.value)}
              />
            </div>

            {runResult && (
              <div className="flex flex-col gap-2">
                <div className="text-muted text-[0.75rem] mb-1 font-semibold uppercase tracking-tight">Your Output</div>
                <pre className="bg-white/[0.04] p-3 rounded text-muted text-[0.875rem] font-mono whitespace-pre-wrap break-all border border-card-border">
                  {normalize(runResult.case_results?.[0]?.stdout) ||
                    normalize(runResult.stdout) ||
                    normalize(runResult.case_results?.[0]?.stderr) ||
                    normalize(runResult.stderr) ||
                    "(no output)"}
                </pre>
              </div>
            )}

            {!runResult && (
              <p className="text-muted text-[0.8rem] m-0 italic">
                Press RUN CODE to execute with this input.
              </p>
            )}
          </div>
        )}

        {/* ── CONSOLE ── */}
        {activeTab === "CONSOLE" && (
          <div className="flex flex-col gap-4">
            {/* Status Indicator */}
            {(submissionResult || runResult) && (
              <div className={`px-4 py-2.5 rounded font-semibold text-[0.875rem] border ${
                (submissionResult?.status === "Accepted" || getCaseStatus(0) === "pass")
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-red-500/10 text-red-400 border-red-500/30"
              }`}>
                {submissionResult 
                  ? `${submissionResult.status} — ${submissionResult.passed_tests}/${submissionResult.total_tests} test cases passed`
                  : (getCaseStatus(0) === "pass" ? "Accepted" : runResult.status || "Wrong Answer")
                }
              </div>
            )}

            {consoleOutput && (
              <div>
                <div className="text-muted text-[0.75rem] mb-1 font-semibold uppercase tracking-tight">Console / Errors</div>
                <pre className="bg-red-500/5 p-3 rounded text-red-400 text-[0.875rem] whitespace-pre-wrap break-all border border-red-500/20 font-mono">
                  {consoleOutput}
                </pre>
              </div>
            )}

            {!submissionResult && !runResult && (
              <p className="text-muted text-[0.8rem] m-0">
                Run or submit your code to see output here.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}