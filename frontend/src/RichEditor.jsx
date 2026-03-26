import React, { useMemo } from "react";
import { Slate, Editable, withReact } from "slate-react";
import { createEditor } from "slate";

// Default empty Slate doc
const EMPTY_DOC = [
  { type: "paragraph", children: [{ text: "" }] }
];

export default function RichEditor({ value, setValue }) {
  const editor = useMemo(() => withReact(createEditor()), []);

  // Ensure Slate always gets a list
  const safeValue = Array.isArray(value) && value.length ? value : EMPTY_DOC;

  return (
    <Slate editor={editor} value={safeValue} onChange={setValue}>
      <Editable
        placeholder="Start typing..."
        style={{
          border: "1px solid #ccc",
          padding: "1rem",
          minHeight: "300px",
          borderRadius: "4px"
        }}
      />
    </Slate>
  );
}
