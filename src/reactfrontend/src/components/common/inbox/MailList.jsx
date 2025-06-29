import React from "react";
import MailItem from "./MailItem";

export default function MailList({
  mails,
  onMailClick,
  onTrash,
  onDeletePermanent,
  onRestore,
  selectedLabel,
  labelMap,
  loadMails,
  onUnspam,
}) {
  return (
    <div>
      {mails.map((mail) => (
        <MailItem
          key={mail.id}
          mail={mail}
          onClick={onMailClick}
          onTrash={onTrash}
          onDeletePermanent={onDeletePermanent}
          onRestore={onRestore}
          isTrashView={selectedLabel?.toLowerCase() === "trash"}
          labelMap={labelMap}
          loadMails={loadMails}
          onUnspam={onUnspam}
          isSpamView={selectedLabel?.toLowerCase() === "spam"}
        />
      ))}
    </div>
  );
}
