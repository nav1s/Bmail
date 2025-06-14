import React, { useEffect, useState } from "react";
import MailList from "../components/common/inbox/MailList";
import SearchBar from "../components/common/inbox/SearchBar";
import ComposeModal from "../components/common/inbox/ComposeModal";
import BlacklistForm from "../components/common/inbox/BlacklistForm";
import api from "../services/api";
import { clearTokenFromCookie } from "../utils/tokenUtils";
import { useNavigate } from "react-router-dom";
import MailSentPopup from "../components/common/inbox/MailSentPopup";


export default function InboxPage() {
  const [mails, setMails] = useState([]);
  const [query, setQuery] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState(null);
  const [mailSentVisible, setMailSentVisible] = useState(false);



  // Load mails on mount or query change
  useEffect(() => {
    const delayDebounce = setTimeout(loadMails, 300); // debounce
    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleDeleteMail = async (id) => {
    try {
      await api.delete(`/mails/${id}`, { auth: true });
      await loadMails();
      setFeedback({ type: "success", message: "URL removed from blacklist." });
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    }
  };

  const handleSendMail = async (formData) => {
    try {
      await api.post("/mails", formData, { auth: true });
      await loadMails();
      setShowCompose(false); // close modal only on success
      setMailSentVisible(true);
      setTimeout(() => setMailSentVisible(false), 2000);
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    }
  };



  const handleAddURL = async (url) => {
    try {
      await api.post("/blacklist", { url }, { auth: true });
      alert("URL added to blacklist.");
    } catch (err) {
      alert("Blacklist add failed: " + err.message);
    }
  };

  const handleDeleteURL = async (url) => {
    try {
      await api.delete(`/blacklist/${encodeURIComponent(url)}`, { auth: true });
      alert("URL removed from blacklist.");
    } catch (err) {
      alert("Blacklist delete failed: " + err.message);
    }
  };

  const handleLogout = () => {
    clearTokenFromCookie();
    navigate("/login");
  };

  const loadMails = async () => {
  try {
    const endpoint = query.trim()
      ? `/mails/search/${encodeURIComponent(query)}`
      : "/mails";
    const data = await api.get(endpoint, { auth: true });
    setMails(data);
  } catch (err) {
    console.error(err);
    alert("Error loading mails: " + err.message);
    if (err.status === 401) {
      clearTokenFromCookie();
      navigate("/login");
    }
  }
  };


  return (
    <div>
      <h2>Inbox</h2>
      <button onClick={handleLogout}>Logout</button>
      <button onClick={() => setShowCompose(true)}>Compose</button>
      <SearchBar query={query} setQuery={setQuery} />
      <MailList mails={mails} onDelete={handleDeleteMail} />
      <BlacklistForm onAdd={handleAddURL} onDelete={handleDeleteURL} />
      {showCompose && (
        <ComposeModal onSend={handleSendMail} onClose={() => setShowCompose(false)} />
      )}
      {mailSentVisible && <MailSentPopup onClose={() => setMailSentVisible(false)} />}
    </div>
  );

}
