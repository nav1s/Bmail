import { useEffect, useRef, useState } from "react";
import { attachLabel, detachLabel } from "../../../services/labelService";
import useLabels from "../hooks/useLabels";

export default function useMailViewerPopup(mail) {
  const labelsRef = useRef();
  const [showLabels, setShowLabels] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState([]);
  const { labels } = useLabels();

  useEffect(() => {
    if (mail?.labels) {
      setSelectedLabels(mail.labels.map((l) => l.name));
    }
  }, [mail]);

  const toggleLabels = () => setShowLabels((prev) => !prev);

  const toggleLabel = async (labelName) => {
    const label = labels.find((l) => l.name === labelName);
    if (!label) return;

    const isChecked = selectedLabels.includes(labelName);

    try {
      if (isChecked) {
        await detachLabel(mail.id, label.id);
        setSelectedLabels((prev) => prev.filter((n) => n !== labelName));
      } else {
        await attachLabel(mail.id, label.id);
        setSelectedLabels((prev) => [...prev, labelName]);
      }
    } catch (err) {
      console.error("Label update error:", err);
    }
  };

  const saveLabels = () => {
    toggleLabels();
  };

  return {
    showLabels,
    toggleLabels,
    labels: labels.filter((l) => l.isAttachable),
    selectedLabels,
    toggleLabel,
    saveLabels,
    labelsRef
  };
}
