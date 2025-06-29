import { useEffect, useState } from "react";

/**
 * EditLabelContent
 * Form for editing a label's name.
 */
export default function EditLabelContent({ label, onSave, onClose }) {
  const [newName, setNewName] = useState("");

  // Update the input value whenever a new label is received
  useEffect(() => {
    if (label?.name) {
      setNewName(label.name);
    }
  }, [label]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (trimmed) {
      onSave({ ...label, name: trimmed });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Edit Label</h3>

      <label>
        Label name:
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          autoFocus
        />
      </label>

      <div style={{ marginTop: "10px" }}>
        <button type="button" onClick={onClose}>Cancel</button>
        <button type="submit" style={{ marginLeft: "10px" }}>Save</button>
      </div>
    </form>
  );
}
