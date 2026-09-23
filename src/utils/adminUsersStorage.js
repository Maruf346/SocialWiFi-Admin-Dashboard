const STORAGE_KEY = "socialwifi_admin_users_list";

export const defaultAdminUsers = [
  {
    id: "USR-1001",
    name: "John Doe",
    email: "Johnd@gmail.com",
    phone: "701-555-1234",
    role: "Super Admin",
    status: "Allowed",
    permissions: ["Admin Users & Permissions", "Admin user list", "Add user"],
  },
  {
    id: "USR-1785",
    name: "Suzy Cue",
    email: "suzy@gmail.com",
    phone: "612-123-4567",
    role: "Fleet Acct Mgmt",
    status: "Allowed",
    permissions: ["User Account Management", "Fleet"],
  },
  {
    id: "USR-1513",
    name: "G. I. Joe",
    email: "gjoe@gmail.com",
    phone: "612-123-4567",
    role: "Customer Support",
    status: "Locked",
    permissions: ["Support Tools", "Support tickets"],
  },
  {
    id: "USR-2549",
    name: "Tom Thumb",
    email: "tom@gmail.com",
    phone: "612-123-4567",
    role: "Revenue Metrics",
    status: "Allowed",
    permissions: ["Reporting & Analytics", "Revenue metrics"],
  },
  {
    id: "USR-8391",
    name: "Jimmy Hendrix",
    email: "jimmy@gmail.com",
    phone: "612-123-4567",
    role: "Subscription Mgmt",
    status: "Allowed",
    permissions: ["Subscription Plans", "Plans list / edit / create"],
  },
  {
    id: "USR-0127",
    name: "Sponge Bob",
    email: "sponge@gmail.com",
    phone: "612-123-4567",
    role: "Audit Log Mgmt",
    status: "Allowed",
    permissions: ["Security, Logging & Compliance", "Audit logs"],
  },
  {
    id: "USR-4567",
    name: "Robin Hood",
    email: "robin@gmail.com",
    phone: "612-123-4567",
    role: "Marketing",
    status: "Allowed",
    permissions: ["Discount Codes / Coupons", "List / manage / create"],
  },
];

export const getAdminUsers = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultAdminUsers));
      return defaultAdminUsers;
    }
    return JSON.parse(data);
  } catch {
    return defaultAdminUsers;
  }
};

export const getAdminUserById = (id) => {
  const users = getAdminUsers();
  return users.find((u) => u.id === id) || null;
};

export const saveAdminUser = (user) => {
  const users = getAdminUsers();
  const existingIndex = users.findIndex((u) => u.id === user.id);
  let updatedUsers;
  if (existingIndex >= 0) {
    updatedUsers = [...users];
    updatedUsers[existingIndex] = { ...updatedUsers[existingIndex], ...user };
  } else {
    updatedUsers = [user, ...users];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));
  window.dispatchEvent(new Event("admin_users_updated"));
  return updatedUsers;
};

export const deleteAdminUsers = (ids) => {
  const users = getAdminUsers();
  const updatedUsers = users.filter((u) => !ids.includes(u.id));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));
  window.dispatchEvent(new Event("admin_users_updated"));
  return updatedUsers;
};

export const updateAdminUsersStatus = (ids, status) => {
  const users = getAdminUsers();
  const updatedUsers = users.map((u) =>
    ids.includes(u.id) ? { ...u, status } : u
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));
  window.dispatchEvent(new Event("admin_users_updated"));
  return updatedUsers;
};

export const permissionGroups = [
  {
    title: "ADMIN USERS & PERMISSIONS",
    items: ["Admin user list", "Add user"],
  },
  // {
  //   title: "SUBSCRIPTION PLANS",
  //   items: ["Plans list / edit / create"],
  // },
  // {
  //   title: "DISCOUNT CODES / COUPONS",
  //   items: ["List / manage / create"],
  // },
  {
    title: "REPORTING & ANALYTICS",
    items: ["Revenue metrics"],
  },
  {
    title: "USER ACCOUNT MANAGEMENT",
    items: ["Single", "Teams", "Fleet"],
  },
  {
    title: "INCOME & EXPENSES",
    items: ["Subscription payments", "Fleet payments", "Expenses"],
  },
  {
    title: "SUPPORT TOOLS",
    items: ["User resources", "Staff resources", "Support tickets"],
  },
  {
    title: "SECURITY, LOGGING & COMPLIANCE",
    items: ["Audit logs", "Data protection"],
  },
];
