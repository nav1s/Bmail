import React from "react";
import ToggableButton from "../labels/ToggableButton";
import useMailItem from "../hooks/useMailItem";
import "../../../styles/MailItem.css";

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
  const isSpam = hasLabel(labelMap?.spam);

  return (
    <div className="mail-list-item" onClick={handleClick}>
      <div className="mail-content-line">
        <div className="mail-actions">
          {labelMap?.starred !== undefined && (
            <ToggableButton
              mailId={mail.id}
              labelId={labelMap.starred}
              labelName="starred"
              initialState={isStarred}
              onLabelChange={loadMails}
            />
          )}

          {labelMap?.spam !== undefined && (
            <ToggableButton
              mailId={mail.id}
              labelId={labelMap.spam}
              labelName="spam"
              initialState={isSpam}
              onLabelChange={loadMails}
            />
          )}
        </div>

        <div className="mail-details">
          <span className="mail-from">{mail.from}</span>
          <span className="mail-title">{mail.title}</span>
          <span className="mail-body">{mail.body?.slice(0, 50)}...</span>
        </div>

        <div className="mail-buttons">
          {!isTrashView && (
            <button onClick={(e) => handleTrash(e)}>🗑️</button>
          )}

          {isTrashView && (
            <>
              <button onClick={(e) => { e.stopPropagation(); handleRestore(e); }}>
                Restore
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleDeletePermanent(e); }}>
                ❌ Delete Permanently
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
