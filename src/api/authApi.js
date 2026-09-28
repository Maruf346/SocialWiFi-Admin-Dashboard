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
