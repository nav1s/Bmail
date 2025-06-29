// services/labelService.js
import api from "./api";

/**
 * Fetch all labels for the current user.
 */
export function getLabels() {
  return api.get("/labels", { auth: true });
}

/**
 * Get a specific label.
 */
export function getLabelById(labelId) {
  return api.get(`/labels/${labelId}`, { auth: true });
}

/**
 * Create a new label.
 */
export function createLabel(labelData) {
  return api.post("/labels", labelData, { auth: true });
}

/**
 * Update an existing label.
 */
export function updateLabel(labelId, updatedData) {
  return api.patch(`/labels/${labelId}`, updatedData, { auth: true });
}

/**
 * Delete a label.
 */
export function deleteLabel(labelId) {
  return api.delete(`/labels/${labelId}`, { auth: true });
}
