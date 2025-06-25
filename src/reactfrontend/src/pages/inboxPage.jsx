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

const SYSTEM_LABELS = ["inbox", "starred", "sent", "draft", "spam", "trash"];

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
              {SYSTEM_LABELS.map((lbl) => (
                <div
                  key={lbl}
                  className={`label-item ${label === lbl ? "selected" : ""}`}
                  onClick={() => navigate(`/mails/${lbl}`)}
                >
                  {lbl.charAt(0).toUpperCase() + lbl.slice(1)}
                </div>
              ))}
            </div>

            <div className="custom-labels-title">Labels</div>

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
