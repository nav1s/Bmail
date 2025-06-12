const BASE_URL = "http://localhost:8080/api";

async function request(endpoint, method = "GET", body = null, options = {}) {
  const headers = {
    "Content-Type": "application/json",
  };

  // check for auth-cookie
  if (options.auth) {
    const token = getTokenFromCookie();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  // fetching backend requests to api
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    credentials: "include",
    body: body ? JSON.stringify(body) : null,
  });
  
  let responseBody;
  try {
    responseBody = await res.json(); // attempt to parse JSON always
  } catch {
    responseBody = {};
  }

  if (!res.ok) {
    const message = responseBody?.error || "Something went wrong.";
    const error = new Error(message);
    error.status = res.status;
    error.body = responseBody;
    throw error;
  }

  return responseBody;
}


function getTokenFromCookie() {
  const match = document.cookie.match(/(^| )token=([^;]+)/);
  return match ? match[2] : null;
}

export default {
  get: (url, opts) => request(url, "GET", null, opts),
  post: (url, data, opts) => request(url, "POST", data, opts),
  patch: (url, data, opts) => request(url, "PATCH", data, opts),
  delete: (url, opts) => request(url, "DELETE", null, opts),
};
