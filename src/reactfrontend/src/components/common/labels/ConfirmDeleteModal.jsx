import React from "react";

export default function ConfirmDeleteModal({ label, onClose, onConfirm }) {
  return (
    <div className="modal">
      <div className="modal-content">
        <p>Are you sure you want to delete the label "<strong>{label.name}</strong>"?</p>
        <button onClick={onConfirm}>Yes</button>
        <button onClick={onClose} style={{ marginLeft: "10px" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
