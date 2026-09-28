import { authStorage } from "../utils/authStorage";

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "https://api.getrightroute.app/"
).replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message, { status, data } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const isFormData = (body) => typeof FormData !== "undefined" && body instanceof FormData;

const buildUrl = (path, query) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${API_BASE_URL}${normalizedPath}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, value);
      }
    });
  }

  return url.toString();
};

const parseResponse = async (response) => {
  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  if (
    contentType.includes("text/") ||
    contentType.includes("application/yaml") ||
    contentType.includes("application/vnd.oai.openapi")
  ) {
    return response.text();
  }

  return response.blob();
};

const getErrorMessage = (data, fallback) => {
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (data.message) return data.message;
  if (data.detail) return data.detail;
  if (data.error) return data.error;

  const firstError = Object.values(data).flat?.()[0];
  if (typeof firstError === "string") return firstError;

  return fallback;
};

const refreshAccessToken = async () => {
  const refresh = authStorage.getRefreshToken();
  if (!refresh) return null;

  const response = await fetch(buildUrl("/api/v1/auth/refresh-token/"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  const data = await parseResponse(response);
  if (!response.ok) {
    authStorage.clearSession();
    return null;
  }

  const accessToken = data?.access || data?.access_token || data?.data?.access_token;
  const refreshToken = data?.refresh || data?.refresh_token || data?.data?.refresh_token || refresh;

  if (!accessToken) return null;

  authStorage.setSession({
    accessToken,
    refreshToken,
    user: authStorage.getUser(),
  });

  return accessToken;
};

export const apiRequest = async (path, options = {}) => {
  const {
    method = "GET",
    body,
    query,
    auth = true,
    retryOnUnauthorized = true,
    headers: customHeaders,
  } = options;

  const headers = new Headers(customHeaders || {});
  const token = authStorage.getAccessToken();

  if (auth && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let requestBody = body;
  if (body !== undefined && !isFormData(body)) {
    headers.set("Content-Type", "application/json");
    requestBody = JSON.stringify(body);
  }

  const response = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: requestBody,
  });

  if (response.status === 401 && auth && retryOnUnauthorized) {
    const newAccessToken = await refreshAccessToken();
    if (newAccessToken) {
      return apiRequest(path, {
        ...options,
        retryOnUnauthorized: false,
      });
    }
  }

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new ApiError(getErrorMessage(data, "Request failed"), {
      status: response.status,
      data,
    });
  }

  return data;
};
