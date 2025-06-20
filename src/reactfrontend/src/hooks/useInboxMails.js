import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

/**
 * Handles all inbox-related data and state:
 * - loading mails
 * - sending mail
 * - deleting/trashing mail
 * - controlling compose and sent state
 */
export default function useInboxMails(label, query) {
  const [mails, setMails] = useState([]);
  const [showCompose, setShowCompose] = useState(false);
  const [mailSentVisible, setMailSentVisible] = useState(false);
  const [openedMail, setOpenedMail] = useState(null);

  const navigate = useNavigate();

  /**
   * reloads mails when label or query changes
   */
  useEffect(() => {
    const delay = setTimeout(loadMails, 1);
    return () => clearTimeout(delay);
  }, [query, label]);

  /**
   * Loads mail for the current label or query
   */
  const loadMails = async () => {
    try {
        // filter different endpoints according to request
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

  /**
   * Sends a new mail or draft
   */
  const handleSendMail = async (formData) => {
    try {
      await api.post("/mails", formData, { auth: true });
      await loadMails();
      setShowCompose(false);

      // Show popup if not draft
      if (!formData.draft) {
        setMailSentVisible(true);
        setTimeout(() => setMailSentVisible(false), 2000);
      }
    } catch (err) {
      alert("Send failed: " + err.message);
    }
  };

  /**
   * Moves a mail to Trash label
   */
  const handleTrashMail = async (mailId) => {
    try {
      const allLabels = await api.get("/labels", { auth: true });
      const trashLabel = allLabels.find((l) => l.name.toLowerCase() === "trash");
      if (!trashLabel) throw new Error("Trash label not found");
      await api.post(`/mails/${mailId}/labels`, { labelId: 6 }, { auth: true });
      //await api.post(`/mails/${mailId}/labels`, { labelId: trashLabel.id }, { auth: true });
      await loadMails();
    } catch (err) {
      console.error(err);
      alert("Failed to move to trash: " + err.message);
    }
  };

  /**
   * Permanently deletes a mail
   */
  const handleDeleteMail = async (id) => {
    try {
      await api.delete(`/mails/${id}`, { auth: true });
      await loadMails();
    } catch (err) {
      console.error("DELETE error:", err.response || err);
      alert("Delete failed: " + (err.response?.data?.message || err.message));
    }
  };

  /**
   * Determines if a mail is a draft (labelId 3 = DRAFT)
   */
  const isDraftMail = (mail) =>
    Array.isArray(mail.labels) && mail.labels.includes(3);

  return {
    mails,
    showCompose,
    setShowCompose,
    mailSentVisible,
    setMailSentVisible,
    openedMail,
    setOpenedMail,
    loadMails,
    handleSendMail,
    handleTrashMail,
    handleDeleteMail,
    isDraftMail
  };
}
