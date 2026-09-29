import { apiRequest } from "./client";

const unwrap = (response) => response?.data || response;

export const financeApi = {
  async getSubscriptionPaymentsSummary(query = {}) {
    return unwrap(
      await apiRequest("/api/v1/finance/subscription-payments/summary/", {
        query,
      })
    );
  },

  async getFleetPaymentsSummary(query = {}) {
    return unwrap(
      await apiRequest("/api/v1/finance/fleet-payments/summary/", {
        query,
      })
    );
  },
};
