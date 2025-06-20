import { useEffect, useState } from "react";
import api from "../../../services/api";

/**
 * Hook to manage labels and selection for a given mail
 */
export default function useLabelsPopup(mail, onUpdate) {
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

  const saveLabels = async () => {
    try {
      await api.patch(`/mails/${mail.id}`, { labels: selectedLabels }, { auth: true });
      onUpdate(selectedLabels);
    } catch (err) {
      console.error("Failed to update mail labels", err);
    }
  };

  return {
    customLabels,
    selectedLabels,
    toggleLabel,
    saveLabels,
  };
}
