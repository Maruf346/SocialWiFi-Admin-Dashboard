import { apiRequest } from "./client";

const unwrap = (response) => response?.data || response;

const buildResourceFormData = ({ title, description = "", file, category, is_active = true }) => {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);
  formData.append("category", category);
  formData.append("is_active", String(is_active));
  if (file) formData.append("file", file);
  return formData;
};

export const supportResourcesApi = {
  async list() {
    return unwrap(await apiRequest("/api/v1/supports/admin/resources/"));
  },

  async retrieve(id) {
    return unwrap(await apiRequest(`/api/v1/supports/admin/resources/${id}/`));
  },

  async create(payload) {
    return unwrap(
      await apiRequest("/api/v1/supports/admin/resources/", {
        method: "POST",
        body: buildResourceFormData(payload),
      })
    );
  },

  async update(id, payload) {
    return unwrap(
      await apiRequest(`/api/v1/supports/admin/resources/${id}/`, {
        method: "PATCH",
        body: buildResourceFormData(payload),
      })
    );
  },

  async delete(id) {
    return apiRequest(`/api/v1/supports/admin/resources/${id}/`, {
      method: "DELETE",
    });
  },
};
