import React, { useState, useEffect } from "react";
import { attachLabel, detachLabel } from "../../../services/labelService";

export default function ToggableButton({ mailId, labelId, labelName, initialState, onLabelChange }) {
  const [active, setActive] = useState(initialState);

  useEffect(() => {
    setActive(initialState);
  }, [initialState]);

  const toggleLabel = async (e) => {
    e.stopPropagation();
    console.log("🔘 Button clicked. Current active state:", active);
    try {
      if (active) {
        await detachLabel(mailId, labelId);
      } else {
        await attachLabel(mailId, labelId);
      }
      onLabelChange();
      setActive(!active);
    } catch (err) {
      console.error(`Failed to toggle label '${labelName}':`, err);
    }
  };
  console.log("🟢 Render State:", { active });

  return (
    <button onClick={toggleLabel}>
      {labelName} {active ? "✅" : "➕"}
    </button>
  );
}
