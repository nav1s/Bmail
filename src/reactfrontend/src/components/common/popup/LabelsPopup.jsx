import { useEffect, useState } from "react";
import Popup from "./Popup";
import api from "../../../services/api";

/**
 * LabelsPopup - Attaches/detaches labels from a mail. Popup stays open and updates state reactively.
 */
export default function LabelsPopup({ mail, onClose, onUpdate }) {
  const [labels, setLabels] = useState([]);
  const [attached, setAttached] = useState(new Set());

  useEffect(() => {
    async function fetchLabels() {
      try {
        const res = await api.get("/labels", { auth: true });
        const attachable = res.filter((l) => l.isAttachable);
        setLabels(attachable);

        const labelIds = (mail.labels || []).map((l) => (typeof l === "object" ? l.id : l));
        setAttached(new Set(labelIds));
      } catch (err) {
        console.error("Error fetching labels:", err);
      }
    }

    fetchLabels();
  }, [mail]);

  async function toggleLabel(labelId) {
    const isAttached = attached.has(labelId);
    try {
      if (isAttached) {
        await api.delete(`/mails/${mail.id}/labels/${labelId}`, { auth: true });
        setAttached((prev) => {
          const next = new Set(prev);
          next.delete(labelId);
          return next;
        });
      } else {
        await api.post(`/mails/${mail.id}/labels`, { labelId }, { auth: true });
        setAttached((prev) => new Set([...prev, labelId]));
      }

      if (onUpdate) onUpdate();
    } catch (err) {
      console.error("Failed to toggle label:", err);
    }
  }

  return (
    <Popup onClose={onClose}>
      <h4>Manage Labels</h4>
      {labels.map((label) => (
        <div
          key={label.id}
          onClick={(e) => e.stopPropagation()} // 🛑 Prevents closing popup on click
        >
          <label>
            <input
              type="checkbox"
              checked={attached.has(label.id)}
              onChange={() => toggleLabel(label.id)}
              onClick={(e) => e.stopPropagation()} // 🛑 Prevents bubbling to Popup backdrop
            />
            {label.name}
          </label>
        </div>
      ))}
    </Popup>
  );
}
