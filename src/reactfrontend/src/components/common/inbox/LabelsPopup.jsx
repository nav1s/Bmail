import React, { useEffect, useState } from "react";
import api from "../../../services/api";

export default function LabelsPopup({ mail, onClose, onUpdate }) {
  const [customLabels, setCustomLabels] = useState([]);
  const [selectedLabels, setSelectedLabels] = useState(mail.labels || []);

  useEffect(() => {
    const load = async () => {
      try {
        const all = await api.get("/labels", { auth: true });
        setCustomLabels(all.filter((l) => !l.isDefault));
      } catch (err) {
        console.error("Failed to load labels", err);
      }
    };
    load();
  }, []);

  const toggleLabel = (name) => {
    setSelectedLabels((prev) =>
      prev.includes(name)
        ? prev.filter((l) => l !== name)
        : [...prev, name]
    );
  };

  const handleSave = async () => {
    try {
      await api.patch(`/mails/${mail.id}`, { labels: selectedLabels }, { auth: true });
      onUpdate(selectedLabels);
    } catch (err) {
      console.error("Failed to update mail labels", err);
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: "20%",
      left: "30%",
      background: "#fff",
      border: "1px solid #000",
      padding: "16px",
      zIndex: 1000
    }}>
      <h4>Assign Labels</h4>
      <ul>
        {customLabels.map(label => (
          <li key={label.id}>
            <label>
              <input
                type="checkbox"
                checked={selectedLabels.includes(label.name)}
                onChange={() => toggleLabel(label.name)}
              />
              {label.name}
            </label>
          </li>
        ))}
      </ul>
      <button onClick={handleSave}>Save</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
}
