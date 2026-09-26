import { useState, useMemo } from "react";
import { Pencil, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router";

const initialTeamUsers = [
  {
    id: 1,
    name: "Ethan Mercer",
    company: "Mercer Freight LLC",
    email: "ethanmercer@mercerfreight.com",
    phone: "(555) 234-8901",
    dateSubscr: "04/05/26",
    signUpDate: "04/05/2026",
    nextPayment: "05/05/2026",
    lastActive: "09/22/2026 14:15",
    status: "Active",
    currentPlan: "10 drivers",
    activeDrivers: 8,
    price: "$89.00/mo",
    discountPeriod: "0",
    discountAmount: "0",
    state: "Texas",
    platform: "iOS",
    locked: "No",
    notes: "",
  },
  {
    id: 2,
    name: "Caleb Dawson",
    company: "Dawson Trucking",
    email: "calebdawson@dawsontrucking.com",
    phone: "(555) 345-9012",
    dateSubscr: "04/18/26",
    signUpDate: "04/18/2026",
    nextPayment: "05/18/2026",
    lastActive: "09/21/2026 09:30",
    status: "Active",
    currentPlan: "25 drivers",
    activeDrivers: 21,
    price: "$149.00/mo",
    discountPeriod: "0",
    discountAmount: "0",
    state: "California",
    platform: "Android",
    locked: "No",
    notes: "",
  },
  {
    id: 3,
    name: "Ryan Whitaker",
    company: "Whitaker Hauling",
    email: "ryanwhitaker@whitakerhaul.com",
    phone: "(555) 456-0123",
    dateSubscr: "04/29/26",
    signUpDate: "04/29/2026",
    nextPayment: "05/29/2026",
    lastActive: "09/22/2026 11:20",
    status: "Active",
    currentPlan: "5 drivers",
    activeDrivers: 4,
    price: "$49.00/mo",
    discountPeriod: "0",
    discountAmount: "0",
    state: "Ohio",
    platform: "iOS",
    locked: "No",
    notes: "",
  },
  {
    id: 4,
    name: "Jason Hollis",
    company: "Hollis Transport",
    email: "jasonhollis@hollistransport.com",
    phone: "(555) 567-1234",
    dateSubscr: "05/07/26",
    signUpDate: "05/07/2026",
    nextPayment: "06/07/2026",
    lastActive: "09/20/2026 16:45",
    status: "Active",
    currentPlan: "50 drivers",
    activeDrivers: 42,
    price: "$279.00/mo",
    discountPeriod: "0",
    discountAmount: "0",
    state: "Illinois",
    platform: "Android",
    locked: "No",
    notes: "",
  },
  {
    id: 5,
    name: "Derek Vaughn",
    company: "Vaughn Freight",
    email: "derekvaughn@vaughnfreight.com",
    phone: "(555) 678-2345",
    dateSubscr: "05/16/26",
    signUpDate: "05/16/2026",
    nextPayment: "06/16/2026",
    lastActive: "09/19/2026 17:10",
    status: "Active",
    currentPlan: "10 drivers",
    activeDrivers: 9,
    price: "$89.00/mo",
    discountPeriod: "0",
    discountAmount: "0",
    state: "Florida",
    platform: "iOS",
    locked: "No",
    notes: "",
  },
  {
    id: 6,
    name: "Marcus Bennett",
    company: "Bennett Trucking",
    email: "marcusbennett@bennetttrucking.com",
    phone: "(555) 789-3456",
    dateSubscr: "05/28/26",
    signUpDate: "05/28/2026",
    nextPayment: "06/28/2026",
    lastActive: "09/22/2026 08:50",
    status: "Active",
    currentPlan: "25 drivers",
    activeDrivers: 24,
    price: "$149.00/mo",
    discountPeriod: "0",
    discountAmount: "0",
    state: "Georgia",
    platform: "Android",
    locked: "No",
    notes: "",
  },
  {
    id: 7,
    name: "Tyler Ramsey",
    company: "Ramsey Haulage",
    email: "tylerramsey@ramseyhaul.com",
    phone: "(555) 890-4567",
    dateSubscr: "06/03/26",
    signUpDate: "06/03/2026",
    nextPayment: "07/03/2026",
    lastActive: "09/21/2026 13:25",
    status: "Active",
    currentPlan: "100 drivers",
    activeDrivers: 88,
    price: "$499.00/mo",
    discountPeriod: "0",
    discountAmount: "0",
    state: "Pennsylvania",
    platform: "iOS",
    locked: "No",
    notes: "",
  },
  {
    id: 8,
    name: "Nathan Collins",
    company: "Collins Freight",
    email: "nathancollins@collinsfreight.com",
    phone: "(555) 901-5678",
    dateSubscr: "06/14/26",
    signUpDate: "06/14/2026",
    nextPayment: "07/14/2026",
    lastActive: "09/22/2026 15:40",
    status: "Active",
    currentPlan: "10 drivers",
    activeDrivers: 7,
    price: "$89.00/mo",
    discountPeriod: "0",
    discountAmount: "0",
    state: "North Carolina",
    platform: "Android",
    locked: "No",
    notes: "",
  },
  {
    id: 9,
    name: "Brandon Keller",
    company: "Keller Transport",
    email: "brandonkeller@kellertransport.com",
    phone: "(555) 012-6789",
    dateSubscr: "06/27/26",
    signUpDate: "06/27/2026",
    nextPayment: "07/27/2026",
    lastActive: "09/22/2026 10:15",
    status: "Active",
    currentPlan: "25 drivers",
    activeDrivers: 18,
    price: "$149.00/mo",
    discountPeriod: "0",
    discountAmount: "0",
    state: "Texas",
    platform: "iOS",
    locked: "No",
    notes: "",
  },
  {
    id: 10,
    name: "Trevor Lawson",
    company: "Lawson Trucking Co.",
    email: "trevorlawson@lawsontrucking.com",
    phone: "(555) 123-7890",
    dateSubscr: "07/06/26",
    signUpDate: "07/06/2026",
    nextPayment: "08/06/2026",
    lastActive: "09/20/2026 10:15",
    status: "Active",
    currentPlan: "50 drivers",
    activeDrivers: 39,
    price: "$279.00/mo",
    discountPeriod: "0",
    discountAmount: "0",
    state: "Arizona",
    platform: "iOS",
    locked: "No",
    notes: "",
  },
  {
    id: 11,
    name: "Garrett Monroe",
    company: "Monroe Hauling",
    email: "garrettmonroe@monroehaul.com",
    phone: "(555) 234-8902",
    dateSubscr: "07/15/26",
    signUpDate: "07/15/2026",
    nextPayment: "08/15/2026",
    lastActive: "09/21/2026 12:00",
    status: "Active",
    currentPlan: "5 drivers",
    activeDrivers: 5,
    price: "$49.00/mo",
    discountPeriod: "0",
    discountAmount: "0",
    state: "Virginia",
    platform: "Android",
    locked: "No",
    notes: "",
  },
  {
    id: 12,
    name: "Cody Franklin",
    company: "Franklin Freight",
    email: "codyfranklin@franklinfreight.com",
    phone: "(555) 345-9013",
    dateSubscr: "07/24/26",
    signUpDate: "07/24/2026",
    nextPayment: "08/24/2026",
    lastActive: "09/22/2026 07:45",
    status: "Active",
    currentPlan: "10 drivers",
    activeDrivers: 10,
    price: "$89.00/mo",
    discountPeriod: "0",
    discountAmount: "0",
    state: "Michigan",
    platform: "iOS",
    locked: "No",
    notes: "",
  },
  {
    id: 13,
    name: "Austin Barrett",
    company: "Barrett Transport",
    email: "austinbarrett@barretttransport.com",
    phone: "(555) 456-0124",
    dateSubscr: "08/02/26",
    signUpDate: "08/02/2026",
    nextPayment: "09/02/2026",
    lastActive: "09/18/2026 14:50",
    status: "Active",
    currentPlan: "25 drivers",
    activeDrivers: 15,
    price: "$149.00/mo",
    discountPeriod: "0",
    discountAmount: "0",
    state: "Washington",
    platform: "iOS",
    locked: "No",
    notes: "",
  },
  {
    id: 14,
    name: "Jeremy Dalton",
    company: "Dalton Trucking",
    email: "jeremydalton@daltontrucking.com",
    phone: "(555) 567-1235",
    dateSubscr: "08/11/26",
    signUpDate: "08/11/2026",
    nextPayment: "09/11/2026",
    lastActive: "09/19/2026 16:30",
    status: "Active",
    currentPlan: "10 drivers",
    activeDrivers: 8,
    price: "$89.00/mo",
    discountPeriod: "0",
    discountAmount: "0",
    state: "Tennessee",
    platform: "Android",
    locked: "No",
    notes: "",
  },
  {
    id: 15,
    name: "Logan Pierce",
    company: "Pierce Haulage",
    email: "loganpierce@piercehaul.com",
    phone: "(555) 678-2346",
    dateSubscr: "08/19/26",
    signUpDate: "08/19/2026",
    nextPayment: "09/19/2026",
    lastActive: "09/21/2026 18:10",
    status: "Active",
    currentPlan: "50 drivers",
    activeDrivers: 45,
    price: "$279.00/mo",
    discountPeriod: "0",
    discountAmount: "0",
    state: "Missouri",
    platform: "iOS",
    locked: "No",
    notes: "",
  },
  {
    id: 16,
    name: "Mitchell Hayes",
    company: "Hayes Freight Lines",
    email: "mitchellhayes@hayesfreight.com",
    phone: "(555) 789-3457",
    dateSubscr: "08/27/26",
    signUpDate: "08/27/2026",
    nextPayment: "09/27/2026",
    lastActive: "09/22/2026 17:00",
    status: "Active",
    currentPlan: "5 drivers",
    activeDrivers: 3,
    price: "$49.00/mo",
    discountPeriod: "0",
    discountAmount: "0",
    state: "Indiana",
    platform: "Android",
    locked: "No",
    notes: "",
  },
  {
    id: 17,
    name: "Dustin Carver",
    company: "Carver Transport",
    email: "dustincarver@carvertransport.com",
    phone: "(555) 890-4568",
    dateSubscr: "09/03/26",
    signUpDate: "09/03/2026",
    nextPayment: "10/03/2026",
    lastActive: "09/22/2026 09:15",
    status: "Active",
    currentPlan: "25 drivers",
    activeDrivers: 20,
    price: "$149.00/mo",
    discountPeriod: "0",
    discountAmount: "0",
    state: "Wisconsin",
    platform: "iOS",
    locked: "No",
    notes: "",
  },
  {
    id: 18,
    name: "Kyle Brennan",
    company: "Brennan Trucking",
    email: "kylebrennan@brennantrucking.com",
    phone: "(555) 901-5679",
    dateSubscr: "09/08/26",
    signUpDate: "09/08/2026",
    nextPayment: "10/08/2026",
    lastActive: "09/21/2026 11:40",
    status: "Active",
    currentPlan: "10 drivers",
    activeDrivers: 6,
    price: "$89.00/mo",
    discountPeriod: "0",
    discountAmount: "0",
    state: "Colorado",
    platform: "iOS",
    locked: "No",
    notes: "",
  },
  {
    id: 19,
    name: "Travis Morgan",
    company: "Morgan Hauling",
    email: "travismorgan@morganhaul.com",
    phone: "(555) 012-6780",
    dateSubscr: "09/14/26",
    signUpDate: "09/14/2026",
    nextPayment: "10/14/2026",
    lastActive: "09/22/2026 13:05",
    status: "Active",
    currentPlan: "100 drivers",
    activeDrivers: 74,
    price: "$499.00/mo",
    discountPeriod: "0",
    discountAmount: "0",
    state: "Maryland",
    platform: "Android",
    locked: "No",
    notes: "",
  },
  {
    id: 20,
    name: "Eric Chandler",
    company: "Chandler Freight",
    email: "ericchandler@chandlerfreight.com",
    phone: "(555) 123-7891",
    dateSubscr: "09/20/26",
    signUpDate: "09/20/2026",
    nextPayment: "10/20/2026",
    lastActive: "09/20/2026 15:20",
    status: "Active",
    currentPlan: "10 drivers",
    activeDrivers: 9,
    price: "$89.00/mo",
    discountPeriod: "0",
    discountAmount: "0",
    state: "Minnesota",
    platform: "iOS",
    locked: "No",
    notes: "",
  },
];

const TeamUsers = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState(initialTeamUsers);
  const [selectedIds, setSelectedIds] = useState([]); // No team preselected on land
  const [activeTeamId, setActiveTeamId] = useState(null); // No team preselected on land
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [appliedFromDate, setAppliedFromDate] = useState("");
  const [appliedToDate, setAppliedToDate] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Get active team object
  const activeTeam = useMemo(() => {
    return teams.find((t) => t.id === activeTeamId) || null;
  }, [teams, activeTeamId]);

  // Form state for editable fields in TEAM INFO panel
  const [editFormData, setEditFormData] = useState({
    company: "",
    email: "",
    phone: "",
    password: "••••••••••••",
    notes: "",
    status: "Active",
    currentPlan: "25 drivers",
    state: "",
  });

  // Keep form data synced when active team changes
  const handleSelectTeam = (team) => {
    setActiveTeamId(team.id);
    setEditFormData({
      company: team.company || "",
      email: team.email,
      phone: team.phone || "",
      password: "••••••••••••",
      notes: team.notes || "",
      status: team.status,
      currentPlan: team.currentPlan,
      state: team.state,
    });
    // Add to selected checkbox if not present
    if (!selectedIds.includes(team.id)) {
      setSelectedIds([team.id]);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2500);
  };

  // Filter & Search logic
  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      const matchSearch =
        team.name.toLowerCase().includes(search.toLowerCase()) ||
        team.email.toLowerCase().includes(search.toLowerCase()) ||
        (team.company && team.company.toLowerCase().includes(search.toLowerCase()));

      if (!matchSearch) return false;

      // Optional date range filter
      if (appliedFromDate && team.signUpDate < appliedFromDate) return false;
      if (appliedToDate && team.signUpDate > appliedToDate) return false;

      return true;
    });
  }, [teams, search, appliedFromDate, appliedToDate]);

  // Total metrics
  const totalCount = 79;
  const totalDriversCount = 412;

  const isAllVisibleSelected =
    filteredTeams.length > 0 &&
    filteredTeams.every((t) => selectedIds.includes(t.id));

  const handleToggleSelectAll = (checked) => {
    if (checked) {
      const allVisibleIds = filteredTeams.map((t) => t.id);
      setSelectedIds(Array.from(new Set([...selectedIds, ...allVisibleIds])));
    } else {
      const visibleIdSet = new Set(filteredTeams.map((t) => t.id));
      setSelectedIds(selectedIds.filter((id) => !visibleIdSet.has(id)));
    }
  };

  const handleToggleSelectRow = (id, event) => {
    event.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleApplyDateRange = () => {
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
    showToast("Date filter applied");
  };

  // Bottom action buttons
  const handleDelete = () => {
    if (selectedIds.length === 0) {
      showToast("No teams selected to delete");
      return;
    }
    setTeams((prev) => prev.filter((t) => !selectedIds.includes(t.id)));
    if (selectedIds.includes(activeTeamId)) {
      setActiveTeamId(null);
    }
    setSelectedIds([]);
    showToast("Selected teams deleted successfully");
  };

  const handleDownload = () => {
    const headers = [
      "Name",
      "Company",
      "Email",
      "Phone",
      "Date Subscribed",
      "Next Payment",
      "Plan",
      "Active Drivers",
      "Status",
      "Price",
      "State",
      "Platform",
      "Locked",
    ];
    const rows = filteredTeams.map((t) => [
      `"${t.name}"`,
      `"${t.company}"`,
      `"${t.email}"`,
      `"${t.phone}"`,
      `"${t.dateSubscr}"`,
      `"${t.nextPayment}"`,
      `"${t.currentPlan}"`,
      `"${t.activeDrivers}"`,
      `"${t.status}"`,
      `"${t.price}"`,
      `"${t.state}"`,
      `"${t.platform}"`,
      `"${t.locked}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "teams_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Team list downloaded as CSV");
  };

  const handleReset = () => {
    setFromDate("");
    setToDate("");
    setAppliedFromDate("");
    setAppliedToDate("");
    setSearchInput("");
    setSearch("");
    setSelectedIds([]);
    setActiveTeamId(null);
    showToast("Filters and selection reset");
  };

  const handleLock = () => {
    if (selectedIds.length === 0) {
      showToast("No teams selected to lock");
      return;
    }
    setTeams((prev) =>
      prev.map((t) => (selectedIds.includes(t.id) ? { ...t, locked: "Yes" } : t))
    );
    showToast("Selected teams locked");
  };

  const handleUnlock = () => {
    if (selectedIds.length === 0) {
      showToast("No teams selected to unlock");
      return;
    }
    setTeams((prev) =>
      prev.map((t) => (selectedIds.includes(t.id) ? { ...t, locked: "No" } : t))
    );
    showToast("Selected teams unlocked");
  };

  // Side Panel Save & Cancel
  const handleSaveTeamInfo = (e) => {
    e.preventDefault();
    if (!activeTeam) {
      showToast("Please select a team first");
      return;
    }
    setTeams((prev) =>
      prev.map((t) =>
        t.id === activeTeam.id
          ? {
              ...t,
              company: editFormData.company,
              email: editFormData.email,
              phone: editFormData.phone,
              notes: editFormData.notes,
              status: editFormData.status,
              currentPlan: editFormData.currentPlan,
              state: editFormData.state,
            }
          : t
      )
    );
    showToast("Team information saved successfully");
  };

  const handleCancelTeamInfo = () => {
    if (activeTeam) {
      setEditFormData({
        company: activeTeam.company || "",
        email: activeTeam.email,
        phone: activeTeam.phone || "",
        password: "••••••••••••",
        notes: activeTeam.notes || "",
        status: activeTeam.status,
        currentPlan: activeTeam.currentPlan,
        state: activeTeam.state,
      });
      showToast("Changes discarded");
    } else {
      setActiveTeamId(null);
    }
  };

  return (
    <div className="min-h-full bg-white px-2 py-3 text-[13px] text-[#555] md:px-8 md:py-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 rounded bg-[#151d56] px-4 py-2.5 text-sm text-white shadow-lg transition-all">
          {toastMessage}
        </div>
      )}

      {/* Header Info */}
      <div className="mb-4">
        <h1 className="mb-2 text-xl font-normal text-[#999] md:text-2xl">Manage teams</h1>
        <div className="space-y-0.5 font-bold text-[#222]">
          <p>Total: {totalCount}</p>
          <p>Total drivers: {totalDriversCount}</p>
        </div>
      </div>

      {/* Main Grid: Left Table & Right Side Panel */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.5fr_1fr] 2xl:grid-cols-[1.6fr_1fr]">
        {/* Left Column: Date Range / Search, Table, Stats, Action Buttons */}
        <section className="flex flex-col min-w-0">
          {/* Date Range & Search Row */}
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[#666]">Date Range:</span>
              <span className="text-[#666] ml-1">From</span>
              <div className="relative inline-flex items-center">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="h-6 w-28 rounded border border-[#ccc] bg-white px-1.5 text-xs outline-none"
                />
              </div>
              <span className="text-[#666]">To</span>
              <div className="relative inline-flex items-center">
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="h-6 w-28 rounded border border-[#ccc] bg-white px-1.5 text-xs outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleApplyDateRange}
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
            <table className="w-full min-w-[540px] border-collapse text-left text-xs">
              <thead>
                <tr className="h-8 border-b border-[#eee] bg-[#f3f3f3] uppercase text-[#888] font-normal">
                  <th className="w-8 px-2 text-center">
                    <input
                      type="checkbox"
                      checked={isAllVisibleSelected}
                      onChange={(e) => handleToggleSelectAll(e.target.checked)}
                      className="cursor-pointer accent-[#ff823d]"
                      aria-label="Select all teams"
                    />
                  </th>
                  <th className="px-3 py-1 font-semibold tracking-wider">NAME</th>
                  <th className="px-3 py-1 font-semibold tracking-wider">EMAIL</th>
                  <th className="px-3 py-1 font-semibold tracking-wider">DATE<br className="sm:hidden" />SUBSCR</th>
                  <th className="w-16 px-2 py-1 text-center font-semibold tracking-wider">EDIT/<br className="sm:hidden" />VIEW</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeams.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#888]">
                      No teams found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTeams.map((team) => {
                    const isSelected = selectedIds.includes(team.id);
                    const isActive = activeTeamId === team.id;
                    return (
                      <tr
                        key={team.id}
                        onClick={() => handleSelectTeam(team)}
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
                            onChange={(e) => handleToggleSelectRow(team.id, e)}
                            className="cursor-pointer accent-[#ff823d]"
                            aria-label={`Select ${team.name}`}
                          />
                        </td>
                        <td className="px-3 py-1 font-normal text-[#444] whitespace-nowrap">
                          {team.name}
                        </td>
                        <td className="px-3 py-1 text-[#666] whitespace-nowrap">
                          {team.email}
                        </td>
                        <td className="px-3 py-1 text-[#666] whitespace-nowrap">
                          {team.dateSubscr}
                        </td>
                        <td className="px-2 py-1 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleSelectTeam(team)}
                            className="text-[#777] hover:text-[#ff823d] p-0.5 cursor-pointer inline-flex items-center justify-center"
                            aria-label={`Edit ${team.name}`}
                          >
                            <Pencil size={15} />
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
            <span>1-{filteredTeams.length} of {totalCount} users</span>
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
              onClick={handleDelete}
              className="rounded bg-[#ff823d] px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#e56f2d] cursor-pointer"
            >
              DELETE
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

        {/* Right Column: TEAM INFO Side Panel & Buttons */}
        <section className="flex flex-col min-w-0">
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-[#999]">
            TEAM INFO
          </div>

          {/* Side Panel Content Box */}
          <div className="flex-1 overflow-y-auto border border-[#ccc] bg-white p-3.5 min-h-[380px] max-h-[610px] text-xs space-y-2.5">
            {activeTeam ? (
              <form onSubmit={handleSaveTeamInfo} id="teamInfoForm" className="space-y-2 text-[#555]">
                <h2 className="text-sm font-bold text-[#222] mb-1">
                  {activeTeam.name}
                </h2>

                {/* Company field */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <label className="w-28 font-bold text-[#333]">Company:</label>
                  <input
                    type="text"
                    value={editFormData.company}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, company: e.target.value })
                    }
                    placeholder="Leave blank if not available"
                    className="h-7 flex-1 rounded-sm border border-[#ccc] px-2 text-xs text-[#444] outline-none focus:border-[#ff823d] placeholder:text-[#aaa]"
                  />
                </div>

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

                {/* Phone field */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <label className="w-28 font-bold text-[#333]">Phone:</label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, phone: e.target.value })
                    }
                    placeholder="Contact phone number if available"
                    className="h-7 flex-1 rounded-sm border border-[#ccc] px-2 text-xs text-[#444] outline-none focus:border-[#ff823d] placeholder:text-[#aaa]"
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
                    <span className="text-[#666]">{activeTeam.signUpDate}</span>
                  </p>
                  <p>
                    <strong className="font-bold text-[#333]">Next payment:</strong>{" "}
                    <span className="text-[#666]">{activeTeam.nextPayment}</span>
                  </p>
                  <p>
                    <strong className="font-bold text-[#333]">Last time active:</strong>{" "}
                    <span className="text-[#666]">{activeTeam.lastActive}</span>
                  </p>
                  <p>
                    <strong className="font-bold text-[#333]">Account status:</strong>{" "}
                    <span className="text-[#666]">{activeTeam.status}</span>
                  </p>
                  <p>
                    <strong className="font-bold text-[#333]">Current plan:</strong>{" "}
                    <span className="text-[#666]">{activeTeam.currentPlan}</span>
                  </p>
                  <p>
                    <strong className="font-bold text-[#333]">Active drivers:</strong>{" "}
                    <span className="text-[#666]">{activeTeam.activeDrivers}</span>
                  </p>
                  <p>
                    <strong className="font-bold text-[#333]">Price:</strong>{" "}
                    <span className="text-[#666]">{activeTeam.price}</span>
                  </p>
                  <p>
                    <strong className="font-bold text-[#333]">Discount period:</strong>{" "}
                    <span className="text-[#666]">{activeTeam.discountPeriod}</span>
                  </p>
                  <p>
                    <strong className="font-bold text-[#333]">Discount amount:</strong>{" "}
                    <span className="text-[#666]">{activeTeam.discountAmount}</span>
                  </p>
                  <p>
                    <strong className="font-bold text-[#333]">State:</strong>{" "}
                    <span className="text-[#666]">{activeTeam.state}</span>
                  </p>
                  <p>
                    <strong className="font-bold text-[#333]">Platform:</strong>{" "}
                    <span className="text-[#666]">{activeTeam.platform}</span>
                  </p>
                  <p>
                    <strong className="font-bold text-[#333]">Locked:</strong>{" "}
                    <span className="text-[#666]">{activeTeam.locked}</span>
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
              form="teamInfoForm"
              disabled={!activeTeam}
              className={`rounded px-5 py-1.5 text-xs font-semibold text-white transition-colors ${
                activeTeam
                  ? "bg-[#ff823d] hover:bg-[#e56f2d] cursor-pointer"
                  : "bg-[#ff823d]/50 cursor-not-allowed"
              }`}
            >
              SAVE
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="rounded bg-[#151d56] px-5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#0e143d] cursor-pointer"
            >
              DASHBOARD
            </button>
            <button
              type="button"
              onClick={handleCancelTeamInfo}
              disabled={!activeTeam}
              className={`rounded px-5 py-1.5 text-xs font-semibold text-white transition-colors ${
                activeTeam
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

export default TeamUsers;
