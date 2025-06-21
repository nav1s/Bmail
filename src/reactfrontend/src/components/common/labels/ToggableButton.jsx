import React, { useState } from "react";
import { attachLabel, detachLabel } from "../../../services/labelService";

export default function ToggableButton({ mailId, labelId, labelName, initialState, onLabelChange }) {
  const [active, setActive] = useState(initialState);

  const toggleLabel = async (e) => {
    e.stopPropagation();

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

  return (
    <button onClick={toggleLabel}>
      {labelName} {active ? "✅" : "➕"}
    </button>
  );
}
