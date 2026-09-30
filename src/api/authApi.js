import { apiRequest } from "./client";
import { authStorage } from "../utils/authStorage";

const RESET_OTP_KEY = "rightroute_admin_reset_otp";
const extractLoginData = (response) => response?.data || response;

const normalizeAdminProfile = (data = {}) => ({
  id: data.id,
  email: data.email,
  userType: data.user_type,
  isSuperadmin: Boolean(data.is_superadmin),
  permissions: Array.isArray(data.permissions) ? data.permissions : [],
});

export const authApi = {
  async requestAdminLogin({ email, password }) {
    const response = await apiRequest("/api/v1/auth/admin/login/", {
      method: "POST",
      auth: false,
      body: { email, password },
    });

    const data = extractLoginData(response);
    authStorage.setPendingEmail(data?.email || email);
    return response;
  },

  async verifyAdminOtp({ email, otpCode }) {
    const response = await apiRequest("/api/v1/auth/admin/login/", {
      method: "POST",
      auth: false,
      body: { email, otp_code: otpCode },
    });

    const data = extractLoginData(response);
    const accessToken = data?.access_token;
    const refreshToken = data?.refresh_token;

    if (!accessToken || !refreshToken) {
      throw new Error("Login succeeded, but the response did not include both access and refresh tokens.");
    }

    authStorage.setSession({
      accessToken,
      refreshToken,
      user: normalizeAdminProfile(data),
    });

    return response;
  },

  async requestPasswordReset(email) {
    authStorage.setPendingEmail(email);
    sessionStorage.removeItem(RESET_OTP_KEY);

    return apiRequest("/api/v1/auth/admin/forget-password/", {
      method: "POST",
      auth: false,
      body: { email },
    });
  },

  async verifyResetOtp({ otpCode }) {
    sessionStorage.setItem(RESET_OTP_KEY, otpCode);
    return { success: true };
  },

  async resendResetOtp(email) {
    authStorage.setPendingEmail(email);
    sessionStorage.removeItem(RESET_OTP_KEY);

    return apiRequest("/api/v1/auth/admin/forget-password/", {
      method: "POST",
      auth: false,
      body: { email },
    });
  },

  async resetPassword({ email, otpCode, newPassword, confirmPassword }) {
    return apiRequest("/api/v1/auth/admin/reset-password/", {
      method: "POST",
      auth: false,
      body: {
        email,
        otp_code: otpCode,
        new_password: newPassword,
        confirm_password: confirmPassword,
      },
    });
  },

  async getCurrentUser() {
    const response = await apiRequest("/api/v1/auth/admin/me/");
    const user = normalizeAdminProfile(extractLoginData(response));
    authStorage.setSession({ user });
    return user;
  },

  async logout() {
    try {
      await apiRequest("/api/v1/auth/logout/", { method: "POST" });
    } finally {
      authStorage.clearSession();
    }
  },
};