import { useState } from "react";
import { useNavigate } from "react-router";

const liveTickets = [
  [
    "RR-2026-00074",
    "High",
    "New",
    "J. Smith",
    "Route/Nav",
    "Route mismatch",
    "-",
  ],
  [
    "RR-2026-00073",
    "Normal",
    "Open",
    "A. Jones",
    "Billing/Sub",
    "Trial issue",
    "Jocelyn",
  ],
  [
    "RR-2026-00072",
    "Urgent",
    "Open",
    "J. Caulerin",
    "App Issue",
    "App crash",
    "Nahid",
  ],
  [
    "RR-2026-00071",
    "Low",
    "Open",
    "T. Allen",
    "Feature Req",
    "Offline maps",
    "Mahdi",
  ],
  [
    "RR-2026-00070",
    "Normal",
    "Open",
    "M. Erickson",
    "Acct Changes",
    "Update acct info",
    "Brad",
  ],
].map(([id, priority, status, customer, category, subject, assigned]) => ({
  id,
  priority,
  status,
  customer,
  category,
  subject,
  assigned,
}));

const archivedTickets = [
  [
    "RR-2026-00017",
    "High",
    "Closed",
    "T. Makela",
    "Route/Nav",
    "Route mismatch",
    "Mahdi",
  ],
  [
    "RR-2026-00016",
    "Normal",
    "Closed",
    "W Shatner",
    "App Issue",
    "App freezes",
    "Nahid",
  ],
  [
    "RR-2026-00015",
    "Low",
    "Closed",
    "B. Lee",
    "Gen Question",
    "Feedback",
    "Jocelyn",
  ],
  [
    "RR-2026-00014",
    "Low",
    "Closed",
    "O. Johnson",
    "Feature Req",
    "Dashboard",
    "Brad",
  ],
  [
    "RR-2026-00013",
    "Normal",
    "Closed",
    "J. Hess",
    "Team Mag",
    "Fleet setup",
    "Damon",
  ],
].map(([id, priority, status, customer, category, subject, assigned]) => ({
  id,
  priority,
  status,
  customer,
  category,
  subject,
  assigned,
}));

const LIVE_TICKETS_KEY = "socialwifi-live-tickets";

