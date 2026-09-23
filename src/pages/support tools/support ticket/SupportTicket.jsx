import { useState } from "react";
import { useNavigate } from "react-router";

const initialLiveTickets = [
  {
    id: "RR-2026-00074",
    priority: "High",
    status: "New",
    customer: "J. Smith",
    category: "Route/Nav",
    subject: "Route mismatch",
    assigned: "-",
  },
  {
    id: "RR-2026-00073",
    priority: "Normal",
    status: "Open",
    customer: "A. Jones",
    category: "Billing/Sub",
    subject: "Trial issue",
    assigned: "Jocelyn",
  },
  {
    id: "RR-2026-00072",
    priority: "Urgent",
    status: "Open",
    customer: "J. Caulerin",
    category: "App Issue",
    subject: "App crash",
    assigned: "Nahid",
  },
  {
    id: "RR-2026-00071",
    priority: "Low",
    status: "Open",
    customer: "T. Allen",
    category: "Feature Req",
    subject: "Offline maps",
    assigned: "Mahdi",
  },
  {
    id: "RR-2026-00070",
    priority: "Normal",
    status: "Open",
    customer: "M. Erickson",
    category: "Acct Changes",
    subject: "Update acct info",
    assigned: "Brad",
  },
];

const initialArchivedTickets = [
  {
    id: "RR-2026-00017",
    priority: "High",
    status: "Closed",
    customer: "T. Makela",
    category: "Route/Nav",
    subject: "Route mismatch",
    assigned: "Mahdi",
  },
  {
    id: "RR-2026-00016",
    priority: "Normal",
    status: "Closed",
    customer: "W Shatner",
    category: "App Issue",
    subject: "App freezes",
    assigned: "Nahid",
  },
  {
    id: "RR-2026-00015",
    priority: "Low",
    status: "Closed",
    customer: "B. Lee",
    category: "Gen Question",
    subject: "Feedback",
    assigned: "Jocelyn",
  },
  {
    id: "RR-2026-00014",
    priority: "Low",
    status: "Closed",
    customer: "O. Johnson",
    category: "Feature Req",
    subject: "Dashboard",
    assigned: "Brad",
  },
  {
    id: "RR-2026-00013",
    priority: "Normal",
    status: "Closed",
    customer: "J. Hess",
    category: "Team Mag",
    subject: "Fleet setup",
    assigned: "Damon",
  },
];

