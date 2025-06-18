import React from "react";

export default function LabelMenuPopup({ label, onEdit, onDelete, onClose }) {
  return (
    <div
      style={{
        position: "absolute",
        backgroundColor: "#fff",
        border: "1px solid #ccc",
        padding: "0.5rem",
        zIndex: 10,
      }}
    >
      <p style={{ margin: 0, cursor: "pointer" }} onClick={onEdit}>
        Edit
      </p>
      <p style={{ margin: 0, cursor: "pointer" }} onClick={onDelete}>
        Delete
      </p>
      <p style={{ margin: 0, cursor: "pointer", color: "gray" }} onClick={onClose}>
        Cancel
      </p>
    </div>
  );
}
