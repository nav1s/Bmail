import React, { useEffect, useState } from "react";
import MailList from "../components/common/inbox/MailList";
import SearchBar from "../components/common/inbox/SearchBar";
import ComposeModal from "../components/common/inbox/ComposeModal";
import MailSentPopup from "../components/common/inbox/MailSentPopup";
import LabelSelector from "../components/common/inbox/LabelSelector";
import api from "../services/api";
import { clearTokenFromCookie } from "../utils/tokenUtils";
import { useNavigate, useParams } from "react-router-dom";
import LabelManager from "../components/common/labels/LabelManager";

export default function InboxPage() {
  const [mails, setMails] = useState([]);
  const [query, setQuery] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [mailSentVisible, setMailSentVisible] = useState(false);
  const { label } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const delayDebounce = setTimeout(loadMails, 300);
    return () => clearTimeout(delayDebounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, label]);

  const loadMails = async () => {
    try {
      const endpoint = query.trim()
        ? `/mails/search/${encodeURIComponent(query)}`
        : `/mails/byLabel/${encodeURIComponent(label || "inbox")}`;

      const data = await api.get(endpoint, { auth: true });
      setMails(data);
    } catch (err) {
      console.error(err);
      alert("Error loading mails: " + err.message);
      if (err.status === 401) {
        handleLogout();
      }
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


  const handleLogout = () => {
    clearTokenFromCookie();
    navigate("/login");
  };

  return (
    <div>
      <h2>Inbox</h2>
      <button onClick={handleLogout}>Logout</button>
      <button onClick={() => setShowCompose(true)}>Compose</button>

      <LabelManager selectedLabel={label} />

      <SearchBar query={query} setQuery={setQuery} />
      <MailList mails={mails} onDelete={handleDeleteMail} />

      {showCompose && (
        <ComposeModal onSend={handleSendMail} onClose={() => setShowCompose(false)} />
      )}
      {mailSentVisible && <MailSentPopup onClose={() => setMailSentVisible(false)} />}
    </div>
  );
}
