import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { getLabels } from "../services/labelService";

export default function useInboxMails(label, query) {
  const [mails, setMails] = useState([]);
  const [showCompose, setShowCompose] = useState(false);
  const [mailSentVisible, setMailSentVisible] = useState(false);
  const [openedMail, setOpenedMail] = useState(null);
  const [labelMap, setLabelMap] = useState({});

  const navigate = useNavigate();

  const loadMails = async () => {
    try {
      let endpoint = "";
      if (query.trim()) {
        endpoint = `/mails/search/${encodeURIComponent(query)}`;
      } else if (label?.toLowerCase() === "all") {
        endpoint = "/mails";
      } else {
        endpoint = `/mails/byLabel/${encodeURIComponent(label)}`;
      }

      let data = await api.get(endpoint, { auth: true });
      setMails(data);
    } catch (err) {
      console.error(err);
      alert("Error loading mails: " + err.message);
      if (err.status === 401) {
        navigate("/login");
      }
    }
  };

  useEffect(() => {
  const fetchLabels = async () => {
    try {
      console.log("📡 Fetching labels...");
      const res = await getLabels();
      const map = {};

      res.forEach(label => {
        map[label.name.toLowerCase()] = label.id;
      });
      setLabelMap(map);
    } catch (err) {
      console.error("❌ Failed to load labels:", err);
    }
  };

  fetchLabels();
}, []);


  useEffect(() => {
    const delay = setTimeout(loadMails, 1);
    return () => clearTimeout(delay);
  }, [query, label]);

  const handleSendMail = async (formData) => {
  try {
    const isUpdate = formData.id != null;
    const { id, ...data } = formData;

    if (isUpdate) {
      // Update existing draft or sent mail
      await api.patch(`/mails/${id}`, { ...data, draft: formData.draft }, { auth: true });
    } else {
      // Create new mail (draft or sent)
      await api.post("/mails", { ...data, draft: formData.draft }, { auth: true });
    }

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


  const handleTrashMail = async (mailId) => {
    try {
      const trashId = labelMap["trash"];
      if (!trashId) throw new Error("Trash label ID not loaded");
      await api.post(`/mails/${mailId}/labels`, { labelId: trashId }, { auth: true });
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

  const handleRestoreMail = async (mailId) => {
    try {
      const trashId = labelMap["trash"];
      if (!trashId) throw new Error("Trash label ID not loaded");
      await api.delete(`/mails/${mailId}/labels/${trashId}`, { auth: true });
      await loadMails();
    } catch (err) {
      console.error("Restore failed:", err);
      alert("Could not restore mail: " + err.message);
    }
  };

  const handleUnspamMail = async (mailId) => {
  try {
    const spamId = labelMap["spam"];
    if (!spamId) throw new Error("Spam label ID not loaded");
    await api.delete(`/mails/${mailId}/labels/${spamId}`, { auth: true });
    await loadMails();
  } catch (err) {
    console.error("Unspam failed:", err);
    alert("Could not remove spam label: " + err.message);
  }
};


   const isDraftMail = (mail) =>Array.isArray(mail.labels) && labelMap.drafts && mail.labels.includes(labelMap.drafts);


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
    handleRestoreMail,
    isDraftMail,
    labelMap,
    handleUnspamMail
  };
}