import { NavLink, useLocation } from "react-router";

const menuGroups = [
  {
    title: "ADMIN USERS & PERMISSIONS",
    items: [
      { label: "Admin user list", path: "/dashboard/admin-user-list" },
      { label: "Add user", path: "/dashboard/add-user" },
    ],
  },
 
  {
    title: "USER ACCOUNT MANAGEMENT",
    items: [
      { label: "Single", path: "/dashboard/single-user" },
      { label: "Teams", path: "/dashboard/team-users" },
      { label: "Fleet", path: "/dashboard/fleet-user" },
    ],
  },
  {
    title: "INCOME & EXPENSES",
    items: [
      { label: "Subscription payments", path: "/dashboard/subscription-payment" },
      { label: "Fleet payments", path: "/dashboard/fleet-payments" },
      { label: "Expenses", path: "/dashboard/expenses" },
    ],
  },
  {
    title: "REPORTING & ANALYTICS",
    items: [{ label: "Revenue metrics", path: "/dashboard/revenue-metrics" }],
  },
  {
    title: "SUPPORT TOOLS",
    items: [
      { label: "User resources", path: "/dashboard/user-resources" },
      { label: "Staff resources", path: "/dashboard/staff-resources" },
      // { label: "Email system login", path: "#" },
      { label: "Support tickets", path: "/dashboard/support-tickets" },
    ],
  },
  {
    title: "SECURITY, LOGGING & COMPLIANCE",
    items: [
      { label: "Audit logs", path: "/dashboard/audit-log" },
      { label: "Data protection", path: "/dashboard/data-protection" },
    ],
  },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <nav
      aria-label="Dashboard navigation"
      className="w-full overflow-hidden text-[11px] text-gray-600"
    >
      {menuGroups.map((group) => (
        <section key={group.title}>
          <h2 className="bg-[#1d2464] px-3 py-1.5 text-[10px] font-normal text-white">
            {group.title}
          </h2>
          <ul>
            {group.items.map((item) => (
              <li key={item.label}>
                {item.path !== "#" ? (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `block border-b border-white px-3 py-1.5 font-semibold transition-colors ${
                        isActive ||
                        (item.path === "/dashboard/support-tickets" &&
                          location.pathname === "/dashboard/create-ticket") ||
                        (item.path === "/dashboard/admin-user-list" &&
                          location.pathname.startsWith("/dashboard/edit-user/")) ||
                        (item.path === "/dashboard/team-users" &&
                          location.pathname.startsWith(
                            "/dashboard/team-route-history/",
                          )) ||
                        (item.path === "/dashboard/single-user" &&
                          location.pathname.startsWith(
                            "/dashboard/single-route-history/",
                          )) ||
                        (item.path === "/dashboard/fleet-user" &&
                          location.pathname.startsWith(
                            "/dashboard/fleet-route-history/",
                          ))
                          ? "bg-[#ff823d] text-white"
                          : "bg-[#f1f1f1] text-gray-600 hover:bg-gray-200"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ) : (
                  <a
                    href="#"
                    className="block border-b border-white bg-[#f1f1f1] px-3 py-1.5 font-semibold text-gray-600 hover:bg-gray-200"
                  >
                    {item.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </nav>
  );
};

export default Sidebar;
