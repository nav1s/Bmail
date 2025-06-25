import { useEffect, useState } from "react";

/**
 * EditLabelContent
 * Form for editing a label's name.
 */
export default function EditLabelContent({ label, onSave, onClose }) {
  const [newName, setNewName] = useState("");

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
    <form className="edit-label-form" onSubmit={handleSubmit}>
      <h2 className="popup-title">Edit Label</h2>

      <label htmlFor="labelName">Label Name</label>
      <input
        id="labelName"
        type="text"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        placeholder="Enter label name"
        required
      />

      <div className="form-actions">
        <button type="button" className="cancel-btn" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="save-btn">
          Save
        </button>
      </div>
    </form>
  );
}
