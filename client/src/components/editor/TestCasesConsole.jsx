import React, { useState } from "react";
import "./TestCasesConsole.css";

const tabs = ["TEST CASES", "CONSOLE", "RESULT"];

export default function TestCasesConsole({
  testCases = [],
  runResult = null,
  submissionResult = null,
  selectedCaseIndex = 0,
  onSelectCase,
}) {
  const [activeTab, setActiveTab] = useState("TEST CASES");
  const selectedCase = testCases[selectedCaseIndex];

  const getCaseStatus = (index) => {
    if (submissionResult?.run_output?.length) {
      const out = submissionResult.run_output[index];
      return out?.status === "Accepted" ? "pass" : out?.status ? "fail" : "locked";
    }
    if (runResult && index === 0) return runResult.status === "Accepted" ? "pass" : "fail";
    return index === 0 ? "pass" : "locked";
  };

  return (
    <div className="test-cases-console">
      <div className="test-cases-console__tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`test-cases-console__tab ${activeTab === tab ? "test-cases-console__tab--active" : ""}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="test-cases-console__body">
        {activeTab === "TEST CASES" && (
          <div className="test-cases-console__row">
            <div className="test-cases-console__case-list">
              {testCases.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onSelectCase?.(i)}
                  className={`test-cases-console__case-btn ${selectedCaseIndex === i ? "test-cases-console__case-btn--selected" : ""}`}
                >
                  {getCaseStatus(i) === "pass" && <span style={{ color: "var(--color-success)" }}>✓</span>}
                  {getCaseStatus(i) === "fail" && <span style={{ color: "var(--color-error)" }}>✗</span>}
                  {getCaseStatus(i) === "locked" && <span>🔒</span>}
                  Case {i + 1}
                </button>
              ))}
            </div>
            {selectedCase && (
              <div className="test-cases-console__case-details">
                <div>
                  <div className="test-cases-console__label">YOUR INPUT</div>
                  <pre className="test-cases-console__pre">{selectedCase.input || "(none)"}</pre>
                </div>
                <div>
                  <div className="test-cases-console__label">EXPECTED OUTPUT</div>
                  <pre className="test-cases-console__pre">{selectedCase.expected_output ?? ""}</pre>
                </div>
                {((runResult && selectedCaseIndex === 0) || submissionResult?.run_output?.[selectedCaseIndex]) && (
                  <div>
                    <div className="test-cases-console__label">YOUR OUTPUT</div>
                    <pre className="test-cases-console__pre">
                      {submissionResult?.run_output?.[selectedCaseIndex]?.stdout ?? runResult?.stdout ?? ""}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {activeTab === "CONSOLE" && (
          <pre className="test-cases-console__console-pre">
            {runResult?.stderr || runResult?.compile_output || "No console output."}
          </pre>
        )}
        {activeTab === "RESULT" && (
          <div className="test-cases-console__console-pre">
            {submissionResult ? (
              <p className={submissionResult.status === "Accepted" ? "test-cases-console__result--pass" : "test-cases-console__result--fail"}>
                {submissionResult.status} — {submissionResult.passed_tests}/{submissionResult.total_tests} test cases passed.
              </p>
            ) : runResult ? (
              <p className={runResult.status === "Accepted" ? "test-cases-console__result--pass" : "test-cases-console__result--fail"}>
                {runResult.status}
              </p>
            ) : (
              <p className="test-cases-console__result--muted">Run or submit to see result.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
