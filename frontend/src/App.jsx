import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";

const applyFormatting = (text, selectionStart, selectionEnd, marker) => {
  const before = text.slice(0, selectionStart);
  const selected = text.slice(selectionStart, selectionEnd);
  const after = text.slice(selectionEnd);
  return `${before}${marker}${selected}${marker}${after}`;
};

export default function App() {
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [replace, setReplace] = useState("");

  const handleOpen = async () => {
    try {
      const file = await open({ multiple: false, filters: [{ name: "Word", extensions: ["docx"] }] });
      if (!file) return;
      const content = await invoke("open_docx", { path: file });
      setText(content || "");
    } catch (err) {
      console.error("Failed to open DOCX:", err);
      setText("");
    }
  };

  const handleSave = async () => {
    try {
      const file = await save({ filters: [{ name: "Word", extensions: ["docx"] }] });
      if (!file) return;
      await invoke("save_docx", { path: file, content: text });
    } catch (err) {
      console.error("Failed to save DOCX:", err);
    }
  };

  const handleReplaceAll = () => {
    if (!search) return;
    const regex = new RegExp(search, "g");
    setText(text.replace(regex, replace));
  };

  const formatText = (marker) => {
    const textarea = document.getElementById("editor");
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    setText(applyFormatting(text, start, end, marker));
    textarea.focus();
  };

  // Convert markers to HTML for preview
  const renderFormatted = () => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
      .replace(/_(.*?)_/g, "<i>$1</i>")
      .replace(/__(.*?)__/g, "<u>$1</u>")
      .replace(/\n/g, "<br/>");
  };

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "auto", fontFamily: "sans-serif" }}>
      <h1>OfficeLite Editor</h1>

      <div style={{ marginBottom: 10 }}>
        <button onClick={handleOpen}>Open DOCX</button>{" "}
        <button onClick={handleSave}>Save DOCX</button>{" "}
        <button onClick={() => formatText("**")}>Bold</button>{" "}
        <button onClick={() => formatText("_")}>Italic</button>{" "}
        <button onClick={() => formatText("__")}>Underline</button>
      </div>

      <div style={{ marginBottom: 10 }}>
        <input placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} style={{ marginRight: 5 }} />
        <input placeholder="Replace" value={replace} onChange={(e) => setReplace(e.target.value)} style={{ marginRight: 5 }} />
        <button onClick={handleReplaceAll}>Replace All</button>
      </div>

      <div style={{ display: "flex" }}>
        <textarea
          id="editor"
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ flex: 1, minHeight: 400, fontFamily: "monospace", padding: 10 }}
        />

        <div
          style={{
            flex: 1,
            minHeight: 400,
            border: "1px solid #ccc",
            marginLeft: 10,
            padding: 10,
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
          }}
          dangerouslySetInnerHTML={{ __html: renderFormatted() }}
        />
      </div>
    </div>
  );
}
