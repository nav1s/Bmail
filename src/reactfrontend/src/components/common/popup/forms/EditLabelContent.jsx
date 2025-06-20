import { useState } from "react";

/**
 * EditLabelContent
 * Pure UI for editing a label name.
 */
export default function EditLabelContent({ label, onSave, onClose }) {
  const [newName, setNewName] = useState(label.name);

  const handleSubmit = () => {
    if (newName.trim()) {
      onSave(newName);
    }
  };

  return (
    <div>
      <h3>Edit Label</h3>
      <label>
        Label name:
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
      </label>
      <div style={{ marginTop: "10px" }}>
        <button onClick={onClose}>Cancel</button>
        <button onClick={handleSubmit} style={{ marginLeft: "10px" }}>Save</button>
      </div>
    </div>
  );
}
