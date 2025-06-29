// services/mailService.js
import api from "./api";

/**
 * Get inbox mails.
 */
export function getInboxMails() {
  return api.get("/mails", { auth: true });
}

/**
 * Get mails filtered by label.
 */
export function getMailsByLabel(labelName) {
  return api.get(`/mails/byLabel/${labelName}`, { auth: true });
}

/**
 * Get a specific mail.
 */
export function getMailById(mailId) {
  return api.get(`/mails/${mailId}`, { auth: true });
}

/**
 * Send a new mail.
 */
export function sendMail(mailData) {
  return api.post("/mails", mailData, { auth: true });
}

/**
 * Update an existing mail.
 */
export function updateMail(mailId, updateData) {
  return api.patch(`/mails/${mailId}`, updateData, { auth: true });
}

/**
 * Delete a mail.
 */
export function deleteMail(mailId) {
  return api.delete(`/mails/${mailId}`, { auth: true });
}

/**
 * Search mails.
 */
export function searchMails(query) {
  return api.get(`/mails/search/${query}`, { auth: true });
}

/**
 * Attach a label to a mail.
 */
export function attachLabelToMail(mailId, labelId) {
  return api.post(`/mails/${mailId}/labels`, { labelId }, { auth: true });
}

/**
 * Detach a label from a mail.
 */
export function detachLabelFromMail(mailId, labelId) {
  return api.delete(`/mails/${mailId}/labels/${labelId}`, { auth: true });
}
