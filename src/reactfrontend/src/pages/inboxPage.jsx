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
    handleRestoreMail,
    isDraftMail,
    labelMap,
    loadMails
  } = useInboxMails(label, query);

  return (
    <div>
      <Header />

      {showAccount && (
        <AccountPopup onClose={() => setShowAccount(false)} />
      )}

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
          />
        ))}
    </div>
  );
}
