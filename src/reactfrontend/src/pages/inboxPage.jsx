import React, { useState } from "react";

// Layout
import AppLayout from "../components/layout/AppLayout";

// High-level components
import MailList from "../components/common/inbox/MailList";
import SearchBar from "../components/common/inbox/SearchBar";
import ComposePopup from "../components/common/popup/ComposePopup";
import MailSentPopup from "../components/common/popup/MailSentPopup";
import MailViewerPopup from "../components/common/popup/MailViewerPopup";
import LabelManager from "../components/common/labels/LabelManager";

// Custom hook
import useInboxMails from "../hooks/useInboxMails";

// Routing
import { useParams, useNavigate } from "react-router-dom";

/**
 * InboxPage
 *
 * The primary interface for logged-in users to manage emails.
 * This page:
 * - Loads and filters emails by selected label and search query
 * - Manages state and logic for mail operations using `useInboxMails`
 * - Displays popups for composing, reading, and confirming actions
 * - Renders the application layout via `AppLayout`, which includes Header and account popup
 */
export default function InboxPage() {
  // Search input state
  const [query, setQuery] = useState("");

  // Label from route param (e.g. inbox/starred/custom)
  const { label } = useParams();

  // Navigation handler
  const navigate = useNavigate();

  // Mailbox state and handlers from custom logic hook
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
    handleRestoreMail,
    isDraftMail,
    labelMap,
    loadMails
  } = useInboxMails(label, query);

  return (
    <AppLayout>
      <button onClick={() => setShowCompose(true)}>Compose</button>

      <LabelManager
        selectedLabel={label}
        onSelect={(name) => navigate(`/mails/${name}`)}
      />

      <SearchBar query={query} setQuery={setQuery} />

      <MailList
        mails={mails}
        onDelete={handleDeleteMail}
        onMailClick={setOpenedMail}
        onTrash={handleTrashMail}
        onDeletePermanent={handleDeleteMail}
        onRestore={handleRestoreMail}
        selectedLabel={label}
        labelMap={labelMap}
        loadMails={loadMails}
      />

      {showCompose && (
        <ComposePopup
          onSend={handleSendMail}
          onClose={() => setShowCompose(false)}
        />
      )}

      {mailSentVisible && (
        <MailSentPopup onClose={() => setMailSentVisible(false)} />
      )}

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
            loadMails={loadMails}
          />
        ))}
    </AppLayout>
  );
}
