import { useState, useMemo } from "react";
import { History, Pencil, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router";

const initialSingleUsers = [
  {
    id: 1,
    name: "Ethan Caldwell",
    email: "ethancaldwell@gmail.com",
    plan: "Yearly",
    signUpDate: "01/15/2025",
    nextPayment: "01/15/2027",
    lastActive: "09/22/2026 14:15",
    status: "Active",
    price: "$99.99/yr",
    discountPeriod: "0",
    discountAmount: "0",
    state: "Texas",
    platform: "iOS",
    locked: "No",
    notes: "",
  },
  {
    id: 2,
    name: "Marcus Bennett",
    email: "marcusbennett@yahoo.com",
    plan: "Monthly",
    signUpDate: "02/10/2025",
    nextPayment: "10/10/2026",
    lastActive: "09/21/2026 09:30",
    status: "Active",
    price: "$9.99/mo",
    discountPeriod: "1 month",
    discountAmount: "$4.99",
    state: "California",
    platform: "Android",
    locked: "No",
    notes: "Requested billing receipt for August.",
  },
  {
    id: 3,
    name: "Daniel Reed",
    email: "danielreed@outlook.com",
    plan: "Monthly",
    signUpDate: "03/05/2025",
    nextPayment: "10/05/2026",
    lastActive: "09/22/2026 11:20",
    status: "Active",
    price: "$9.99/mo",
    discountPeriod: "0",
    discountAmount: "0",
    state: "Florida",
    platform: "iOS",
    locked: "No",
    notes: "",
  },
  {
    id: 4,
    name: "Nathan Parker",
    email: "nathanparker@hotmail.com",
    plan: "Monthly",
    signUpDate: "03/18/2025",
    nextPayment: "10/18/2026",
    lastActive: "09/20/2026 16:45",
    status: "Active",
    price: "$9.99/mo",
    discountPeriod: "0",
    discountAmount: "0",
    state: "Ohio",
    platform: "Android",
    locked: "No",
    notes: "",
  },
  {
    id: 5,
    name: "Lucas Foster",
    email: "lucasfoster@icloud.com",
    plan: "Yearly",
    signUpDate: "04/02/2025",
    nextPayment: "04/02/2027",
    lastActive: "09/19/2026 17:10",
    status: "Active",
    price: "$99.99/yr",
    discountPeriod: "0",
    discountAmount: "0",
    state: "Illinois",
    platform: "iOS",
    locked: "No",
    notes: "",
  },
  {
    id: 6,
    name: "Adrian Collins",
    email: "adriancollins@gmail.com",
    plan: "Yearly",
    signUpDate: "04/14/2025",
    nextPayment: "04/14/2027",
    lastActive: "09/22/2026 08:50",
    status: "Active",
    price: "$99.99/yr",
    discountPeriod: "0",
    discountAmount: "0",
    state: "Georgia",
    platform: "iOS",
    locked: "No",
    notes: "",
  },
  {
    id: 7,
    name: "Caleb Brooks",
    email: "calebbrooks@yahoo.com",
    plan: "Monthly",
    signUpDate: "05/01/2025",
    nextPayment: "10/01/2026",
    lastActive: "09/21/2026 13:25",
    status: "Active",
    price: "$9.99/mo",
    discountPeriod: "0",
    discountAmount: "0",
    state: "Michigan",
    platform: "Android",
    locked: "No",
    notes: "",
  },
  {
    id: 8,
    name: "Julian Ramirez",
    email: "julianramirez@outlook.com",
    plan: "Yearly",
    signUpDate: "05/19/2025",
    nextPayment: "05/19/2027",
    lastActive: "09/22/2026 15:40",
    status: "Active",
    price: "$99.99/yr",
    discountPeriod: "0",
    discountAmount: "0",
    state: "Arizona",
    platform: "iOS",
    locked: "No",
    notes: "",
  },
  {
    id: 9,
    name: "Owen Mitchell",
    email: "owenmitchell@hotmail.com",
    plan: "Monthly",
    signUpDate: "06/11/2025",
    nextPayment: "10/11/2026",
    lastActive: "09/22/2026 19:05",
    status: "Active",
    price: "$9.99/mo",
    discountPeriod: "0",
    discountAmount: "0",
    state: "Texas",
    platform: "iOS",
    locked: "No",
    notes: "",
  },
  {
    id: 10,
    name: "Miles Sullivan",
    email: "milessullivan@icloud.com",
    plan: "Monthly",
    signUpDate: "06/25/2025",
    nextPayment: "10/25/2026",
    lastActive: "09/20/2026 10:15",
    status: "Active",
    price: "$9.99/mo",
    discountPeriod: "0",
    discountAmount: "0",
    state: "North Carolina",
    platform: "Android",
    locked: "No",
    notes: "",
  },
  {
    id: 11,
    name: "Simon Turner",
    email: "simonturner@gmail.com",
    plan: "Monthly",
    signUpDate: "07/04/2025",
    nextPayment: "10/04/2026",
    lastActive: "09/21/2026 12:00",
    status: "Active",
    price: "$9.99/mo",
    discountPeriod: "0",
    discountAmount: "0",
    state: "Pennsylvania",
    platform: "iOS",
    locked: "No",
    notes: "",
  },
  {
    id: 12,
    name: "Henry Morgan",
    email: "henrymorgan@yahoo.com",
    plan: "Monthly",
    signUpDate: "07/16/2025",
    nextPayment: "10/16/2026",
    lastActive: "09/22/2026 07:45",
    status: "Active",
    price: "$9.99/mo",
    discountPeriod: "0",
    discountAmount: "0",
    state: "Virginia",
    platform: "Android",
    locked: "No",
    notes: "",
  },
  {
    id: 13,
    name: "Noah Harrison",
    email: "noahharrison@outlook.com",
    plan: "Monthly",
    signUpDate: "07/28/2025",
    nextPayment: "10/28/2026",
    lastActive: "09/18/2026 14:50",
    status: "Active",
    price: "$9.99/mo",
    discountPeriod: "0",
    discountAmount: "0",
    state: "Washington",
    platform: "iOS",
    locked: "No",
    notes: "",
  },
  {
    id: 14,
    name: "Liam Jenkins",
    email: "liamjenkins@hotmail.com",
    plan: "Monthly",
    signUpDate: "08/09/2025",
    nextPayment: "10/09/2026",
    lastActive: "09/19/2026 16:30",
    status: "Active",
    price: "$9.99/mo",
    discountPeriod: "0",
    discountAmount: "0",
    state: "Tennessee",
    platform: "Android",
    locked: "No",
    notes: "",
  },
  {
    id: 15,
    name: "Samuel Hayes",
    email: "samuelhayes@icloud.com",
    plan: "Monthly",
    signUpDate: "08/20/2025",
    nextPayment: "10/20/2026",
    lastActive: "09/21/2026 18:10",
    status: "Active",
    price: "$9.99/mo",
    discountPeriod: "0",
    discountAmount: "0",
    state: "Indiana",
    platform: "iOS",
    locked: "No",
    notes: "",
  },
  {
    id: 16,
    name: "Benjamin Cooper",
    email: "benjamincooper@gmail.com",
    plan: "Yearly",
    signUpDate: "08/30/2025",
    nextPayment: "08/30/2027",
    lastActive: "09/22/2026 17:00",
    status: "Active",
    price: "$99.99/yr",
    discountPeriod: "0",
    discountAmount: "0",
    state: "Missouri",
    platform: "iOS",
    locked: "No",
    notes: "",
  },
  {
    id: 17,
    name: "Isaac Richardson",
    email: "isaacrichardson@yahoo.com",
    plan: "Yearly",
    signUpDate: "09/02/2025",
    nextPayment: "09/02/2027",
    lastActive: "09/22/2026 09:15",
    status: "Active",
    price: "$99.99/yr",
    discountPeriod: "0",
    discountAmount: "0",
    state: "Maryland",
    platform: "Android",
    locked: "No",
    notes: "",
  },
  {
    id: 18,
    name: "Thomas Thompson",
    email: "thomasthompson@outlook.com",
    plan: "Yearly",
    signUpDate: "09/10/2025",
    nextPayment: "09/10/2027",
    lastActive: "09/21/2026 11:40",
    status: "Active",
    price: "$99.99/yr",
    discountPeriod: "0",
    discountAmount: "0",
    state: "Wisconsin",
    platform: "iOS",
    locked: "No",
    notes: "",
  },
  {
    id: 19,
    name: "Jack Anderson",
    email: "jackanderson@hotmail.com",
    plan: "Yearly",
    signUpDate: "09/15/2025",
    nextPayment: "09/15/2027",
    lastActive: "09/22/2026 13:05",
    status: "Active",
    price: "$99.99/yr",
    discountPeriod: "0",
    discountAmount: "0",
    state: "Colorado",
    platform: "iOS",
    locked: "No",
    notes: "",
  },
  {
    id: 20,
    name: "Leo Carter",
    email: "leocarter@icloud.com",
    plan: "Yearly",
    signUpDate: "09/18/2025",
    nextPayment: "09/18/2027",
    lastActive: "09/20/2026 15:20",
    status: "Active",
    price: "$99.99/yr",
    discountPeriod: "0",
    discountAmount: "0",
    state: "Minnesota",
    platform: "Android",
    locked: "No",
    notes: "",
  },
];

const SingleUser = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState(initialSingleUsers);
  const [selectedIds, setSelectedIds] = useState([]); // No user preselected on land
  const [activeUserId, setActiveUserId] = useState(null); // No user preselected on land
  const [filterInput, setFilterInput] = useState("All");
  const [filter, setFilter] = useState("All");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Get active user object
  const activeUser = useMemo(() => {
    return users.find((u) => u.id === activeUserId) || null;
  }, [users, activeUserId]);

  // Form state for editable fields in USER INFO panel
  const [editFormData, setEditFormData] = useState({
    email: "",
    password: "••••••••••••",
    notes: "",
    status: "Active",
    plan: "Monthly",
    state: "",
  });

  // Keep form data synced when active user changes
  const handleSelectUser = (user) => {
    setActiveUserId(user.id);
    setEditFormData({
      email: user.email,
      password: "••••••••••••",
      notes: user.notes || "",
      status: user.status,
      plan: user.plan,
      state: user.state,
    });
    // Add to selected checkbox if not present
    if (!selectedIds.includes(user.id)) {
      setSelectedIds([user.id]);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2500);
  };

  // Filter & Search logic
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());

      if (!matchSearch) return false;

      if (filter === "All") return true;
      if (filter === "Yearly") return user.plan === "Yearly";
      if (filter === "Monthly") return user.plan === "Monthly";
      if (filter === "Active") return user.status === "Active";
      if (filter === "Canceled") return user.status === "Canceled";
      if (filter === "Locked") return user.locked === "Yes";
      return true;
    });
  }, [users, search, filter]);

  // Total metrics
  const totalCount = 438;
  const totalMonthlyCount = 245;
  const totalYearlyCount = 193;

  const isAllVisibleSelected =
    filteredUsers.length > 0 &&
    filteredUsers.every((u) => selectedIds.includes(u.id));

  const handleToggleSelectAll = (checked) => {
    if (checked) {
      const allVisibleIds = filteredUsers.map((u) => u.id);
      setSelectedIds(Array.from(new Set([...selectedIds, ...allVisibleIds])));
    } else {
      const visibleIdSet = new Set(filteredUsers.map((u) => u.id));
      setSelectedIds(selectedIds.filter((id) => !visibleIdSet.has(id)));
    }
  };

  const handleToggleSelectRow = (id, event) => {
    event.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bottom action buttons
  const handleRemove = () => {
    if (selectedIds.length === 0) {
      showToast("No users selected to remove");
      return;
    }
    setUsers((prev) => prev.filter((u) => !selectedIds.includes(u.id)));
    if (selectedIds.includes(activeUserId)) {
      setActiveUserId(null);
    }
    setSelectedIds([]);
    showToast("Selected users removed successfully");
  };

  const handleDownload = () => {
    const headers = [
      "Name",
      "Email",
      "Plan",
      "Sign Up Date",
      "Next Payment",
      "Status",
      "Price",
      "State",
      "Platform",
      "Locked",
    ];
    const rows = filteredUsers.map((u) => [
      `"${u.name}"`,
      `"${u.email}"`,
      `"${u.plan}"`,
      `"${u.signUpDate}"`,
      `"${u.nextPayment}"`,
      `"${u.status}"`,
      `"${u.price}"`,
      `"${u.state}"`,
      `"${u.platform}"`,
      `"${u.locked}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "single_users_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("User list downloaded as CSV");
  };

  const handleReset = () => {
    setFilterInput("All");
    setFilter("All");
    setSearchInput("");
    setSearch("");
    setSelectedIds([]);
    setActiveUserId(null);
    showToast("Filters and selection reset");
  };

  const handleLock = () => {
    if (selectedIds.length === 0) {
      showToast("No users selected to lock");
      return;
    }
    setUsers((prev) =>
      prev.map((u) => (selectedIds.includes(u.id) ? { ...u, locked: "Yes" } : u))
    );
    showToast("Selected users locked");
  };

  const handleUnlock = () => {
    if (selectedIds.length === 0) {
      showToast("No users selected to unlock");
      return;
    }
    setUsers((prev) =>
      prev.map((u) => (selectedIds.includes(u.id) ? { ...u, locked: "No" } : u))
    );
    showToast("Selected users unlocked");
  };

  // Side Panel Save & Cancel
  const handleSaveUserInfo = (e) => {
    e.preventDefault();
    if (!activeUser) {
      showToast("Please select a user first");
      return;
    }
    setUsers((prev) =>
      prev.map((u) =>
        u.id === activeUser.id
          ? {
              ...u,
              email: editFormData.email,
              notes: editFormData.notes,
              status: editFormData.status,
              plan: editFormData.plan,
              state: editFormData.state,
            }
          : u
      )
    );
    showToast("User information saved successfully");
  };

  const handleCancelUserInfo = () => {
    if (activeUser) {
      setEditFormData({
        email: activeUser.email,
        password: "••••••••••••",
        notes: activeUser.notes || "",
        status: activeUser.status,
        plan: activeUser.plan,
        state: activeUser.state,
      });
      showToast("Changes discarded");
    } else {
      setActiveUserId(null);
    }
  };

  return (
    <div className="min-h-full bg-white px-2 py-3 text-[13px] text-[#555] md:px-5 md:py-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 rounded bg-[#151d56] px-4 py-2.5 text-sm text-white shadow-lg transition-all">
          {toastMessage}
        </div>
      )}

      {/* Header Info */}
      <div className="mb-4">
        <h1 className="mb-2 text-xl font-normal text-[#999]">Manage single users</h1>
        <div className="space-y-0.5 font-bold text-[#222]">
          <p>Total: {totalCount}</p>
          <p>Total monthly: {totalMonthlyCount}</p>
          <p>Total yearly: {totalYearlyCount}</p>
        </div>
      </div>

      {/* Main Grid: Left Table & Right Side Panel */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.5fr_1fr] 2xl:grid-cols-[1.6fr_1fr]">
        {/* Left Column: Filter/Search, Table, Stats, Action Buttons */}
        <section className="flex flex-col min-w-0">
          {/* Filters & Search Row */}
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[#666]">Filter:</span>
              <select
                value={filterInput}
                onChange={(e) => setFilterInput(e.target.value)}
                className="h-6 rounded border border-[#ccc] bg-white px-1 text-xs outline-none"
              >
                <option value="All">All</option>
                <option value="Yearly">Yearly</option>
                <option value="Monthly">Monthly</option>
                <option value="Active">Active</option>
                <option value="Canceled">Canceled</option>
                <option value="Locked">Locked</option>
              </select>
              <button
                type="button"
                onClick={() => setFilter(filterInput)}
                className="h-6 rounded border border-[#ccc] bg-[#efefef] px-2.5 text-xs font-normal text-[#333] hover:bg-[#e4e4e4] active:bg-[#d5d5d5] cursor-pointer"
              >
                Go
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[#666]">Search:</span>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && setSearch(searchInput.trim())}
                className="h-6 w-32 rounded border border-[#ccc] bg-white px-2 text-xs outline-none md:w-44"
              />
              <button
                type="button"
                onClick={() => setSearch(searchInput.trim())}
                className="h-6 rounded border border-[#ccc] bg-[#efefef] px-2.5 text-xs font-normal text-[#333] hover:bg-[#e4e4e4] active:bg-[#d5d5d5] cursor-pointer"
              >
                Go
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto border border-[#eee]">
            <table className="w-full min-w-[580px] border-collapse text-left text-xs">
              <thead>
                <tr className="h-8 border-b border-[#eee] bg-[#f3f3f3] uppercase text-[#888] font-normal">
                  <th className="w-8 px-2 text-center">
                    <input
                      type="checkbox"
                      checked={isAllVisibleSelected}
                      onChange={(e) => handleToggleSelectAll(e.target.checked)}
                      className="cursor-pointer accent-[#ff823d]"
                      aria-label="Select all single users"
                    />
                  </th>
                  <th className="px-3 py-1 font-semibold tracking-wider">NAME</th>
                  <th className="px-3 py-1 font-semibold tracking-wider">EMAIL</th>
                  <th className="px-3 py-1 font-semibold tracking-wider">YEARLY/<br className="sm:hidden" />MONTHLY</th>
                  <th className="w-14 px-2 py-1 text-center font-semibold tracking-wider">EDIT/<br className="sm:hidden" />VIEW</th>
                  <th className="w-16 px-2 py-1 text-center font-semibold tracking-wider">ROUTE<br className="sm:hidden" />HISTORY</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#888]">
                      No single users found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const isSelected = selectedIds.includes(user.id);
                    const isActive = activeUserId === user.id;
                    return (
                      <tr
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        className={`h-8 border-b border-[#f0f0f0] cursor-pointer transition-colors ${
                          isActive
                            ? "bg-[#fff3eb]"
                            : isSelected
                            ? "bg-[#fef8f4]"
                            : "even:bg-[#f9f9f9] hover:bg-[#f5f5f5]"
                        }`}
                      >
                        <td className="px-2 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleToggleSelectRow(user.id, e)}
                            className="cursor-pointer accent-[#ff823d]"
                            aria-label={`Select ${user.name}`}
                          />
                        </td>
                        <td className="px-3 py-1 font-normal text-[#444] whitespace-nowrap">
                          {user.name}
                        </td>
                        <td className="px-3 py-1 text-[#666] whitespace-nowrap">
                          {user.email}
                        </td>
                        <td className="px-3 py-1 text-[#666] whitespace-nowrap">
                          {user.plan}
                        </td>
                        <td className="px-2 py-1 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleSelectUser(user)}
                            className="text-[#777] hover:text-[#ff823d] p-0.5 cursor-pointer inline-flex items-center justify-center"
                            aria-label={`Edit ${user.name}`}
                          >
                            <Pencil size={15} />
                          </button>
                        </td>
                        <td className="px-2 py-1 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/dashboard/single-route-history/${encodeURIComponent(user.email)}`
                              )
                            }
                            className="text-[#777] hover:text-[#ff823d] p-0.5 cursor-pointer inline-flex items-center justify-center"
                            aria-label={`Route history for ${user.name}`}
                          >
                            <History size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Bottom Meta & Pagination */}
          <div className="flex flex-wrap items-center justify-between border-b border-[#eee] py-2 text-xs text-[#777]">
            <span>{selectedIds.length} of {totalCount} selected</span>
            <span>1-{filteredUsers.length} of {totalCount} users</span>
            <div className="flex items-center gap-1.5 underline cursor-pointer">
              <button
                type="button"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className="hover:text-black cursor-pointer"
              >
                Previous
              </button>
              <span
                onClick={() => setCurrentPage(1)}
                className={`px-0.5 cursor-pointer ${currentPage === 1 ? "font-bold text-black" : ""}`}
              >
                1
              </span>
              <span
                onClick={() => setCurrentPage(2)}
                className={`px-0.5 cursor-pointer ${currentPage === 2 ? "font-bold text-black" : ""}`}
              >
                2
              </span>
              <span
                onClick={() => setCurrentPage(3)}
                className={`px-0.5 cursor-pointer ${currentPage === 3 ? "font-bold text-black" : ""}`}
              >
                3
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage(currentPage + 1)}
                className="hover:text-black cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>

          {/* Table Action Buttons */}
          <div className="mt-4 flex flex-wrap items-center gap-2.5 rounded-lg border border-[#e7e7e7] bg-[#fafafa] p-2.5">
            <button
              type="button"
              onClick={handleRemove}
              className="rounded bg-[#ff823d] px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#e56f2d] cursor-pointer"
            >
              REMOVE
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="rounded bg-[#151d56] px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#0e143d] cursor-pointer"
            >
              DOWNLOAD
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded bg-[#151d56] px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#0e143d] cursor-pointer"
            >
              RESET
            </button>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={handleLock}
                className="rounded bg-[#cc0000] px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#a60000] cursor-pointer"
              >
                LOCK
              </button>
              <button
                type="button"
                onClick={handleUnlock}
                className="rounded bg-[#cc0000] px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#a60000] cursor-pointer"
              >
                UNLOCK
              </button>
            </div>
          </div>
        </section>

        {/* Right Column: USER INFO Side Panel & Buttons */}
        <section className="flex flex-col min-w-0">
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-[#999]">
            USER INFO
          </div>

          {/* Side Panel Content Box */}
          <div className="flex-1 overflow-y-auto border border-[#ccc] bg-white p-3.5 min-h-[380px] max-h-[610px] text-xs space-y-2.5">
            {activeUser ? (
              <form onSubmit={handleSaveUserInfo} id="userInfoForm" className="space-y-2 text-[#555]">
                <h2 className="text-sm font-bold text-[#222] mb-1">
                  {activeUser.name}
                </h2>

                {/* Email field */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <label className="w-28 font-bold text-[#333]">Email:</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, email: e.target.value })
                    }
                    className="h-7 flex-1 rounded-sm border border-[#ccc] px-2 text-xs text-[#444] outline-none focus:border-[#ff823d]"
                  />
                </div>

                {/* Password field with toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <label className="w-28 font-bold text-[#333]">Password:</label>
                  <div className="relative flex-1">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={editFormData.password}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, password: e.target.value })
                      }
                      className="h-7 w-full rounded-sm border border-[#ccc] px-2 pr-7 text-xs text-[#444] outline-none focus:border-[#ff823d]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Info Display Fields */}
                <div className="pt-1 space-y-1.5">
                  <p>
                    <strong className="font-bold text-[#333]">Sign-up date:</strong>{" "}
                    <span className="text-[#666]">{activeUser.signUpDate}</span>
                  </p>
                  <p>
                    <strong className="font-bold text-[#333]">Next payment:</strong>{" "}
                    <span className="text-[#666]">{activeUser.nextPayment}</span>
                  </p>
                  <p>
                    <strong className="font-bold text-[#333]">Last time active:</strong>{" "}
                    <span className="text-[#666]">{activeUser.lastActive}</span>
                  </p>
                  <p>
                    <strong className="font-bold text-[#333]">Account status:</strong>{" "}
                    <span className="text-[#666]">{activeUser.status}</span>
                  </p>
                  <p>
                    <strong className="font-bold text-[#333]">Current plan:</strong>{" "}
                    <span className="text-[#666]">{activeUser.plan}</span>
                  </p>
                  <p>
                    <strong className="font-bold text-[#333]">Price:</strong>{" "}
                    <span className="text-[#666]">{activeUser.price}</span>
                  </p>
                  <p>
                    <strong className="font-bold text-[#333]">Discount period:</strong>{" "}
                    <span className="text-[#666]">{activeUser.discountPeriod}</span>
                  </p>
                  <p>
                    <strong className="font-bold text-[#333]">Discount amount:</strong>{" "}
                    <span className="text-[#666]">{activeUser.discountAmount}</span>
                  </p>
                  <p>
                    <strong className="font-bold text-[#333]">State:</strong>{" "}
                    <span className="text-[#666]">{activeUser.state}</span>
                  </p>
                  <p>
                    <strong className="font-bold text-[#333]">Platform:</strong>{" "}
                    <span className="text-[#666]">{activeUser.platform}</span>
                  </p>
                  <p>
                    <strong className="font-bold text-[#333]">Locked:</strong>{" "}
                    <span className="text-[#666]">{activeUser.locked}</span>
                  </p>
                </div>

                {/* Notes Textarea */}
                <div className="pt-1">
                  <label className="block font-bold text-[#333] mb-1">Notes:</label>
                  <textarea
                    rows={6}
                    value={editFormData.notes}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, notes: e.target.value })
                    }
                    placeholder="Text field box where we can type in info about this user such as notes from tech support, etc."
                    className="w-full rounded-sm border border-[#ccc] p-2 text-xs text-[#444] outline-none focus:border-[#ff823d] placeholder:text-[#aaa] resize-y"
                  />
                </div>
              </form>
            ) : (
              <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center text-[#888]">
                <p className="text-sm">Select an user to edit/view details.</p>
              </div>
            )}
          </div>

          {/* Side Panel Action Buttons */}
          <div className="mt-4 flex flex-wrap items-center gap-2.5 rounded-lg border border-[#e7e7e7] bg-[#fafafa] p-2.5">
            <button
              type="submit"
              form="userInfoForm"
              disabled={!activeUser}
              className={`rounded px-5 py-1.5 text-xs font-semibold text-white transition-colors ${
                activeUser
                  ? "bg-[#ff823d] hover:bg-[#e56f2d] cursor-pointer"
                  : "bg-[#ff823d]/50 cursor-not-allowed"
              }`}
            >
              SAVE
            </button>
            <button
              type="button"
              onClick={handleCancelUserInfo}
              disabled={!activeUser}
              className={`rounded px-5 py-1.5 text-xs font-semibold text-white transition-colors ${
                activeUser
                  ? "bg-[#151d56] hover:bg-[#0e143d] cursor-pointer"
                  : "bg-[#151d56]/50 cursor-not-allowed"
              }`}
            >
              CANCEL
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SingleUser;
