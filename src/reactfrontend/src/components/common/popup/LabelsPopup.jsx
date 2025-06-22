import React from "react";
import useLabelsPopup from "../hooks/useLabelsPopup";
import ToggableButton from "../labels/ToggableButton";


export default function LabelsPopup({ mail, onClose, onLabelChange }) {
  const {
    customLabels,
    selectedLabels,
  } = useLabelsPopup(mail, onLabelChange);
  return (
    <div>
      <ul>
        {customLabels.map(label => (
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
    </div>
  );
}
