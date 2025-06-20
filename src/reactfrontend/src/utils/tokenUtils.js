export function saveToken(token) {
  document.cookie = `token=${token}; path=/; secure; samesite=strict`;
}

export function getToken() {
  const match = document.cookie.match(/(^| )token=([^;]+)/);
  return match ? match[2] : null;
}

export function clearToken() {
  document.cookie = "token=; path=/; max-age=0";
}
