import React, { useState } from "react";
import "../styles/InboxPage.css";

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

import { MdInbox, MdStar, MdSend, MdDrafts, MdReport, MdDelete } from "react-icons/md";

const SYSTEM_LABELS = [
  { id: "inbox", icon: <MdInbox />, label: "Inbox" },
  { id: "starred", icon: <MdStar />, label: "Starred" },
  { id: "sent", icon: <MdSend />, label: "Sent" },
  { id: "draft", icon: <MdDrafts />, label: "Drafts" },
  { id: "spam", icon: <MdReport />, label: "Spam" },
  { id: "trash", icon: <MdDelete />, label: "Trash" },
];

export default function InboxPage() {
  const [query, setQuery] = useState("");
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
    handleRestoreMail,
    isDraftMail,
    labelMap,
    loadMails,
  } = useInboxMails(label, query);

  return (
    <AppLayout>
      <div className="inbox-page">
        <div className="inbox-main-content">
          <aside className="sidebar">
            <button className="compose-btn" onClick={() => setShowCompose(true)}>
              Compose
            </button>
            <div className="system-labels">
              {SYSTEM_LABELS.map(({ id, icon, label: text }) => (
                <div
                  key={id}
                  className={`label-item ${label === id ? "selected" : ""}`}
                  onClick={() => navigate(`/mails/${id}`)}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {icon}
                    {text}
                  </span>
                </div>
              ))}
            </div>
            <LabelManager
              selectedLabel={label}
              onSelect={(name) => navigate(`/mails/${name}`)}
              hideDefaults={true}
            />
          </aside>

          <section className="mail-list-section">
            <h1 className="inbox-title">{label ? label : "Inbox"}</h1>
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
          </section>
        </div>

        {showCompose && (
          <ComposePopup onSend={handleSendMail} onClose={() => setShowCompose(false)} />
        )}

        {mailSentVisible && <MailSentPopup onClose={() => setMailSentVisible(false)} />}

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
      </div>
    </AppLayout>
  );
}
