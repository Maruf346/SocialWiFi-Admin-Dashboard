import { NavLink, useLocation } from "react-router";
import { authStorage } from "../../utils/authStorage";
import { getVisibleMenuGroups } from "../../utils/permissions";

const Sidebar = () => {
  const location = useLocation();
  const user = authStorage.getUser();
  const menuGroups = getVisibleMenuGroups(user);

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
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `block border-b border-white px-3 py-1.5 font-semibold transition-colors ${
                      isActive ||
                      (item.path === "/dashboard/support-tickets" &&
                        (location.pathname === "/dashboard/create-ticket" ||
                          location.pathname.startsWith("/dashboard/support-tickets/"))) ||
                      (item.path === "/dashboard/admin-user-list" &&
                        location.pathname.startsWith("/dashboard/edit-user/")) ||
                      (item.path === "/dashboard/team-users" &&
                        (location.pathname.startsWith("/dashboard/team-route-history/") ||
                          location.pathname.startsWith("/dashboard/team-manager/"))) ||
                      (item.path === "/dashboard/single-user" &&
                        location.pathname.startsWith("/dashboard/single-route-history/")) ||
                      (item.path === "/dashboard/fleet-user" &&
                        location.pathname.startsWith("/dashboard/fleet-route-history/"))
                        ? "bg-[#ff823d] text-white"
                        : "bg-[#f1f1f1] text-gray-600 hover:bg-gray-200"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </nav>
  );
};

export default Sidebar;