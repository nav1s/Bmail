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
    id: null,       // stores mail ID if editing
    draft: true,    // default to true when composing
  });

  useEffect(() => {
    if (prefill) {
      setForm({
        to: Array.isArray(prefill.to) ? prefill.to.join(", ") : prefill.to || "",
        title: prefill.title || "",
        body: prefill.body || "",
        id: prefill.id ?? null,
        draft: prefill.draft ?? true,
      });
    }
  }, [prefill]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    setForm((f) => ({ ...f, file: e.target.files[0] }));
  };

  const parseForm = (isDraft = false) => {
    const toList = form.to
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean);

    return {
      ...form,
      to: toList,
      draft: isDraft,
    };
  };

  return { form, handleChange, handleFileChange, parseForm };
}
