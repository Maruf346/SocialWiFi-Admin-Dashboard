import { apiRequest } from "./client";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatMoney = (value) => {
  if (value === undefined || value === null || value === "") return "-";
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return String(value);
  return `$${numeric.toFixed(2)}`;
};

export const normalizeSingleSubscriber = (subscriber) => ({
  id: subscriber.id,
  userId: subscriber.user_id,
  uuid: subscriber.uuid,
  name: subscriber.full_name || subscriber.name || subscriber.email || "Unnamed user",
  email: subscriber.email || "",
  plan: subscriber.billing_type || subscriber.current_plan || subscriber.plan_type || "-",
  signUpDate: formatDate(subscriber.sign_up_date || subscriber.created_at),
  nextPayment: formatDate(subscriber.next_payment),
  lastActive: formatDateTime(subscriber.last_time_active),
  status: subscriber.account_status || subscriber.status || "-",
  price: formatMoney(subscriber.price),
  discountPeriod: subscriber.discount_period || "0",
  discountAmount: subscriber.discount_amount || "0",
  state: subscriber.state || "-",
  platform: subscriber.platform || "-",
  locked: subscriber.locked ? "Yes" : "No",
  notes: subscriber.notes || "",
  raw: subscriber,
});


export const normalizeTeamSubscriber = (subscriber) => ({
  id: subscriber.id,
  userId: subscriber.user_id,
  teamId: subscriber.team_id,
  uuid: subscriber.uuid,
  name: subscriber.team_name || subscriber.full_name || subscriber.name || subscriber.email || "Unnamed team",
  company: subscriber.team_name || subscriber.company || "-",
  email: subscriber.email || "",
  phone: subscriber.phone || "-",
  dateSubscr: formatDate(subscriber.sign_up_date || subscriber.created_at),
  signUpDate: formatDate(subscriber.sign_up_date || subscriber.created_at),
  nextPayment: formatDate(subscriber.next_payment),
  lastActive: formatDateTime(subscriber.last_time_active),
  status: subscriber.account_status || subscriber.status || "-",
  currentPlan: subscriber.current_plan || subscriber.plan_type || "-",
  activeDrivers: subscriber.active_drivers ?? 0,
  driverLimit: subscriber.driver_limit ?? 0,
  price: formatMoney(subscriber.price),
  discountPeriod: subscriber.discount_period || "0",
  discountAmount: subscriber.discount_amount || "0",
  state: subscriber.state || "-",
  platform: subscriber.platform || "-",
  locked: subscriber.locked ? "Yes" : "No",
  notes: subscriber.notes || "",
  raw: subscriber,
});
const normalizeList = (response, normalizer) => {
  const data = response?.data ?? response?.results ?? response;
  const items = Array.isArray(data) ? data : data?.results || [];
  return {
    items: items.map(normalizer),
    count: response?.count ?? data?.count ?? items.length,
  };
};

export const subscribersApi = {
  async listSingle({ search } = {}) {
    const response = await apiRequest("/api/v1/admin/subscribers/single/", {
      query: { search },
    });
    return normalizeList(response, normalizeSingleSubscriber);
  },

  async retrieveSingle(id) {
    const response = await apiRequest(`/api/v1/admin/subscribers/single/${id}/`);
    return normalizeSingleSubscriber(response?.data || response);
  },

  async updateSingle(id, payload) {
    const body = {
      email: payload.email,
      status: payload.status,
    };

    if (payload.password) {
      body.password = payload.password;
    }

    const response = await apiRequest(`/api/v1/admin/subscribers/single/${id}/`, {
      method: "PATCH",
      body,
    });
    return normalizeSingleSubscriber(response?.data || response);
  },

  async lockSingle(id) {
    const response = await apiRequest(`/api/v1/admin/subscribers/single/${id}/lock/`, {
      method: "POST",
    });
    return normalizeSingleSubscriber(response?.data || response);
  },

  async unlockSingle(id) {
    const response = await apiRequest(`/api/v1/admin/subscribers/single/${id}/unlock/`, {
      method: "POST",
    });
    return normalizeSingleSubscriber(response?.data || response);
  },

  async listTeams({ search } = {}) {
    const response = await apiRequest("/api/v1/admin/subscribers/teams/", {
      query: { search },
    });
    return normalizeList(response, normalizeTeamSubscriber);
  },

  async retrieveTeam(id) {
    const response = await apiRequest(`/api/v1/admin/subscribers/teams/${id}/`);
    return normalizeTeamSubscriber(response?.data || response);
  },

  async updateTeam(id, payload) {
    const body = {
      email: payload.email,
      status: payload.status,
    };

    if (payload.password) {
      body.password = payload.password;
    }

    const response = await apiRequest(`/api/v1/admin/subscribers/teams/${id}/`, {
      method: "PATCH",
      body,
    });
    return normalizeTeamSubscriber(response?.data || response);
  },

  async deleteTeam(id) {
    return apiRequest(`/api/v1/admin/subscribers/teams/${id}/`, {
      method: "DELETE",
    });
  },

  async lockTeam(id) {
    const response = await apiRequest(`/api/v1/admin/subscribers/teams/${id}/lock/`, {
      method: "POST",
    });
    return normalizeTeamSubscriber(response?.data || response);
  },

  async unlockTeam(id) {
    const response = await apiRequest(`/api/v1/admin/subscribers/teams/${id}/unlock/`, {
      method: "POST",
    });
    return normalizeTeamSubscriber(response?.data || response);
  },
};


