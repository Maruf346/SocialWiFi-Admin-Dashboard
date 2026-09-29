import { apiRequest } from "./client";

const unwrap = (response) => response?.data || response;

export const auditLogsApi = {
  async list(query = {}) {
    return unwrap(
      await apiRequest("/api/v1/admin/audit-logs/", {
        query,
      })
    );
  },

  async retrieve(id) {
    return unwrap(await apiRequest(`/api/v1/admin/audit-logs/${id}/`));
  },

  async options() {
    return unwrap(await apiRequest("/api/v1/admin/audit-logs/options/"));
  },
};
