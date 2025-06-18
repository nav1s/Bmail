import React, { useState } from "react";
import api from "../../../services/api";

export default function EditLabelModal({ label, onClose, onSave }) {
  const [newName, setNewName] = useState(label.name);

  const handleSave = async () => {
    try {
      await api.patch(`/labels/${label.id}`, { name: newName }, { auth: true });
      onSave(); // always call, even if unchanged
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  return (
    <div style={{
        // implement in css files later
      border: "1px solid #000",
      padding: "16px",
      background: "#fff",
      position: "fixed",
      top: "20%",
      left: "30%",
      zIndex: 1000
    }}>
      <h3>Edit Label</h3>
      <div>
        <label>
          Label name:
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </label>
      </div>
      <div style={{ marginTop: "10px" }}>
        <button onClick={onClose}>Cancel</button>
        <button onClick={handleSave} style={{ marginLeft: "10px" }}>Save</button>
      </div>
    </div>
  );
}
