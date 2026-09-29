import { apiRequest } from "./client";

const unwrap = (response) => response?.data || response;

export const analyticsApi = {
  async getRevenueDashboard(query = {}) {
    return unwrap(
      await apiRequest("/api/v1/analytics/revenue/dashboard/", {
        query,
      })
    );
  },

  async getRevenueTimePeriods() {
    return unwrap(await apiRequest("/api/v1/analytics/revenue/time-periods/"));
  },
};
