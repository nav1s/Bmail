import React from "react";
import "../../../styles/LabelsPopup.css";

/**
 * LabelMenuPopup
 * A contextual menu for label actions (Edit / Delete).
 */
export default function LabelMenuPopup({ label, onEdit, onDelete, onClose }) {
  const handleClick = (action) => {
    action();
    onClose();
  };

  return (
    <div className="label-menu-backdrop" onClick={onClose}>
      <div
        className="label-menu-popup"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="label-menu-title">{label.name}</div>
        <button className="label-menu-btn" onClick={() => handleClick(onEdit)}>
          ✏️ Edit
        </button>
        <button className="label-menu-btn" onClick={() => handleClick(onDelete)}>
          🗑️ Delete
        </button>
        <button className="label-menu-btn cancel" onClick={onClose}>
          ❌ Cancel
        </button>
      </div>
    </div>
  );
}
