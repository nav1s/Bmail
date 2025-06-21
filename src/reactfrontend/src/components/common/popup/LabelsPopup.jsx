import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import LabelList from "../labels/LabelList";

export default function LabelsPopup({ mailId, onClose, onLabelChange }) {
  const [labels, setLabels] = useState([]);

  useEffect(() => {
    const fetchLabels = async () => {
      try {
        const res = await api.get("/labels", { auth: true });

        const customAttachable = res.filter((l) => l.isAttachable && !l.isDefault);
        setLabels(customAttachable);
      } catch (err) {
        console.error("Failed to load labels", err);
      }
    };

    fetchLabels();
  }, []);

  const handleSelectLabel = async (labelId) => {
  try {
    await api.post(`/mails/${mailId}/labels`, { labelId }, { auth: true });
    if (onLabelChange) onLabelChange();
  } catch (err) {
    console.error("Failed to attach label", err);
  }
};


  return (
    <div style={{ padding: "1rem" }}>
      <h3>Attach Labels</h3>
      <LabelList
        mailId={mailId}
        labels={labels}
        onLabelChange={onLabelChange}
        onSelect={handleSelectLabel}
      />
      <button style={{ marginTop: "1rem" }} onClick={onClose}>
        Close
      </button>
    </div>
  );
}
