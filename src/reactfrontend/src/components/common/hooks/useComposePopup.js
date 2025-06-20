import { useState, useEffect } from "react";

/**
 * useComposePopup
 * Manages form state and parsing for ComposePopup.
 */
export default function useComposePopup(prefill) {
  const [form, setForm] = useState({
    to: "",
    title: "",
    body: "",
  });

  useEffect(() => {
    if (prefill) {
      setForm({
        to: Array.isArray(prefill.to) ? prefill.to.join(", ") : prefill.to || "",
        title: prefill.title || "",
        body: prefill.body || "",
      });
    }
  }, [prefill]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const parseForm = (isDraft = false) => {
    const toList = form.to
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean);

    return { ...form, to: toList, draft: isDraft };
  };

  return { form, handleChange, parseForm };
}
