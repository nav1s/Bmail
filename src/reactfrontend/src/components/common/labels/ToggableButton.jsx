import React from "react";
import useToggableLabel from "../hooks/useToggableButton"; // ודא שהנתיב נכון
import "../../../styles/MailItem.css"; // אם שם יש את המחלקה label-plus-button

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
  className = "" // ⬅️ מאפשר להוסיף עיצוב חיצוני
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
      onClick={toggleLabel}
    >
      {labelName} {active ? "✅" : "➕"}
    </button>
  );
}
