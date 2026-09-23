import { useState } from "react";
import { useNavigate } from "react-router";
import {
  saveAdminUser,
  permissionGroups,
} from "../../../utils/adminUsersStorage";

const AddUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
  });
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2500);
  };

  const handleToggleGroup = (group) => {
    const allGroupItems = [group.title, ...group.items];
    const hasAll = allGroupItems.every((item) =>
      selectedPermissions.includes(item)
    );

    if (hasAll) {
      setSelectedPermissions((prev) =>
        prev.filter((item) => !allGroupItems.includes(item))
      );
    } else {
      setSelectedPermissions((prev) =>
        Array.from(new Set([...prev, ...allGroupItems]))
      );
    }
  };

  const handleToggleItem = (item) => {
    setSelectedPermissions((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      showToast("Please enter at least Name and Email");
      return;
    }

    const newId = `USR-${Math.floor(1000 + Math.random() * 9000)}`;
    const newAdmin = {
      id: newId,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || "N/A",
      role: formData.role.trim() || "Staff",
      status: "Allowed",
      permissions: selectedPermissions,
    };

    saveAdminUser(newAdmin);
    navigate("/dashboard/admin-user-list");
  };

  return (
    <div className="min-h-full bg-white px-2 py-3 text-[12px] text-[#666] md:px-10 md:py-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 rounded bg-[#151d56] px-4 py-2 text-sm text-white shadow-lg transition-all">
          {toastMessage}
        </div>
      )}

      <h1 className="mx-auto mb-8 max-w-5xl text-xl font-normal text-[#999] md:text-2xl">
        Add admin user
      </h1>

      <form className="mx-auto max-w-5xl" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <div className="flex items-center border-b border-[#e5e5e5] pb-2">
            <label className="w-36 px-2 text-xs font-semibold text-[#555]">
              Name:
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Eric Little"
              aria-label="Name"
              className="h-7 w-60 rounded border border-[#d5d5d5] px-2 text-xs text-gray-700 outline-none focus:border-[#1d2464]"
            />
          </div>

          <div className="flex items-center border-b border-[#e5e5e5] pb-2">
            <label className="w-36 px-2 text-xs font-semibold text-[#555]">
              Email:
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="el2609@gmail.com"
              aria-label="Email"
              className="h-7 w-60 rounded border border-[#d5d5d5] px-2 text-xs text-gray-700 outline-none focus:border-[#1d2464]"
            />
          </div>

          <div className="flex items-center border-b border-[#e5e5e5] pb-2">
            <label className="w-36 px-2 text-xs font-semibold text-[#555]">
              Phone:
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="612-123-4567"
              aria-label="Phone"
              className="h-7 w-60 rounded border border-[#d5d5d5] px-2 text-xs text-gray-700 outline-none focus:border-[#1d2464]"
            />
          </div>

          <div className="flex items-center border-b border-[#e5e5e5] pb-2">
            <label className="w-36 px-2 text-xs font-semibold text-[#555]">
              Role:
            </label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              placeholder="Super Admin"
              aria-label="Role"
              className="h-7 w-60 rounded border border-[#d5d5d5] px-2 text-xs text-gray-700 outline-none focus:border-[#1d2464]"
            />
          </div>
        </div>

        {/* Permissions Section */}
        <fieldset className="flex border-b border-[#e5e5e5] py-4">
          <legend className="w-36 px-2 text-xs font-semibold text-[#555]">
            Permissions:
          </legend>
          <div className="grid flex-1 grid-cols-1 gap-x-12 gap-y-4 md:grid-cols-2">
            {permissionGroups.map((group) => {
              const allGroupItems = [group.title, ...group.items];
              const isGroupChecked = allGroupItems.every((item) =>
                selectedPermissions.includes(item)
              );
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
                      <label
                        key={item}
                        className="flex items-center gap-1.5 text-xs text-[#666] cursor-pointer"
                      >
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

        {/* Action Buttons */}
        <div className="mt-6 flex gap-2 rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-3">
          <button
            type="submit"
            className="rounded bg-[#1d2464] px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#151a4a] cursor-pointer"
          >
            ADD
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard/admin-user-list")}
            className="rounded bg-[#1d2464] px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#151a4a] cursor-pointer"
          >
            CANCEL
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUser;
