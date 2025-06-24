import React from "react";
import useLabelsPopup from "../hooks/useLabelsPopup";
import ToggableButton from "../labels/ToggableButton";
import "../../../styles/LabelsPopup.css";

export default function LabelsPopup({ mail, onClose, onLabelChange }) {
  const { customLabels, selectedLabels } = useLabelsPopup(mail, onLabelChange);

  return (
    <div className="labels-popup">
      <h3 className="labels-title">Assign Labels</h3>
      <ul className="labels-list">
        {customLabels.map((label) => (
          <li key={label.id}>
            <ToggableButton
              mailId={mail.id}
              labelId={label.id}
              labelName={label.name}
              initialState={selectedLabels.includes(label.id)}
              onLabelChange={onLabelChange}
            />
          </li>
        ))}
      </ul>
      <button onClick={onClose} className="labels-close-btn">Close</button>
    </div>
  );
}
