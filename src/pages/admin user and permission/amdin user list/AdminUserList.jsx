import { useState } from "react";
import { useNavigate } from "react-router";

const initialAdminUsers = [
  { name: "John Doe", role: "Super Admin", id: "USR-1001", status: "Allowed" },
  { name: "Suzy Cue", role: "Fleet Acct Mgmt", id: "USR-1785", status: "Allowed" },
  { name: "G. I. Joe", role: "Customer Support", id: "USR-1513", status: "Locked" },
  { name: "Tom Thumb", role: "Revenue Metrics", id: "USR-2549", status: "Allowed" },
  { name: "Jimmy Hendrix", role: "Subscription Mgmt", id: "USR-8391", status: "Allowed" },
  { name: "Sponge Bob", role: "Audit Log Mgmt", id: "USR-0127", status: "Allowed" },
  { name: "Robin Hood", role: "Marketing", id: "USR-4567", status: "Allowed" },
];

const AdminUserList = () => {
  const [users, setUsers] = useState(initialAdminUsers);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [action, setAction] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const navigate = useNavigate();

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2500);
  };

  const toggleUser = (userId) => {
    setSelectedUsers((currentUsers) =>
      currentUsers.includes(userId)
        ? currentUsers.filter((selectedId) => selectedId !== userId)
        : [...currentUsers, userId]
    );
  };

  const toggleAllUsers = (checked) => {
    setSelectedUsers(checked ? users.map((user) => user.id) : []);
  };

  const handleApplyAction = () => {
    if (!action) return;
    if (selectedUsers.length === 0) {
      showToast("No users selected");
      return;
    }

    if (action === "delete") {
      setUsers((prev) => prev.filter((u) => !selectedUsers.includes(u.id)));
      setSelectedUsers([]);
      showToast("Selected users deleted");
    } else if (action === "lock") {
      setUsers((prev) =>
        prev.map((u) =>
          selectedUsers.includes(u.id) ? { ...u, status: "Locked" } : u
        )
      );
      showToast("Selected users locked");
    } else if (action === "unlock") {
      setUsers((prev) =>
        prev.map((u) =>
          selectedUsers.includes(u.id) ? { ...u, status: "Allowed" } : u
        )
      );
      showToast("Selected users unlocked");
    }
  };

  return (
    <div className="min-h-full bg-white px-2 py-3 text-[12px] text-[#666] md:px-8 md:py-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 rounded bg-[#151d56] px-4 py-2 text-sm text-white shadow-lg transition-all">
          {toastMessage}
        </div>
      )}

      {/* Top Header Row */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-normal text-[#999] md:text-2xl">
          Admin user list
        </h1>
        <button
          type="button"
          onClick={() => navigate("/dashboard/add-user")}
          className="flex items-center gap-1.5 rounded-full bg-[#666] px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#555] cursor-pointer"
        >
          <span>ADD ADMIN USER</span>
          <span className="text-sm font-bold leading-none">+</span>
        </button>
      </div>

      {/* Action Row */}
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-[#666]">
        <label htmlFor="admin-action" className="text-[#666]">
          Action:
        </label>
        <select
          id="admin-action"
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="h-6 w-44 border border-[#ccc] bg-white px-1.5 text-xs text-[#555] outline-none"
        >
          <option value="">---------</option>
          <option value="delete">Delete selected</option>
          <option value="lock">Lock selected</option>
          <option value="unlock">Unlock selected</option>
        </select>
        <button
          type="button"
          onClick={handleApplyAction}
          className="h-6 rounded-xs border border-[#ccc] bg-[#efefef] px-2.5 text-xs text-[#333] hover:bg-[#e2e2e2] active:bg-[#d5d5d5] cursor-pointer"
        >
          Go
        </button>
        <span className="ml-2 text-[#777]">
          {selectedUsers.length} of {users.length} selected
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-left text-xs">
          <thead>
            <tr className="h-8 border-b border-[#eee] bg-[#f9f9f9] text-[11px] font-semibold uppercase text-[#777]">
              <th className="w-8 px-3 text-left">
                <input
                  type="checkbox"
                  checked={
                    users.length > 0 && selectedUsers.length === users.length
                  }
                  onChange={(e) => toggleAllUsers(e.target.checked)}
                  className="cursor-pointer accent-[#ff823d]"
                  aria-label="Select all admin users"
                />
              </th>
              <th className="px-3 py-1 font-semibold tracking-wider">
                ADMIN USERS
              </th>
              <th className="px-3 py-1 font-semibold tracking-wider">
                USER ROLE
              </th>
              <th className="px-3 py-1 font-semibold tracking-wider">
                USER ID
              </th>
              <th className="px-3 py-1 font-semibold tracking-wider">
                ACCESS STATUS
              </th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[#888]">
                  No admin users found.
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const isSelected = selectedUsers.includes(user.id);
                return (
                  <tr
                    key={user.id}
                    className={`h-8 border-b border-[#eee] transition-colors ${
                      isSelected
                        ? "bg-[#fff6f0]"
                        : "even:bg-[#fbfbfb] hover:bg-[#f7f7f7]"
                    }`}
                  >
                    <td className="px-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleUser(user.id)}
                        className="cursor-pointer accent-[#ff823d]"
                        aria-label={`Select ${user.name}`}
                      />
                    </td>
                    <td className="px-3 py-1">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/dashboard/edit-user/${user.id}`)
                        }
                        className="text-[#555] underline underline-offset-2 hover:text-[#ff823d] cursor-pointer"
                      >
                        {user.name}
                      </button>
                    </td>
                    <td className="px-3 py-1 text-[#666]">{user.role}</td>
                    <td className="px-3 py-1 text-[#666]">{user.id}</td>
                    <td className="px-3 py-1 text-[#666]">{user.status}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Count & Border */}
      <div className="border-b border-[#eee] py-3 text-xs text-[#777]">
        <p>{users.length} admin users</p>
      </div>
    </div>
  );
};

export default AdminUserList;
