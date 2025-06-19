import React from "react";
import MailItem from "./MailItem";

export default function MailList({
  mails,
  onMailClick,
  onTrash,
  onDeletePermanent,
  selectedLabel,
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
          isTrashView={selectedLabel?.toLowerCase() === "trash"}
        />
      ))}
    </div>
  );
}