const TicketTable = ({ title, tickets, selected, onToggle }) => (
  <section className="mt-6">
    <h2 className="mb-2 text-base font-semibold text-[#444]">{title}</h2>
    <div className="mb-2 flex items-center gap-2 text-sm">
      <span>Action:</span>
      <select className="h-8 w-36 border border-[#ccc] bg-white px-2">
        <option> </option>
        <option>Close selected</option>
        <option>Assign selected</option>
      </select>
      <button
        type="button"
        onClick={() => selected.length > 0 && onToggle("action")}
        className="h-8 border border-[#ccc] bg-[#f4f4f4] px-2 text-xs cursor-pointer"
      >
        Go
      </button>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-sm">
        <thead>
          <tr className="bg-[#f3f3f3] text-left text-xs uppercase text-[#999]">
            <th className="w-9 px-2 py-2">
              <input
                type="checkbox"
                checked={
                  tickets.length > 0 &&
                  tickets.every((ticket) => selected.includes(ticket.id))
                }
                onChange={() =>
                  tickets.forEach((ticket) => onToggle(ticket.id))
                }
                aria-label={`Select all ${title.toLowerCase()}`}
              />
            </th>
            {[
              "Live tickets",
              "Priority",
              "Status",
              "Customer",
              "Category",
              "Subject",
              "Assigned",
            ].map((heading) => (
              <th key={heading} className="px-2 py-2">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr
              key={ticket.id}
              className="border-b border-white bg-[#f8f8f8] even:bg-[#fcfcfc]"
            >
              <td className="px-2 py-2">
                <input
                  type="checkbox"
                  checked={selected.includes(ticket.id)}
                  onChange={() => onToggle(ticket.id)}
                  aria-label={`Select ${ticket.id}`}
                />
              </td>
              <td className="px-2 py-2">
                <button
                  type="button"
                  className="font-semibold underline underline-offset-2   hover:text-[#ff823d] cursor-pointer"
                >
                  {ticket.id}
                </button>
              </td>
              <td className="px-2">{ticket.priority}</td>
              <td className="px-2">{ticket.status}</td>
              <td className="px-2">{ticket.customer}</td>
              <td className="px-2">{ticket.category}</td>
              <td className="px-2">{ticket.subject}</td>
              <td className="px-2">{ticket.assigned}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="flex items-center justify-between border-b border-[#eee] py-3 text-xs">
      <span>
        Showing 1-{tickets.length} of {title === "Live Tickets" ? 57 : 17}
      </span>
      <span>Previous &nbsp; 1 &nbsp; 2 &nbsp; 3 &nbsp; Next</span>
    </div>
  </section>
);

const SupportTicket = () => {
  const navigate = useNavigate();
  const [live, setLive] = useState(() => [
    ...JSON.parse(localStorage.getItem(LIVE_TICKETS_KEY) || "[]"),
    ...liveTickets,
  ]);
  const [archived] = useState(archivedTickets);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [newSubject, setNewSubject] = useState("");

  const filterTickets = (tickets) =>
    tickets.filter(
      (ticket) =>
        `${ticket.id} ${ticket.customer} ${ticket.subject}`
          .toLowerCase()
          .includes(search.toLowerCase()) &&
        (!category || ticket.category === category) &&
        (!subcategory || ticket.status === subcategory),
    );
  const visibleLive = filterTickets(live);
  const visibleArchived = filterTickets(archived);
  const toggleSelected = (id) =>
    setSelected((current) =>
      current.includes(id)
        ? current.filter((ticketId) => ticketId !== id)
        : [...current, id],
    );
  const refresh = () => {
    setLive([
      ...JSON.parse(localStorage.getItem(LIVE_TICKETS_KEY) || "[]"),
      ...liveTickets,
    ]);
    setSearch("");
    setCategory("");
    setSubcategory("");
    setSelected([]);
  };
  const createTicket = () => {
    if (!newSubject.trim()) return;
    setLive((current) => [
      {
        id: `RR-2026-${String(current.length + 75).padStart(5, "0")}`,
        priority: "Normal",
        status: "New",
        customer: "Admin",
        category: "General",
        subject: newSubject.trim(),
        assigned: "-",
      },
      ...current,
    ]);
    setNewSubject("");
    setCreateOpen(false);
  };

  return (
    <div className="min-h-full px-2 py-2 text-[#777] md:px-4 md:py-3">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-2xl font-normal text-[#999]">Support tickets</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={refresh}
            className="rounded-full bg-[#777] px-3 py-1 text-xs text-white cursor-pointer"
          >
            REFRESH PAGE
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard/create-ticket")}
            className="rounded-full bg-[#777] px-3 py-1 text-xs text-white cursor-pointer"
          >
            CREATE TICKET <span className="text-base font-bold">+</span>
          </button>
        </div>
      </div>
      <div className="rounded border border-[#e5e5e5] bg-[#fafafa] px-3 py-2 text-sm">
        57 Live Tickets &nbsp; | &nbsp; 17 Archived
      </div>
      <div className="mt-5 flex flex-wrap items-end gap-3 text-sm">
        <label>
          Search tickets:
          <span className="ml-2 inline-flex gap-1">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-8 w-56 border border-[#ccc] px-2 outline-none"
            />
            <button
              type="button"
              className="h-8 border border-[#ccc] bg-[#f4f4f4] px-2 text-xs cursor-pointer"
            >
              Go
            </button>
          </span>
        </label>
        <label>
          Filters:{" "}
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="ml-2 h-8 border border-[#ccc] bg-white px-2"
          >
            <option value="">Main Category</option>
            <option>Route/Nav</option>
            <option>Billing/Sub</option>
            <option>App Issue</option>
            <option>Feature Req</option>
          </select>
        </label>
        <select
          value={subcategory}
          onChange={(event) => setSubcategory(event.target.value)}
          className="h-8 border border-[#ccc] bg-white px-2"
        >
          <option value="">Subcategory</option>
          <option>New</option>
          <option>Open</option>
          <option>Closed</option>
        </select>
      </div>
      <TicketTable
        title="Live Tickets"
        tickets={visibleLive}
        selected={selected}
        onToggle={toggleSelected}
      />
      <TicketTable
        title="Archives"
        tickets={visibleArchived}
        selected={selected}
        onToggle={toggleSelected}
      />
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded border border-[#ccc] bg-white p-5 shadow-lg"
          >
            <h2 className="text-lg font-semibold text-[#444]">Create ticket</h2>
            <label className="mt-4 block text-sm">
              Subject
              <input
                autoFocus
                value={newSubject}
                onChange={(event) => setNewSubject(event.target.value)}
                className="mt-1 h-9 w-full border border-[#ccc] px-2"
              />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="border border-[#bbb] px-3 py-2 text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={createTicket}
                className="rounded bg-[#ff823d] px-3 py-2 text-sm font-semibold text-white cursor-pointer"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportTicket;
