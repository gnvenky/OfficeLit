import React, { useEffect, useRef } from "react";
import { EditorView } from "prosemirror-view";
import { EditorState } from "prosemirror-state";
import { invoke } from "@tauri-apps/api/tauri";

export default function Editor() {
  const editorRef = useRef(null);
  let view = useRef(null);

  useEffect(() => {
    view.current = new EditorView(editorRef.current, {
      state: EditorState.create({})
    });
  }, []);

  async function openFile() {
    const path = prompt("Enter DOCX path:");
    const content = await invoke("open_docx", { path });

    view.current.dispatch(
      view.current.state.tr.insertText(content)
    );
  }

  async function saveFile() {
    const path = prompt("Save DOCX path:");
    const text = view.current.state.doc.textContent;

    await invoke("save_docx", {
      path,
      content: text
    });

    alert("Saved!");
  }

  return (
    <div>
      <button onClick={openFile}>Open DOCX</button>
      <button onClick={saveFile}>Save DOCX</button>
      <div
        ref={editorRef}
        style={{
          border: "1px solid gray",
          minHeight: "400px",
          padding: "10px"
        }}
      />
    </div>
  );
}
