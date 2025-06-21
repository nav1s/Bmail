import api from "./api";

/**
 * Fetches all labels for the current user.
 */
export function getLabels() {
  console.log("📡 Fetching labels...");
  return api.get("/labels", { auth: true });
}

/**
 * Attach a label to a mail.
 */
export function attachLabel(mailId, labelId) {
  return api.post(`/mails/${mailId}/labels`, { labelId }, { auth: true });
}

/**
 * Detach a label from a mail.
 */
export function detachLabel(mailId, labelId) {
  return api.delete(`/mails/${mailId}/labels/${labelId}`, { auth: true });
}
