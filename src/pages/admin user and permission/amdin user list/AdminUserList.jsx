import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { adminUsersApi } from "../../../api/adminUsersApi";

const PAGE_SIZE = 10;

const AdminUserList = () => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [action, setAction] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2500);
  };

  const loadUsers = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await adminUsersApi.list({ search });
      setUsers(response.items);
      setSelectedUsers([]);
      setCurrentPage(1);
    } catch (error) {
      setErrorMessage(error.message || "Unable to load admin users.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUsers();
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredUsers = useMemo(() => {
    const term = search.toLowerCase();
    if (!term) return users;
    return users.filter((user) =>
      `${user.name} ${user.email} ${user.role} ${user.id}`.toLowerCase().includes(term)
    );
  }, [users, search]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (safeCurrentPage - 1) * PAGE_SIZE;
  const visibleUsers = filteredUsers.slice(pageStart, pageStart + PAGE_SIZE);

  const toggleUser = (userId) => {
    setSelectedUsers((currentUsers) =>
      currentUsers.includes(userId)
        ? currentUsers.filter((selectedId) => selectedId !== userId)
        : [...currentUsers, userId]
    );
  };

  const toggleAllUsers = (checked) => {
    const visibleIds = visibleUsers.map((user) => user.id);
    setSelectedUsers((current) =>
      checked
        ? Array.from(new Set([...current, ...visibleIds]))
        : current.filter((id) => !visibleIds.includes(id))
    );
  };

  const handleSearch = () => {
    setSearch(searchInput.trim());
  };

  const handleApplyAction = async () => {
    if (!action) {
      showToast("Please select an action from the dropdown");
      return;
    }
    if (selectedUsers.length === 0) {
      showToast("No users selected");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    try {
      if (action === "delete") {
        await adminUsersApi.bulkDelete(selectedUsers);
        showToast("Selected users deleted successfully");
      } else if (action === "lock") {
        await Promise.all(selectedUsers.map((id) => adminUsersApi.lock(id)));
        showToast("Selected users locked successfully");
      } else if (action === "unlock") {
        await Promise.all(selectedUsers.map((id) => adminUsersApi.unlock(id)));
        showToast("Selected users unlocked successfully");
      }
      setAction("");
      await loadUsers();
    } catch (error) {
      setErrorMessage(error.message || "Unable to apply selected action.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-white px-2 py-3 text-[12px] text-[#666] md:px-8 md:py-6">
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 rounded bg-[#151d56] px-4 py-2 text-sm text-white shadow-lg transition-all">
          {toastMessage}
        </div>
      )}

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

      {errorMessage && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {errorMessage}
        </div>
      )}

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
          disabled={isLoading}
          className="h-6 rounded-xs border border-[#ccc] bg-[#efefef] px-2.5 text-xs text-[#333] hover:bg-[#e2e2e2] active:bg-[#d5d5d5] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        >
          Go
        </button>
        <span className="ml-2 text-[#777]">
          {selectedUsers.length} of {filteredUsers.length} selected
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <span>Search:</span>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="h-6 w-44 border border-[#ccc] px-2 text-xs outline-none"
          />
          <button
            type="button"
            onClick={handleSearch}
            className="h-6 rounded-xs border border-[#ccc] bg-[#efefef] px-2.5 text-xs text-[#333] hover:bg-[#e2e2e2] cursor-pointer"
          >
            Go
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchInput("");
              setSearch("");
            }}
            className="h-6 rounded-xs border border-[#ccc] bg-[#efefef] px-2.5 text-xs text-[#333] hover:bg-[#e2e2e2] cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-left text-xs">
          <thead>
            <tr className="h-8 border-b border-[#eee] bg-[#f9f9f9] text-[11px] font-semibold uppercase text-[#777]">
              <th className="w-8 px-3 text-left">
                <input
                  type="checkbox"
                  checked={
                    visibleUsers.length > 0 &&
                    visibleUsers.every((user) => selectedUsers.includes(user.id))
                  }
                  onChange={(e) => toggleAllUsers(e.target.checked)}
                  className="cursor-pointer accent-[#ff823d]"
                  aria-label="Select all visible admin users"
                />
              </th>
              <th className="px-3 py-1 font-semibold tracking-wider">ADMIN USERS</th>
              <th className="px-3 py-1 font-semibold tracking-wider">USER ROLE</th>
              <th className="px-3 py-1 font-semibold tracking-wider">USER ID</th>
              <th className="px-3 py-1 font-semibold tracking-wider">ACCESS STATUS</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[#888]">
                  Loading admin users...
                </td>
              </tr>
            ) : visibleUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[#888]">
                  No admin users found.
                </td>
              </tr>
            ) : (
              visibleUsers.map((user) => {
                const isSelected = selectedUsers.includes(user.id);
                return (
                  <tr
                    key={user.id}
                    className={`h-8 border-b border-[#eee] transition-colors ${
                      isSelected ? "bg-[#fff6f0]" : "even:bg-[#fbfbfb] hover:bg-[#f7f7f7]"
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
                        onClick={() => navigate(`/dashboard/edit-user/${user.id}`)}
                        className="text-[#555] underline underline-offset-2 hover:text-[#ff823d] cursor-pointer"
                      >
                        {user.name}
                      </button>
                    </td>
                    <td className="px-3 py-1 text-[#666]">{user.role}</td>
                    <td className="px-3 py-1 text-[#666]">{user.id}</td>
                    <td className="px-3 py-1 text-[#666]">
                      <span
                        className={
                          user.status === "Locked" || user.isActive === false
                            ? "font-semibold text-[#b40000]"
                            : "text-[#666]"
                        }
                      >
                        {user.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eee] py-3 text-xs text-[#777]">
        <p>{filteredUsers.length} admin users</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={safeCurrentPage <= 1}
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            className="underline disabled:cursor-not-allowed disabled:text-[#bbb] cursor-pointer"
          >
            Previous
          </button>
          <span>
            Page {safeCurrentPage} of {totalPages}
          </span>
          <button
            type="button"
            disabled={safeCurrentPage >= totalPages}
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            className="underline disabled:cursor-not-allowed disabled:text-[#bbb] cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUserList;


