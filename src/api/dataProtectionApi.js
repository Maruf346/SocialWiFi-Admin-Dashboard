import { apiRequest } from "./client";

const unwrap = (response) => response?.data || response;

export const dataProtectionApi = {
  async list(query = {}) {
    return unwrap(
      await apiRequest("/api/v1/security/data-protection/", {
        query,
      })
    );
  },

  async create(body) {
    return unwrap(
      await apiRequest("/api/v1/security/data-protection/", {
        method: "POST",
        body,
      })
    );
  },

  async retrieve(id) {
    return unwrap(await apiRequest(`/api/v1/security/data-protection/${id}/`));
  },

  async update(id, body) {
    return unwrap(
      await apiRequest(`/api/v1/security/data-protection/${id}/`, {
        method: "PATCH",
        body,
      })
    );
  },

  async emailCustomer(id, personal_message = "") {
    return unwrap(
      await apiRequest(`/api/v1/security/data-protection/${id}/email-customer/`, {
        method: "POST",
        body: { personal_message },
      })
    );
  },

  async addNote(id, body) {
    return unwrap(
      await apiRequest(`/api/v1/security/data-protection/${id}/notes/`, {
        method: "POST",
        body: { body },
      })
    );
  },

  async perform(id) {
    return unwrap(
      await apiRequest(`/api/v1/security/data-protection/${id}/perform/`, {
        method: "POST",
        body: { confirmed: true },
      })
    );
  },

  async saveAsPending(id) {
    return unwrap(
      await apiRequest(`/api/v1/security/data-protection/${id}/save-as-pending/`, {
        method: "POST",
      })
    );
  },

  async sendCompletionEmail(id) {
    return unwrap(
      await apiRequest(`/api/v1/security/data-protection/${id}/send-completion-email/`, {
        method: "POST",
      })
    );
  },

  async findCustomer(email) {
    return unwrap(
      await apiRequest("/api/v1/security/data-protection/find-customer/", {
        method: "POST",
        body: { email },
      })
    );
  },

  async generateId() {
    return unwrap(await apiRequest("/api/v1/security/data-protection/generate-id/"));
  },
};
