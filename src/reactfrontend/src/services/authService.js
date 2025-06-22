import api from "./api";

export async function login(username, password) {
  const res = await api.post("/tokens", { username, password });
  return res;
}

export const register = async (formData) => {
  const res = await fetch("/api/users", {
    method: "POST",
    body: formData // FormData, no need for headers
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Registration failed");
  }

  return res;
};
