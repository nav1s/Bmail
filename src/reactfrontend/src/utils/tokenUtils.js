export function saveTokenToCookie(token) {
  document.cookie = `token=${token}; path=/; secure; samesite=strict`;
}

export function getTokenFromCookie() {
  const match = document.cookie.match(/(^| )token=([^;]+)/);
  return match ? match[2] : null;
}

export function clearTokenFromCookie() {
  document.cookie = "token=; path=/; max-age=0";
}
