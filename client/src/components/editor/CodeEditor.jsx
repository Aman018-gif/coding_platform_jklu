import React from "react";
import "./CodeEditor.css";

// Judge0 language_id: 71 = Python 3, 63 = JavaScript, 54 = C++, 62 = Java
export const LANGUAGE_IDS = { "Python 3.10": 71, "JavaScript": 63, "C++": 54, "Java": 62 };

export default function CodeEditor({ value, onChange }) {
  return (
    <div className="code-editor-wrap">
      <textarea
        className="code-editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        placeholder="# Write your code here"
      />
    </div>
  );
}
