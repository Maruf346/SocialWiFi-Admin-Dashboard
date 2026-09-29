import { apiRequest } from "./client";

const unwrap = (response) => response?.data || response;

export const routeHistoryApi = {
  async list(query = {}) {
    return unwrap(
      await apiRequest("/api/v1/admin/route-history/", {
        query,
      })
    );
  },

  async retrieve(routeId) {
    return unwrap(await apiRequest(`/api/v1/admin/route-history/${routeId}/`));
  },

  async listWaypoints(routeId) {
    return unwrap(await apiRequest(`/api/v1/admin/route-history/${routeId}/waypoints/`));
  },
};
