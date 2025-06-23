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
  loadMails
}) {
  const {
    handleClick,
    handleTrash,
    handleDeletePermanent,
    handleRestore,
    handleUnspam,
    isSpamView,
    hasLabel
  } = useMailItem(mail, { onClick, onTrash, onDeletePermanent, onRestore });

  const isStarred = hasLabel(labelMap?.starred);
  const isInboxed = hasLabel(labelMap?.inbox);
  const isSpam = hasLabel(labelMap.spam);

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
            {labelMap?.starred !== undefined && (
              <ToggableButton
                mailId={mail.id}
                labelId={labelMap.starred}
                labelName="starred"
                initialState={isStarred}
                onLabelChange={loadMails}
              />
            )}
            {labelMap?.inbox !== undefined && !mail.draft && !isSpam &&(
              <ToggableButton
                mailId={mail.id}
                labelId={labelMap.inbox}
                labelName="inbox"
                initialState={isInboxed}
                onLabelChange={loadMails}
              />
            )}
            {labelMap?.spam !== undefined && !mail.draft && (
              <ToggableButton
                mailId={mail.id}
                labelId={labelMap.spam}
                labelName="spam"
                initialState={isSpam}
                onLabelChange={loadMails}
              />
            )}
            <button onClick={handleTrash}>Trash</button>
          </>
        )}

        {isTrashView && (
          <>
            <button onClick={handleRestore}>Restore</button>
            <button onClick={handleDeletePermanent}>Delete Permanently</button>
          </>
        )}

        {isSpamView && (
          <>
            <button onClick={handleUnspam}>Unspam</button>
            <button onClick={handleDeletePermanent}>Delete Permanently</button>
          </>
        )}
      </div>
    </div>
  );
}
