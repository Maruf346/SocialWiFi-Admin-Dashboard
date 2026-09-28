const ACCESS_TOKEN_KEY = "rightroute_admin_access_token";
const REFRESH_TOKEN_KEY = "rightroute_admin_refresh_token";
const USER_KEY = "rightroute_admin_user";
const PENDING_EMAIL_KEY = "rightroute_admin_pending_email";

const safeJsonParse = (value) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const authStorage = {
  getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  getUser() {
    return safeJsonParse(localStorage.getItem(USER_KEY));
  },

  setSession({ accessToken, refreshToken, user }) {
    if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    sessionStorage.removeItem(PENDING_EMAIL_KEY);
  },

  clearSession() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(PENDING_EMAIL_KEY);
  },

  isAuthenticated() {
    return Boolean(this.getAccessToken());
  },

  setPendingEmail(email) {
    if (email) sessionStorage.setItem(PENDING_EMAIL_KEY, email);
  },

  getPendingEmail() {
    return sessionStorage.getItem(PENDING_EMAIL_KEY);
  },
};
