import React, { useState } from "react";
import Header from "../components/layout/Header";
import MailList from "../components/common/inbox/MailList";
import SearchBar from "../components/common/inbox/SearchBar";
import ComposePopup from "../components/common/popup/ComposePopup";
import MailSentPopup from "../components/common/popup/MailSentPopup";
import MailViewerPopup from "../components/common/popup/MailViewerPopup";
import LabelManager from "../components/common/labels/LabelManager";
import AccountPopup from "../components/common/popup/AccountPopup";
import useInboxMails from "../hooks/useInboxMails";
import { useParams, useNavigate } from "react-router-dom";

export default function InboxPage() {
  const [query, setQuery] = useState("");
  const [showAccount, setShowAccount] = useState(false);
  const { label } = useParams();
  const navigate = useNavigate();

  const {
    mails,
    showCompose,
    setShowCompose,
    mailSentVisible,
    setMailSentVisible,
    openedMail,
    setOpenedMail,
    handleSendMail,
    handleTrashMail,
    handleDeleteMail,
    isDraftMail
  } = useInboxMails(label, query);

  return (
    <div>
      {/* Top-level layout: Header with Dark Mode, Profile & Logout */}
      <Header />

      {/* Account Popup: shows greeting + logout */}
      {showAccount && (
        <AccountPopup onClose={() => setShowAccount(false)} />
      )}

      {/* Compose Button - opens new mail draft popup */}
      <button onClick={() => setShowCompose(true)}>Compose</button>

      {/* Label Sidebar - shows and manages user-created labels */}
      <LabelManager selectedLabel={label}
      onSelect={(name) => navigate(`/mails/${name}`)} />

      {/* Mail Search - filters mails by query */}
      <SearchBar query={query} setQuery={setQuery} />

      {/* Mail List - displays mails matching current label or query */}
      <MailList
        mails={mails}
        onDelete={handleDeleteMail}
        onMailClick={setOpenedMail}
        onTrash={handleTrashMail}
        onDeletePermanent={handleDeleteMail}
        selectedLabel={label}
      />

      {/* Compose Popup - for writing a new mail or editing a draft */}
      {showCompose && (
        <ComposePopup
          onSend={handleSendMail}
          onClose={() => setShowCompose(false)}
        />
      )}

      {/* Popup Confirmation - shows "Mail Sent" message for 2 sec */}
      {mailSentVisible && (
        <MailSentPopup onClose={() => setMailSentVisible(false)} />
      )}

      {/* Mail Viewer or Draft Editor - opens based on selected mail */}
      {openedMail &&
        (isDraftMail(openedMail) ? (
          <ComposePopup
            onSend={handleSendMail}
            onClose={() => setOpenedMail(null)}
            prefill={openedMail}
          />
        ) : (
          <MailViewerPopup
            mail={openedMail}
            onClose={() => setOpenedMail(null)}
          />
        ))}
    </div>
  );
}