const TicketTable = ({
  title,
  tickets,
  selected,
  onToggle,
  onToggleAll,
  onApplyAction,
}) => {
  const [selectedAction, setSelectedAction] = useState("");

  const handleGo = () => {
    if (!selectedAction) return;
    onApplyAction(selectedAction);
    setSelectedAction("");
  };

  const isAllSelected =
    tickets.length > 0 && tickets.every((t) => selected.includes(t.id));

  return (
    <section className="mt-6">
      <h2 className="mb-2 text-base font-semibold text-[#444]">{title}</h2>
      <div className="mb-2 flex items-center gap-2 text-sm">
        <span>Action:</span>
        <select
          value={selectedAction}
          onChange={(e) => setSelectedAction(e.target.value)}
          className="h-8 w-44 border border-[#ccc] bg-white px-2 text-xs outline-none"
        >
          <option value="">-----------</option>
          <option value="close">Close selected</option>
          <option value="delete">Delete selected</option>
          <option value="assign">Assign to Admin</option>
        </select>
        <button
          type="button"
          onClick={handleGo}
          className="h-8 border border-[#ccc] bg-[#f4f4f4] px-3 text-xs hover:bg-[#e4e4e4] cursor-pointer"
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
                  checked={isAllSelected}
                  onChange={(e) => onToggleAll(e.target.checked)}
                  aria-label={`Select all ${title.toLowerCase()}`}
                />
              </th>
              <th className="px-2 py-2">Live tickets</th>
              <th className="px-2 py-2">Priority</th>
              <th className="px-2 py-2">Status</th>
              <th className="px-2 py-2">Customer</th>
              <th className="px-2 py-2">Category</th>
              <th className="px-2 py-2">Subject</th>
              <th className="px-2 py-2">Assigned</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-6 text-center text-[#888]">
                  No tickets found.
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
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
                      className="font-semibold underline underline-offset-2 hover:text-[#ff823d] cursor-pointer"
                    >
                      {ticket.id}
                    </button>
                  </td>
                  <td className="px-2">{ticket.priority}</td>
                  <td className="px-2">
                    <span
                      className={`inline-block rounded px-1.5 py-0.5 text-xs font-semibold ${
                        ticket.status === "Closed"
                          ? "bg-gray-200 text-gray-700"
                          : ticket.status === "New"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-2">{ticket.customer}</td>
                  <td className="px-2">{ticket.category}</td>
                  <td className="px-2">{ticket.subject}</td>
                  <td className="px-2">{ticket.assigned}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-b border-[#eee] py-3 text-xs text-[#777]">
        <span>
          Showing 1-{tickets.length} of {title === "Live Tickets" ? 57 : 17}
        </span>
        <span className="underline cursor-pointer">
          Previous &nbsp; 1 &nbsp; 2 &nbsp; 3 &nbsp; Next
        </span>
      </div>
    </section>
  );
};

const SupportTicket = () => {
  const navigate = useNavigate();
  const [live, setLive] = useState(initialLiveTickets);
  const [archived, setArchived] = useState(initialArchivedTickets);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2500);
  };

  const filterTickets = (tickets) =>
    tickets.filter(
      (ticket) =>
        `${ticket.id} ${ticket.customer} ${ticket.subject}`
          .toLowerCase()
          .includes(search.toLowerCase()) &&
        (!category || ticket.category === category) &&
        (!subcategory || ticket.status === subcategory)
    );

  const visibleLive = filterTickets(live);
  const visibleArchived = filterTickets(archived);

  const toggleSelected = (id) =>
    setSelected((current) =>
      current.includes(id)
        ? current.filter((ticketId) => ticketId !== id)
        : [...current, id]
    );

  const toggleAllLive = (checked) => {
    if (checked) {
      setSelected((prev) =>
        Array.from(new Set([...prev, ...visibleLive.map((t) => t.id)]))
      );
    } else {
      setSelected((prev) =>
        prev.filter((id) => !visibleLive.some((t) => t.id === id))
      );
    }
  };

  const toggleAllArchived = (checked) => {
    if (checked) {
      setSelected((prev) =>
        Array.from(new Set([...prev, ...visibleArchived.map((t) => t.id)]))
      );
    } else {
      setSelected((prev) =>
        prev.filter((id) => !visibleArchived.some((t) => t.id === id))
      );
    }
  };

  const handleApplyAction = (action) => {
    if (selected.length === 0) {
      showToast("No tickets selected");
      return;
    }

    if (action === "close") {
      setLive((prev) =>
        prev.map((t) =>
          selected.includes(t.id) ? { ...t, status: "Closed" } : t
        )
      );
      showToast("Selected tickets marked as Closed");
    } else if (action === "delete") {
      setLive((prev) => prev.filter((t) => !selected.includes(t.id)));
      setArchived((prev) => prev.filter((t) => !selected.includes(t.id)));
      setSelected([]);
      showToast("Selected tickets deleted");
    } else if (action === "assign") {
      setLive((prev) =>
        prev.map((t) =>
          selected.includes(t.id) ? { ...t, assigned: "Admin" } : t
        )
      );
      showToast("Selected tickets assigned to Admin");
    }
  };

  const refresh = () => {
    setLive(initialLiveTickets);
    setArchived(initialArchivedTickets);
    setSearch("");
    setCategory("");
    setSubcategory("");
    setSelected([]);
    showToast("Tickets refreshed");
  };

  return (
    <div className="min-h-full px-2 py-2 text-[#777] md:px-4 md:py-3">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 rounded bg-[#151d56] px-4 py-2 text-sm text-white shadow-lg transition-all">
          {toastMessage}
        </div>
      )}

      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-2xl font-normal text-[#999]">Support tickets</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={refresh}
            className="rounded-full bg-[#777] px-3 py-1 text-xs text-white hover:bg-[#666] cursor-pointer"
          >
            REFRESH PAGE
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard/create-ticket")}
            className="rounded-full bg-[#777] px-3 py-1 text-xs text-white hover:bg-[#666] cursor-pointer"
          >
            CREATE TICKET <span className="text-base font-bold">+</span>
          </button>
        </div>
      </div>

      <div className="rounded border border-[#e5e5e5] bg-[#fafafa] px-3 py-2 text-sm">
        {live.length} Live Tickets &nbsp; | &nbsp; {archived.length} Archived
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
        onToggleAll={toggleAllLive}
        onApplyAction={handleApplyAction}
      />
      <TicketTable
        title="Archives"
        tickets={visibleArchived}
        selected={selected}
        onToggle={toggleSelected}
        onToggleAll={toggleAllArchived}
        onApplyAction={handleApplyAction}
      />
    </div>
  );
};

export default SupportTicket;
