import { apiRequest } from "./client";
import { authStorage } from "../utils/authStorage";

const extractLoginData = (response) => response?.data || response;

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
      user: {
        id: data.id,
        email: data.email,
        userType: data.user_type,
      },
    });

    return response;
  },

  async requestPasswordReset(email) {
    authStorage.setPendingEmail(email);
    return apiRequest("/api/v1/auth/forget-password/", {
      method: "POST",
      auth: false,
      body: { email },
    });
  },

  async verifyResetOtp({ email, otpCode }) {
    sessionStorage.setItem("rightroute_admin_reset_otp", otpCode);
    return apiRequest("/api/v1/auth/verify-otp/", {
      method: "POST",
      auth: false,
      body: { email, otp_code: otpCode, purpose: "RESET" },
    });
  },

  async resendResetOtp(email) {
    return apiRequest("/api/v1/auth/resend-otp/", {
      method: "POST",
      auth: false,
      body: { email, purpose: "RESET" },
    });
  },

  async resetPassword({ email, otpCode, newPassword, confirmPassword }) {
    return apiRequest("/api/v1/auth/reset-password/", {
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
    return apiRequest("/api/v1/userinfo/");
  },

  async logout() {
    try {
      await apiRequest("/api/v1/auth/logout/", { method: "POST" });
    } finally {
      authStorage.clearSession();
    }
  },
};
