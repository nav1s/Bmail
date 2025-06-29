import { useEffect, useState } from "react";
import api from "../../../services/api";

export default function useLabelsPopup(mail, onLabelChange) {
  const [customLabels, setCustomLabels] = useState([]);
  const [selectedLabels, setSelectedLabels] = useState([]);

  useEffect(() => {
    loadLabels();
    if (mail?.labels) {
      setSelectedLabels(mail.labels); // assumes mail.labels contains label names
    }
  }, [mail]);

  const loadLabels = async () => {
    try {
      const labels = await api.get("/labels", { auth: true });
      const custom = labels.filter((l) => !l.isDefault && l.isAttachable);
      setCustomLabels(custom);
    } catch (err) {
      console.error("Failed to fetch labels:", err);
    }
  };
  
  const toggleLabel = (labelName) => {
    setSelectedLabels((prev) =>
      prev.includes(labelName)
        ? prev.filter((l) => l !== labelName)
        : [...prev, labelName]
    );
  };

  const saveLabels = async () => {
    try {
      await api.patch(`/mails/${mail.id}/labels`, { labels: selectedLabels }, { auth: true });
      if (onLabelChange) onLabelChange(selectedLabels);
    } catch (err) {
      console.error("Failed to save labels:", err);
    }
  };
  
  return {
    customLabels,
    selectedLabels,
    toggleLabel,
    saveLabels,
  };
}
