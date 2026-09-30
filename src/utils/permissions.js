import { authStorage } from "./authStorage";

export const can = (permission, user = authStorage.getUser()) => {
  if (!permission) return true;
  if (!user) return false;
  if (user.isSuperadmin || user.is_superadmin) return true;
  const permissions = user.permissions || [];
  return permissions.includes(permission);
};

export const canAny = (permissions = [], user = authStorage.getUser()) =>
  permissions.some((permission) => can(permission, user));

export const dashboardMenuGroups = [
  {
    title: "ADMIN USERS & PERMISSIONS",
    permission: "admin_users",
    items: [
      {
        label: "Admin user list",
        path: "/dashboard/admin-user-list",
        permissions: ["admin_users.list", "admin_users"],
      },
      {
        label: "Add user",
        path: "/dashboard/add-user",
        permissions: ["admin_users.add", "admin_users"],
      },
    ],
  },
  {
    title: "USER ACCOUNT MANAGEMENT",
    permission: "user_accounts",
    items: [
      {
        label: "Single",
        path: "/dashboard/single-user",
        permissions: ["user_accounts.single", "user_accounts"],
      },
      {
        label: "Teams",
        path: "/dashboard/team-users",
        permissions: ["user_accounts.teams", "user_accounts"],
      },
      {
        label: "Fleet",
        path: "/dashboard/fleet-user",
        permissions: ["user_accounts.fleet", "user_accounts"],
      },
    ],
  },
  {
    title: "INCOME & EXPENSES",
    permission: "income_expenses",
    items: [
      {
        label: "Subscription payments",
        path: "/dashboard/subscription-payment",
        permissions: ["income_expenses.subscription_payments", "income_expenses"],
      },
      {
        label: "Fleet payments",
        path: "/dashboard/fleet-payments",
        permissions: ["income_expenses.fleet_payments", "income_expenses"],
      },
      {
        label: "Expenses",
        path: "/dashboard/expenses",
        permissions: ["income_expenses.expenses", "income_expenses"],
      },
    ],
  },
  {
    title: "REPORTING & ANALYTICS",
    permission: "reporting_analytics",
    items: [
      {
        label: "Revenue metrics",
        path: "/dashboard/revenue-metrics",
        permissions: ["reporting_analytics.revenue_metrics", "reporting_analytics"],
      },
    ],
  },
  {
    title: "SUPPORT TOOLS",
    permission: "support_tools",
    items: [
      {
        label: "User resources",
        path: "/dashboard/user-resources",
        permissions: ["support_tools.user_resources", "support_tools"],
      },
      {
        label: "Staff resources",
        path: "/dashboard/staff-resources",
        permissions: ["support_tools.staff_resources", "support_tools"],
      },
      {
        label: "Support tickets",
        path: "/dashboard/support-tickets",
        permissions: ["support_tools.support_tickets", "support_tools"],
      },
    ],
  },
  {
    title: "SECURITY, LOGGING & COMPLIANCE",
    permission: "security_logging_compliance",
    items: [
      {
        label: "Audit logs",
        path: "/dashboard/audit-log",
        permissions: [
          "security_logging_compliance.audit_logs",
          "security_logging_compliance",
        ],
      },
      {
        label: "Data protection",
        path: "/dashboard/data-protection",
        permissions: [
          "security_logging_compliance.data_protection",
          "security_logging_compliance",
        ],
      },
    ],
  },
];

export const getVisibleMenuGroups = (user = authStorage.getUser()) =>
  dashboardMenuGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canAny(item.permissions, user)),
    }))
    .filter((group) => can(group.permission, user) || group.items.length > 0)
    .filter((group) => group.items.length > 0);

const routePermissionRules = [
  { match: /^\/dashboard\/admin-user-list\/?$/, permissions: ["admin_users.list", "admin_users"] },
  { match: /^\/dashboard\/add-user\/?$/, permissions: ["admin_users.add", "admin_users"] },
  { match: /^\/dashboard\/edit-user\//, permissions: ["admin_users.list", "admin_users"] },
  { match: /^\/dashboard\/single-user\/?$/, permissions: ["user_accounts.single", "user_accounts"] },
  { match: /^\/dashboard\/single-route-history\//, permissions: ["user_accounts.single", "user_accounts"] },
  { match: /^\/dashboard\/team-users\/?$/, permissions: ["user_accounts.teams", "user_accounts"] },
  { match: /^\/dashboard\/team-manager\//, permissions: ["user_accounts.teams", "user_accounts"] },
  { match: /^\/dashboard\/team-route-history\//, permissions: ["user_accounts.teams", "user_accounts"] },
  { match: /^\/dashboard\/fleet-user\/?$/, permissions: ["user_accounts.fleet", "user_accounts"] },
  { match: /^\/dashboard\/fleet-route-history\//, permissions: ["user_accounts.fleet", "user_accounts"] },
  {
    match: /^\/dashboard\/subscription-payment\/?$/,
    permissions: ["income_expenses.subscription_payments", "income_expenses"],
  },
  {
    match: /^\/dashboard\/fleet-payments\/?$/,
    permissions: ["income_expenses.fleet_payments", "income_expenses"],
  },
  { match: /^\/dashboard\/expenses\/?$/, permissions: ["income_expenses.expenses", "income_expenses"] },
  {
    match: /^\/dashboard\/revenue-metrics\/?$/,
    permissions: ["reporting_analytics.revenue_metrics", "reporting_analytics"],
  },
  {
    match: /^\/dashboard\/user-resources\/?$/,
    permissions: ["support_tools.user_resources", "support_tools"],
  },
  {
    match: /^\/dashboard\/staff-resources\/?$/,
    permissions: ["support_tools.staff_resources", "support_tools"],
  },
  {
    match: /^\/dashboard\/support-tickets/,
    permissions: ["support_tools.support_tickets", "support_tools"],
  },
  {
    match: /^\/dashboard\/create-ticket\/?$/,
    permissions: ["support_tools.support_tickets", "support_tools"],
  },
  {
    match: /^\/dashboard\/audit-log\/?$/,
    permissions: [
      "security_logging_compliance.audit_logs",
      "security_logging_compliance",
    ],
  },
  {
    match: /^\/dashboard\/data-protection\/?$/,
    permissions: [
      "security_logging_compliance.data_protection",
      "security_logging_compliance",
    ],
  },
];

export const canAccessPath = (pathname, user = authStorage.getUser()) => {
  if (pathname === "/dashboard" || pathname === "/dashboard/") return true;
  const rule = routePermissionRules.find((item) => item.match.test(pathname));
  if (!rule) return true;
  return canAny(rule.permissions, user);
};
