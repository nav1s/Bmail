import React from "react";
import ToggableButton from "../labels/ToggableButton";

export default function MailItem({
  mail,
  onClick,
  onTrash,
  onDeletePermanent,
  onRestore,
  isTrashView,
  labelMap,
  loadMails
}) {
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

  const handleRestore = (e) => {
    e.stopPropagation();
    onRestore(mail.id);
  };

  const hasLabel = (labelId) => mail.labels?.includes(labelId);
  const isStarred = hasLabel(labelMap?.starred);


  return (
    <div
      onClick={handleClick}
      style={{ padding: "8px", borderBottom: "1px solid #ccc", cursor: "pointer" }}
    >
      <div>
        <strong>{mail.from}</strong> — {mail.title}
      </div>

      <div>
        {!isTrashView && (
          <>
            <ToggableButton
              mailId={mail.id}
              labelId={labelMap?.starred}
              labelName="starred"
              initialState={isStarred}
              onLabelChange={loadMails}
            />
            <button onClick={handleTrash}>Trash</button>
          </>
        )}

        {isTrashView && (
          <>
            <button onClick={handleRestore}>Restore</button>
            <button onClick={handleDeletePermanent}>Delete Permanently</button>
          </>
        )}
      </div>
    </div>
  );
}
