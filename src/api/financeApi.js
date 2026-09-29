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

  async listExpenses(query = {}) {
    return unwrap(
      await apiRequest("/api/v1/finance/expenses/", {
        query,
      })
    );
  },

  async getExpense(id) {
    return unwrap(await apiRequest(`/api/v1/finance/expenses/${id}/`));
  },

  async createExpense(body) {
    return unwrap(
      await apiRequest("/api/v1/finance/expenses/", {
        method: "POST",
        body,
      })
    );
  },

  async updateExpense(id, body) {
    return unwrap(
      await apiRequest(`/api/v1/finance/expenses/${id}/`, {
        method: "PATCH",
        body,
      })
    );
  },

  async deleteExpense(id) {
    return apiRequest(`/api/v1/finance/expenses/${id}/`, {
      method: "DELETE",
    });
  },

  async downloadExpenses(query = {}) {
    return apiRequest("/api/v1/finance/expenses/download/", {
      query,
    });
  },

  async getExpensesSummary(query = {}) {
    return unwrap(
      await apiRequest("/api/v1/finance/expenses/summary/", {
        query,
      })
    );
  },
};
