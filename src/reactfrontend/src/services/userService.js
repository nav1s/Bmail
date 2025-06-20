import api from "./api";

export async function getUserByUsername(username) {
  return api.get(`/users/username/${username}`, { auth: true });
}
