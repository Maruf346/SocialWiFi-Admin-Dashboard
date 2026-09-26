const LIVE_STORAGE_KEY = "socialwifi-live-tickets";
const ARCHIVED_STORAGE_KEY = "socialwifi-archived-tickets";

export const defaultLiveTickets = [
  {
    id: "RR-2026-00074",
    priority: "High",
    status: "New",
    customer: "J. Smith",
    customerEmail: "jsmith@example.com",
    category: "Route/Nav",
    subject: "Route mismatch",
    assigned: "-",
    description: "Route instructions do not match permit guidelines for the northern bypass on interstate 94.",
    date: "Jul 26, 2026",
  },
  {
    id: "RR-2026-00073",
    priority: "Normal",
    status: "Open",
    customer: "A. Jones",
    customerEmail: "ajones@gmail.com",
    category: "Billing/Sub",
    subject: "Trial issue",
    assigned: "Jocelyn",
    description: "Customer requested extension on trial period due to setup delays with internal company devices.",
    date: "Jul 25, 2026",
  },
  {
    id: "RR-2026-00072",
    priority: "Urgent",
    status: "Open",
    customer: "J. Caulerin",
    customerEmail: "jcaulerin@yahoo.com",
    category: "App Issue",
    subject: "App crash",
    assigned: "Nahid",
    description: "App crashed during mid-route update on Android 14. Crash log attached.",
    date: "Jul 25, 2026",
  },
  {
    id: "RR-2026-00071",
    priority: "Low",
    status: "Open",
    customer: "T. Allen",
    customerEmail: "tallen@outlook.com",
    category: "Feature Req",
    subject: "Offline maps",
    assigned: "Mahdi",
    description: "Feature request to pre-download map tiles for offline navigation in cellular dead zones.",
    date: "Jul 24, 2026",
  },
  {
    id: "RR-2026-00070",
    priority: "Normal",
    status: "Open",
    customer: "M. Erickson",
    customerEmail: "merickson@corp.net",
    category: "Acct Changes",
    subject: "Update acct info",
    assigned: "Brad",
    description: "Company account contact email needs updating to accounting@corp.net.",
    date: "Jul 24, 2026",
  },
];

export const defaultArchivedTickets = [
  {
    id: "RR-2026-00017",
    priority: "High",
    status: "Closed",
    customer: "T. Makela",
    customerEmail: "tmakela@example.com",
    category: "Route/Nav",
    subject: "Route mismatch",
    assigned: "Mahdi",
    description: "Resolved: Updated highway speed limits and height restrictions on state route 4.",
    date: "Jul 20, 2026",
  },
  {
    id: "RR-2026-00016",
    priority: "Normal",
    status: "Closed",
    customer: "W Shatner",
    customerEmail: "wshatner@enterprise.com",
    category: "App Issue",
    subject: "App freezes",
    assigned: "Nahid",
    description: "Resolved: Cleared corrupt cached route data and verified on mobile build.",
    date: "Jul 19, 2026",
  },
  {
    id: "RR-2026-00015",
    priority: "Low",
    status: "Closed",
    customer: "B. Lee",
    customerEmail: "blee@dragon.org",
    category: "Gen Question",
    subject: "Feedback",
    assigned: "Jocelyn",
    description: "Customer provided positive feedback on recent UI navigation speed improvements.",
    date: "Jul 18, 2026",
  },
  {
    id: "RR-2026-00014",
    priority: "Low",
    status: "Closed",
    customer: "O. Johnson",
    customerEmail: "ojohnson@logistics.com",
    category: "Feature Req",
    subject: "Dashboard",
    assigned: "Brad",
    description: "Requested custom export formatting for fleet statistics. Documented for v2.4.",
    date: "Jul 17, 2026",
  },
  {
    id: "RR-2026-00013",
    priority: "Normal",
    status: "Closed",
    customer: "J. Hess",
    customerEmail: "jhess@transport.com",
    category: "Team Mag",
    subject: "Fleet setup",
    assigned: "Damon",
    description: "Resolved: Added 5 sub-accounts for regional terminal managers.",
    date: "Jul 16, 2026",
  },
];

export const getLiveTickets = () => {
  const data = localStorage.getItem(LIVE_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(LIVE_STORAGE_KEY, JSON.stringify(defaultLiveTickets));
    return defaultLiveTickets;
  }
  try {
    return JSON.parse(data);
  } catch {
    return defaultLiveTickets;
  }
};

export const getArchivedTickets = () => {
  const data = localStorage.getItem(ARCHIVED_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(ARCHIVED_STORAGE_KEY, JSON.stringify(defaultArchivedTickets));
    return defaultArchivedTickets;
  }
  try {
    return JSON.parse(data);
  } catch {
    return defaultArchivedTickets;
  }
};

export const saveLiveTickets = (tickets) => {
  localStorage.setItem(LIVE_STORAGE_KEY, JSON.stringify(tickets));
};

export const saveArchivedTickets = (tickets) => {
  localStorage.setItem(ARCHIVED_STORAGE_KEY, JSON.stringify(tickets));
};

export const getTicketById = (ticketId) => {
  const live = getLiveTickets();
  const archived = getArchivedTickets();
  return (
    live.find((t) => t.id === ticketId) ||
    archived.find((t) => t.id === ticketId) ||
    defaultLiveTickets.find((t) => t.id === ticketId) ||
    defaultArchivedTickets.find((t) => t.id === ticketId) ||
    null
  );
};

export const updateTicketInStorage = (updatedTicket) => {
  const live = getLiveTickets();
  const archived = getArchivedTickets();

  if (live.some((t) => t.id === updatedTicket.id)) {
    const newLive = live.map((t) => (t.id === updatedTicket.id ? updatedTicket : t));
    saveLiveTickets(newLive);
    return;
  }

  if (archived.some((t) => t.id === updatedTicket.id)) {
    const newArchived = archived.map((t) => (t.id === updatedTicket.id ? updatedTicket : t));
    saveArchivedTickets(newArchived);
  }
};
