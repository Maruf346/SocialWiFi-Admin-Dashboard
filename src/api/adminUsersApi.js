import { apiRequest } from "./client";

export const permissionLabelToValue = {
  "ADMIN USERS & PERMISSIONS": "admin_users",
  "Admin user list": "admin_users.list",
  "Add user": "admin_users.add",
  "REPORTING & ANALYTICS": "reporting_analytics",
  "Revenue metrics": "reporting_analytics.revenue_metrics",
  "USER ACCOUNT MANAGEMENT": "user_accounts",
  Single: "user_accounts.single",
  Teams: "user_accounts.teams",
  Fleet: "user_accounts.fleet",
  "INCOME & EXPENSES": "income_expenses",
  "Subscription payments": "income_expenses.subscription_payments",
  "Fleet payments": "income_expenses.fleet_payments",
  Expenses: "income_expenses.expenses",
  "SUPPORT TOOLS": "support_tools",
  "User resources": "support_tools.user_resources",
  "Staff resources": "support_tools.staff_resources",
  "Support tickets": "support_tools.support_tickets",
  "SECURITY, LOGGING & COMPLIANCE": "security_logging_compliance",
  "Audit logs": "security_logging_compliance.audit_logs",
  "Data protection": "security_logging_compliance.data_protection",
};

const permissionValueToLabel = Object.entries(permissionLabelToValue).reduce(
  (acc, [label, value]) => ({ ...acc, [value]: label }),
  {}
);

export const toApiPermissions = (permissions = []) =>
  permissions
    .map((permission) => permissionLabelToValue[permission] || permission)
    .filter(Boolean);

export const toUiPermissions = (permissions = []) =>
  permissions.map((permission) => permissionValueToLabel[permission] || permission);

export const normalizeAdminUser = (user) => ({
  id: user.id,
  name: user.full_name || user.name || user.email || "Unnamed admin",
  email: user.email || "",
  phone: user.phone || "N/A",
  role: user.is_superadmin ? "Super Admin" : user.role || "Staff",
  status:
    user.access_status ||
    user.status ||
    (user.is_active === false ? "Locked" : "Allowed"),
  permissions: toUiPermissions(user.permissions || []),
  isSuperadmin: Boolean(user.is_superadmin),
  isActive: user.is_active !== false,
  raw: user,
});

const normalizeListResponse = (response) => {
  const data = response?.data ?? response?.results ?? response;
  const items = Array.isArray(data) ? data : data?.results || [];
  return {
    items: items.map(normalizeAdminUser),
    count: response?.count ?? data?.count ?? items.length,
  };
};

export const adminUsersApi = {
  async list({ search, ordering } = {}) {
    const response = await apiRequest("/api/v1/admin/users/", {
      query: { search, ordering },
    });
    return normalizeListResponse(response);
  },

  async retrieve(id) {
    const response = await apiRequest(`/api/v1/admin/users/${id}/`);
    return normalizeAdminUser(response?.data || response);
  },

  async create(user) {
    const response = await apiRequest("/api/v1/admin/users/", {
      method: "POST",
      body: {
        full_name: user.name,
        email: user.email,
        phone: user.phone || null,
        password: user.password,
        is_superadmin: user.isSuperadmin,
        permissions: toApiPermissions(user.permissions),
      },
    });
    return normalizeAdminUser(response?.data || response);
  },

  async update(id, user) {
    const body = {
      full_name: user.name,
      email: user.email,
      phone: user.phone || null,
      is_superadmin: user.isSuperadmin,
      permissions: toApiPermissions(user.permissions),
    };

    if (user.password) {
      body.password = user.password;
    }

    const response = await apiRequest(`/api/v1/admin/users/${id}/`, {
      method: "PATCH",
      body,
    });
    return normalizeAdminUser(response?.data || response);
  },

  async delete(id) {
    return apiRequest(`/api/v1/admin/users/${id}/`, { method: "DELETE" });
  },

  async bulkDelete(ids) {
    return apiRequest("/api/v1/admin/users/bulk-delete/", {
      method: "POST",
      body: { admin_user_ids: ids.map(Number) },
    });
  },

  async lock(id) {
    const response = await apiRequest(`/api/v1/admin/users/${id}/lock/`, {
      method: "POST",
    });
    return normalizeAdminUser(response?.data || response);
  },

  async unlock(id) {
    const response = await apiRequest(`/api/v1/admin/users/${id}/unlock/`, {
      method: "POST",
    });
    return normalizeAdminUser(response?.data || response);
  },
};
