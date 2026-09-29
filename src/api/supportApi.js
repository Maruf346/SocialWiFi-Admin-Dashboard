import { apiRequest } from "./client";

const unwrap = (response) => response?.data || response;

export const supportApi = {
  async listTickets(query = {}) {
    return unwrap(
      await apiRequest("/api/v1/supports/tickets/", {
        query,
      })
    );
  },

  async getTicket(id) {
    return unwrap(await apiRequest(`/api/v1/supports/tickets/${id}/`));
  },

  async createTicket(body) {
    return unwrap(
      await apiRequest("/api/v1/supports/tickets/", {
        method: "POST",
        body,
      })
    );
  },

  async updateTicket(id, body) {
    return unwrap(
      await apiRequest(`/api/v1/supports/tickets/${id}/`, {
        method: "PATCH",
        body,
      })
    );
  },

  async deleteTicket(id) {
    return apiRequest(`/api/v1/supports/tickets/${id}/`, {
      method: "DELETE",
    });
  },

  async archiveTicket(id) {
    return unwrap(
      await apiRequest(`/api/v1/supports/tickets/${id}/archive/`, {
        method: "POST",
      })
    );
  },

  async assignTicket(id, body) {
    return unwrap(
      await apiRequest(`/api/v1/supports/tickets/${id}/assign/`, {
        method: "POST",
        body,
      })
    );
  },

  async uploadAttachment(id, file) {
    const formData = new FormData();
    formData.append("file", file);

    return unwrap(
      await apiRequest(`/api/v1/supports/tickets/${id}/attachments/`, {
        method: "POST",
        body: formData,
      })
    );
  },

  async addMessage(id, body) {
    return unwrap(
      await apiRequest(`/api/v1/supports/tickets/${id}/messages/`, {
        method: "POST",
        body,
      })
    );
  },

  async getStats() {
    return unwrap(await apiRequest("/api/v1/supports/tickets/stats/"));
  },

  async listAssignees() {
    return unwrap(await apiRequest("/api/v1/supports/assignees/"));
  },

  async searchCustomers(q) {
    return unwrap(
      await apiRequest("/api/v1/supports/customers/search/", {
        query: { q },
      })
    );
  },
};
