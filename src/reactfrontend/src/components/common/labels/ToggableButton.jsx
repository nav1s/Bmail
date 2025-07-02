import React from "react";
import useToggableLabel from "../hooks/useToggableButton";
import "../../../styles/MailItem.css";

/**
 * ToggableButton
 * Renders a toggle UI for a mail label, using useToggableLabel logic.
 */
export default function ToggableButton({
  mailId,
  labelId,
  labelName,
  initialState,
  onLabelChange,
  className = ""
}) {
  const { active, toggleLabel } = useToggableLabel({
    mailId,
    labelId,
    initialState,
    onLabelChange
  });

  return (
    <button
      className={`label-plus-button ${className}`}
      class="mail-actions"
      onClick={toggleLabel}
    >
      {labelName} {active ? "✅" : "➕"}
    </button>
  );
}
