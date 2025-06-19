import React from "react";
import LabelsPopup from "./LabelsPopup";

export default function MailItem({ mail, onClick, onTrash, onDeletePermanent, isTrashView }) {
  const handleClick = (e) => {
    e.stopPropagation();
    onClick(mail);
  };

  const handleTrash = (e) => {
    e.stopPropagation();
    onTrash(mail.id);
  };

  const handleDeletePermanent = (e) => {
    e.stopPropagation();
    onDeletePermanent(mail.id);
  };

  return (
    <div
      onClick={handleClick}
      style={{ padding: "8px", borderBottom: "1px solid #ccc", cursor: "pointer" }}
    >
      <strong>{mail.from}</strong> — {mail.title}
      {!isTrashView && <button onClick={handleTrash}>Trash</button>}
      {isTrashView && <button onClick={handleDeletePermanent}>Delete Permanently</button>}
    </div>
  );
}
