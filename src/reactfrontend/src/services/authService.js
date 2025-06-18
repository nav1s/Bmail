import api from "./api";

export async function login(username, password) {
  const res = await api.post("/tokens", { username, password });
  return res;
}

export async function register(userData) {
  return api.post("/users", userData);
}
