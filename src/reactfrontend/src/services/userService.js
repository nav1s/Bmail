import api from "./api";

export async function getUserByUsername(username) {
  return api.get(`/users/username/${username}`, { auth: true });
}

export async function getUserById(id) {
  return api.get(`/users/${id}`);
}

export async function updateUser(id, formData) {
  await api.patch("/users", formData);
  return getUserById(id); // תחזיר את כל פרטי המשתמש המלאים
}