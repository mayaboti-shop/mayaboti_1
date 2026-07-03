// ==============================================
// Shared auth helpers, used across login / create_on / admin / cart pages
// Requires config.js (API_BASE_URL) to be loaded first
// ==============================================

const Auth = {
  saveSession(token, user) {
    localStorage.setItem("mb_token", token);
    localStorage.setItem("mb_user", JSON.stringify(user));
  },

  getToken() {
    return localStorage.getItem("mb_token");
  },

  getUser() {
    const raw = localStorage.getItem("mb_user");
    return raw ? JSON.parse(raw) : null;
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  isAdmin() {
    const user = this.getUser();
    return !!user && user.role === "admin";
  },

  logout() {
    localStorage.removeItem("mb_token");
    localStorage.removeItem("mb_user");
  },

  // Wrapper around fetch that adds the Authorization header when logged in
  async apiFetch(path, options = {}) {
    const headers = Object.assign(
      { "Content-Type": "application/json" },
      options.headers || {}
    );

    const token = this.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });

    let data = null;
    try {
      data = await res.json();
    } catch (e) {
      /* no JSON body */
    }

    if (!res.ok) {
      throw new Error((data && data.message) || `Request failed (${res.status})`);
    }

    return data;
  },
};
