import fetch from "node-fetch";

const JUDGE0_URL = process.env.JUDGE0_API_URL || "http://localhost:2358";

const JUDGE0_STATUS = {
  1: "Processing",
  2: "Processing",
  3: "Processing",
  4: "Accepted",
  5: "Wrong Answer",
  6: "Time Limit Exceeded",
  7: "Compilation Error",
  8: "Runtime Error",
  9: "Runtime Error",
  10: "Runtime Error",
  11: "Runtime Error",
  12: "Runtime Error",
  13: "Runtime Error",
  14: "Runtime Error",
  15: "Runtime Error",
};

export async function createSubmission(sourceCode, languageId, stdin, wait = true) {
  const url = `${JUDGE0_URL}/submissions?base64_encoded=false&wait=${wait}`;
  const body = {
    source_code: sourceCode,
    language_id: languageId,
    stdin: stdin || "",
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Judge0 error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function getSubmission(token) {
  const url = `${JUDGE0_URL}/submissions/${token}?base64_encoded=false`;
  const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
  if (!res.ok) throw new Error(`Judge0 get error ${res.status}`);
  return res.json();
}

export function normalizeStatus(statusId) {
  return JUDGE0_STATUS[statusId] || "Runtime Error";
}

export async function runWithPolling(sourceCode, languageId, stdin, maxWaitMs = 15000) {
  const created = await createSubmission(sourceCode, languageId, stdin, false);
  const token = created.token;
  if (!token) throw new Error("Judge0 did not return token");
  const step = 500;
  for (let elapsed = 0; elapsed < maxWaitMs; elapsed += step) {
    await new Promise((r) => setTimeout(r, step));
    const result = await getSubmission(token);
    const id = result.status?.id;
    if (id && id > 3) {
      return {
        stdout: result.stdout || "",
        stderr: result.stderr || "",
        compile_output: result.compile_output || "",
        status: normalizeStatus(id),
        time: result.time,
        memory: result.memory,
      };
    }
  }
  throw new Error("Judge0 submission timed out");
}

export const executeCode = async (source_code, language_id) => {
  const response = await fetch(`${JUDGE0_URL}/submissions?wait=true`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source_code, language_id }),
  });
  return await response.json();
};