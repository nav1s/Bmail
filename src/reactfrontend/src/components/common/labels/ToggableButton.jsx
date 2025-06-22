import React from "react";
import useToggableLabel from "../hooks/useToggableButton";

/**
 * ToggableButton
 * Renders a toggle UI for a mail label, using useToggableLabel logic.
 */
export default function ToggableButton({
  mailId,
  labelId,
  labelName,
  initialState,
  onLabelChange
}) {
  const { active, toggleLabel } = useToggableLabel({
    mailId,
    labelId,
    initialState,
    onLabelChange
  });

  return (
    <button onClick={toggleLabel}>
      {labelName} {active ? "✅" : "➕"}
    </button>
  );
}
