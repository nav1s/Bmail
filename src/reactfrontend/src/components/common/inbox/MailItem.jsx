import React from "react";
import ToggableButton from "../labels/ToggableButton";
import useMailItem from "../hooks/useMailItem";
import "../../../styles/MailItem.css";
import {
  attachLabelToMail,
  detachLabelFromMail
} from "../../../services/mailService";

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
  const currentView = "inbox";

  return (
    <div className="mail-list-item" onClick={handleClick}>
      <div className="mail-content-line">
        <div className="mail-actions">
            {labelMap?.starred !== undefined && (
              <button onClick={(e) => {
                e.stopPropagation();
                isStarred
                  ? detachLabelFromMail(mail.id, labelMap.starred).then(loadMails)
                  : attachLabelToMail(mail.id, labelMap.starred).then(loadMails);
              }}>
                {isStarred ? "★" : "☆"}
              </button>
            )}

            {labelMap?.spam !== undefined && (
              <button
                  className="button-with-tooltip"
                  onClick={(e) => {
                    e.stopPropagation();
                    isSpam
                      ? detachLabelFromMail(mail.id, labelMap.spam).then(loadMails)
                      : attachLabelToMail(mail.id, labelMap.spam).then(loadMails);
                  }}
                >
                  {isSpam ? "📤 Unspam" : "⚠️"}
                  <span className="tooltip-text">
                    {isSpam ? "Report Not spam" : "Report spam"}
                  </span>
                </button>
            )}

          </div>

        <div className="mail-details">
          <span className="mail-from">{mail.from}</span>
          <span className="mail-title">{mail.title}</span>
          <span className="mail-body">{mail.body?.slice(0, 50)}...</span>
        </div>

        <div className="mail-actions">
          {!isTrashView && (
            <button class="button-with-tooltip" onClick={(e) => handleTrash(e)}>🗑️
             <span class="tooltip-text">Delete</span> </button>
          )}

          {isTrashView && (
            <>
              <button onClick={(e) => { e.stopPropagation(); handleRestore(e); }}>
                Restore
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleDeletePermanent(e); }}>
                Delete Permanently
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
