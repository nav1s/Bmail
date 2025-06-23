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
  const isInboxed = hasLabel(labelMap?.inbox);

  return (
    <div className="mail-item" onClick={handleClick}>
      <div className="mail-header">
        <span className="mail-from">{mail.from}</span>
        <span className="mail-title">{mail.title}</span>
      </div>
      <div className="mail-body">{mail.body?.slice(0, 100)}...</div>

      <div className="mail-actions">
        {!isTrashView ? (
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
            <button onClick={(e) => {
              e.stopPropagation();
              handleTrash();
            }}>🗑️</button>
          </>
        ) : (
          <>
            <button onClick={(e) => {
              e.stopPropagation();
              handleRestore();
            }}>↩️</button>
            <button onClick={(e) => {
              e.stopPropagation();
              handleDeletePermanent();
            }}>❌</button>
          </>
        )}
      </div>
    </div>
  );
}
