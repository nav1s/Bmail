import React, { useState } from "react";
import LabelsPopup from "./LabelsPopup";

export default function MailItem({ mail, onDelete, onUpdate }) {
  const [showLabels, setShowLabels] = useState(false);

  return (
    <div style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>
      <p><strong>From:</strong> {mail.from}</p>
      <p><strong>To:</strong> {mail.to}</p>
      <p><strong>Title:</strong> {mail.title}</p>
      <p><strong>Body:</strong> {mail.body}</p>
      {mail.labels?.length > 0 && (
        <p><strong>Labels:</strong> {mail.labels.join(", ")}</p>
      )}

      <button onClick={() => onDelete(mail.id)}>Delete</button>
      <button onClick={() => setShowLabels(true)}>Labels</button>

      {showLabels && (
        <LabelsPopup
          mail={mail}
          onClose={() => setShowLabels(false)}
          onUpdate={(updatedLabels) => {
            onUpdate({ ...mail, labels: updatedLabels });
            setShowLabels(false);
          }}
        />
      )}
    </div>
  );
}
