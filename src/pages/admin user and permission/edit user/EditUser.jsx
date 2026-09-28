import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { permissionGroups } from "../../../utils/adminUsersStorage";
import { adminUsersApi } from "../../../api/adminUsersApi";

const EditUser = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
  });
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [status, setStatus] = useState("Allowed");
  const [toastMessage, setToastMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2500);
  };

  const loadUser = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const user = await adminUsersApi.retrieve(userId);
      setCurrentUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone === "N/A" ? "" : user.phone,
        role: user.role,
      });
      setSelectedPermissions(user.permissions || []);
      setStatus(user.status || "Allowed");
    } catch (error) {
      setErrorMessage(error.message || "Unable to load admin user.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUser();
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggleGroup = (group) => {
    const allGroupItems = [group.title, ...group.items];
    const hasAll = allGroupItems.every((item) => selectedPermissions.includes(item));

    if (hasAll) {
      setSelectedPermissions((prev) => prev.filter((item) => !allGroupItems.includes(item)));
    } else {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...allGroupItems])));
    }
  };

  const handleToggleItem = (item) => {
    setSelectedPermissions((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSaving(true);

    try {
      await adminUsersApi.update(userId, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        isSuperadmin: formData.role.toLowerCase().includes("super"),
        permissions: selectedPermissions,
      });
      showToast("Admin user details updated");
      setTimeout(() => navigate("/dashboard/admin-user-list"), 500);
    } catch (error) {
      setErrorMessage(error.message || "Unable to update admin user.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLock = async () => {
    setErrorMessage("");
    setIsSaving(true);
    try {
      const user = await adminUsersApi.lock(userId);
      setStatus(user.status || "Locked");
      showToast("Admin user locked");
      setTimeout(() => navigate("/dashboard/admin-user-list"), 500);
    } catch (error) {
      setErrorMessage(error.message || "Unable to lock admin user.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnlock = async () => {
    setErrorMessage("");
    setIsSaving(true);
    try {
      const user = await adminUsersApi.unlock(userId);
      setStatus(user.status || "Allowed");
      showToast("Admin user unlocked");
      setTimeout(() => navigate("/dashboard/admin-user-list"), 500);
    } catch (error) {
      setErrorMessage(error.message || "Unable to unlock admin user.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setErrorMessage("");
    setIsSaving(true);
    try {
      await adminUsersApi.delete(userId);
      showToast("Admin user deleted");
      setTimeout(() => navigate("/dashboard/admin-user-list"), 500);
    } catch (error) {
      setErrorMessage(error.message || "Unable to delete admin user.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-full bg-white px-2 py-3 text-[12px] text-[#666] md:px-8 md:py-6">
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 rounded bg-[#151d56] px-4 py-2 text-sm text-white shadow-lg transition-all">
          {toastMessage}
        </div>
      )}

      <div className="mx-auto mb-8 flex max-w-5xl items-center justify-between">
        <h1 className="text-xl font-normal text-[#999] md:text-2xl">
          Edit admin user
        </h1>
        <div className="text-xs">
          Status:{" "}
          <span className={`font-semibold ${status === "Locked" ? "text-[#b40000]" : "text-green-600"}`}>
            {status}
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="mx-auto mb-4 max-w-5xl rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <div className="mx-auto max-w-5xl rounded border border-[#eee] bg-[#fafafa] p-6 text-center text-[#888]">
          Loading admin user...
        </div>
      ) : !currentUser ? (
        <div className="mx-auto max-w-5xl rounded border border-[#eee] bg-[#fafafa] p-6 text-center text-[#888]">
          Admin user not found.
        </div>
      ) : (
        <form className="mx-auto max-w-5xl" onSubmit={handleSave}>
          <div className="space-y-2">
            <div className="flex items-center border-b border-[#e5e5e5] pb-2">
              <label className="w-36 px-2 text-xs font-semibold text-[#555]">Name:</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                aria-label="Name"
                className="h-7 w-60 rounded border border-[#d5d5d5] px-2 text-xs text-gray-700 outline-none focus:border-[#1d2464]"
              />
            </div>

            <div className="flex items-center border-b border-[#e5e5e5] pb-2">
              <label className="w-36 px-2 text-xs font-semibold text-[#555]">Email:</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                aria-label="Email"
                className="h-7 w-60 rounded border border-[#d5d5d5] px-2 text-xs text-gray-700 outline-none focus:border-[#1d2464]"
              />
            </div>

            <div className="flex items-center border-b border-[#e5e5e5] pb-2">
              <label className="w-36 px-2 text-xs font-semibold text-[#555]">Phone:</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                aria-label="Phone"
                className="h-7 w-60 rounded border border-[#d5d5d5] px-2 text-xs text-gray-700 outline-none focus:border-[#1d2464]"
              />
            </div>

            <div className="flex items-center border-b border-[#e5e5e5] pb-2">
              <label className="w-36 px-2 text-xs font-semibold text-[#555]">Role:</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                aria-label="Role"
                className="h-7 w-60 rounded border border-[#d5d5d5] px-2 text-xs text-gray-700 outline-none focus:border-[#1d2464]"
              />
            </div>
          </div>

          <fieldset className="mt-4 flex border-b border-[#e5e5e5] py-4">
            <legend className="w-36 px-2 text-xs font-semibold text-[#555]">Permissions:</legend>
            <div className="grid flex-1 grid-cols-1 gap-x-12 gap-y-4 md:grid-cols-2">
              {permissionGroups.map((group) => {
                const allGroupItems = [group.title, ...group.items];
                const isGroupChecked = allGroupItems.every((item) => selectedPermissions.includes(item));
                return (
                  <div key={group.title} className="space-y-1">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-[#444] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isGroupChecked}
                        onChange={() => handleToggleGroup(group)}
                        className="accent-[#ff823d] cursor-pointer"
                      />
                      {group.title}
                    </label>
                    <div className="ml-5 space-y-1">
                      {group.items.map((item) => (
                        <label key={item} className="flex items-center gap-1.5 text-xs text-[#666] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(item)}
                            onChange={() => handleToggleItem(item)}
                            className="accent-[#ff823d] cursor-pointer"
                          />
                          {item}
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-3">
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded bg-[#1d2464] px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#151a4a] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                {isSaving ? "SAVING..." : "SAVE"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard/admin-user-list")}
                className="rounded bg-[#1d2464] px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#151a4a] cursor-pointer"
              >
                CANCEL
              </button>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleLock}
                disabled={isSaving}
                className="rounded bg-[#b40000] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#900000] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                LOCK
              </button>
              <button
                type="button"
                onClick={handleUnlock}
                disabled={isSaving}
                className="rounded bg-[#b40000] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#900000] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                UNLOCK
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSaving}
                className="rounded bg-[#b40000] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#900000] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                DELETE
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditUser;


