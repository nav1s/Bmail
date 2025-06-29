import React from "react";
import useLabelsPopup from "../hooks/useLabelsPopup";
import ToggableButton from "../labels/ToggableButton";
import "../../../styles/LabelsPopup.css";

export default function LabelsPopup({ mail, onClose, onLabelChange }) {
  const { customLabels, selectedLabels } = useLabelsPopup(mail, onLabelChange);

  return (
    <div className="popup-backdrop">
      <div className="popup-content labels-popup">
        <h2 className="popup-title">Assign Labels</h2>
        <ul className="label-list">
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
        <button className="labels-close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
