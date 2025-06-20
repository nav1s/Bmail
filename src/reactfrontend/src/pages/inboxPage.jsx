import React, { useEffect, useState } from "react";
import MailList from "../components/common/inbox/MailList";
import SearchBar from "../components/common/inbox/SearchBar";
import ComposeModal from "../components/common/inbox/ComposeModal";
import MailSentPopup from "../components/common/inbox/MailSentPopup";
import LabelSelector from "../components/common/inbox/LabelSelector";
import MailViewerModal from "../components/common/inbox/MailViewerModal";
import api from "../services/api";
import { useNavigate, useParams } from "react-router-dom";
import LabelManager from "../components/common/labels/LabelManager";
import Header from "../components/layout/Header";

export default function InboxPage() {
  const [mails, setMails] = useState([]);
  const [query, setQuery] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [mailSentVisible, setMailSentVisible] = useState(false);
  const [openedMail, setOpenedMail] = useState(null);
  const { label } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const delayDebounce = setTimeout(loadMails, 300);
    return () => clearTimeout(delayDebounce);
  }, [query, label]);

  const loadMails = async () => {
    try {
      let endpoint = "";
      if (query.trim()) {
        endpoint = `/mails/search/${encodeURIComponent(query)}`;
      } else if (label.toLowerCase() === "all mails") {
        endpoint = "/mails";
      } else {
        endpoint = `/mails/byLabel/${encodeURIComponent(label)}`;
      }

      const data = await api.get(endpoint, { auth: true });
      setMails(data);
    } catch (err) {
      console.error(err);
      alert("Error loading mails: " + err.message);
      if (err.status === 401) {
        navigate("/login");
      }
    }
  };

  const handleTrashMail = async (mailId) => {
    try {
      const allLabels = await api.get("/labels", { auth: true });
      const trashLabel = allLabels.find((l) => l.name.toLowerCase() === "trash");
      if (!trashLabel) throw new Error("Trash label not found");

      await api.post(`/mails/${mailId}/labels`, { labelId: trashLabel.id }, { auth: true });
      await loadMails();
    } catch (err) {
      console.error(err);
      alert("Failed to move to trash: " + err.message);
    }
  };

  const handleDeleteMail = async (id) => {
    try {
      await api.delete(`/mails/${id}`, { auth: true });
      await loadMails();
    } catch (err) {
      console.error("DELETE error:", err.response || err);
      alert("Delete failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleSendMail = async (formData) => {
    try {
      await api.post("/mails", formData, { auth: true });
      await loadMails();
      setShowCompose(false);
      if (!formData.draft) {
        setMailSentVisible(true);
        setTimeout(() => setMailSentVisible(false), 2000);
      }
    } catch (err) {
      alert("Send failed: " + err.message);
    }
  };

  const isDraftMail = (mail) =>
    Array.isArray(mail.labels) && mail.labels.includes(3);

  return (
    <div>
      <Header /> {/* ✅ Using new header */}

      <button onClick={() => setShowCompose(true)}>Compose</button>

      <LabelManager selectedLabel={label} />
      <SearchBar query={query} setQuery={setQuery} />
      <MailList
        mails={mails}
        onDelete={handleDeleteMail}
        onMailClick={setOpenedMail}
        onTrash={handleTrashMail}
        onDeletePermanent={handleDeleteMail}
        selectedLabel={label}
      />

      {showCompose && (
        <ComposeModal onSend={handleSendMail} onClose={() => setShowCompose(false)} />
      )}
      {mailSentVisible && <MailSentPopup onClose={() => setMailSentVisible(false)} />}

      {openedMail &&
        (isDraftMail(openedMail) ? (
          <ComposeModal
            onSend={handleSendMail}
            onClose={() => setOpenedMail(null)}
            prefill={openedMail}
          />
        ) : (
          <MailViewerModal mail={openedMail} onClose={() => setOpenedMail(null)} />
        ))}
    </div>
  );
}
