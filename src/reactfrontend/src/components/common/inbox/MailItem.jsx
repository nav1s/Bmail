import React from "react";
import ToggableButton from "../labels/ToggableButton";
import useMailItem from "../hooks/useMailItem";

export default function MailItem({
  mail,
  onClick,
  onTrash,
  onDeletePermanent,
  onRestore,
  isTrashView,
  labelMap,
  loadMails,
}) {
  const {
    handleClick,
    handleTrash,
    handleDeletePermanent,
    handleRestore,
    hasLabel,
  } = useMailItem(mail, { onClick, onTrash, onDeletePermanent, onRestore });

  const isStarred = hasLabel(labelMap?.starred);
  const isInboxed = hasLabel(labelMap?.inbox);

  return (
    <div className={`mail-list-item ${mail.read ? "read" : ""}`} onClick={handleClick}>
      <div className="mail-header">
        <strong className="mail-from">{mail.from}</strong>
        <span className="mail-title">{mail.title}</span>
      </div>

      <div className="mail-actions">
        {!isTrashView && (
          <>
            {labelMap?.starred !== undefined && (
              <ToggableButton
                mailId={mail.id}
                labelId={labelMap.starred}
                labelName="starred"
                initialState={isStarred}
                onLabelChange={loadMails}
              />
            )}
            {labelMap?.inbox !== undefined && !mail.draft && (
              <ToggableButton
                mailId={mail.id}
                labelId={labelMap.inbox}
                labelName="inbox"
                initialState={isInboxed}
                onLabelChange={loadMails}
              />
            )}
            <button className="btn small danger" onClick={(e) => { e.stopPropagation(); handleTrash(); }}>Trash</button>
          </>
        )}

        {isTrashView && (
          <>
            <button className="btn small" onClick={(e) => { e.stopPropagation(); handleRestore(); }}>Restore</button>
            <button className="btn small danger" onClick={(e) => { e.stopPropagation(); handleDeletePermanent(); }}>Delete Permanently</button>
          </>
        )}
      </div>
    </div>
  );
}
