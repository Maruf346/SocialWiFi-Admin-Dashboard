import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  getLiveTickets,
  getArchivedTickets,
  saveLiveTickets,
  saveArchivedTickets,
  defaultLiveTickets,
  defaultArchivedTickets,
} from "../../../utils/ticketStorage";
import { getAdminUsers } from "../../../utils/adminUsersStorage";

const TicketTable = ({
  title,
  tickets,
  selected,
  onToggle,
  onToggleAll,
  onApplyAction,
  onRowClick,
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
              <th className="px-2 py-2">Ticket ID</th>
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
                  onClick={() => onRowClick(ticket.id)}
                  className="border-b border-white bg-[#f8f8f8] even:bg-[#fcfcfc] hover:bg-[#f0f3fa] cursor-pointer transition-colors"
                >
                  <td className="px-2 py-2" onClick={(e) => e.stopPropagation()}>
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
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowClick(ticket.id);
                      }}
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
          Showing 1-{tickets.length} of {tickets.length} results
        </span>
        <span className="underline cursor-pointer">
          Previous &nbsp; 1 &nbsp; Next
        </span>
      </div>
    </section>
  );
};

const SupportTicket = () => {
  const navigate = useNavigate();
  const [live, setLive] = useState([]);
  const [archived, setArchived] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedAdminName, setSelectedAdminName] = useState("");
  const [adminUsers, setAdminUsers] = useState([]);

  useEffect(() => {
    setLive(getLiveTickets());
    setArchived(getArchivedTickets());
    setAdminUsers(getAdminUsers());
  }, []);

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
      // Find selected tickets from live and mark as Closed
      const closingFromLive = live
        .filter((t) => selected.includes(t.id))
        .map((t) => ({ ...t, status: "Closed" }));

      const remainingLive = live.filter((t) => !selected.includes(t.id));
      const updatedArchived = [
        ...closingFromLive,
        ...archived.map((t) =>
          selected.includes(t.id) ? { ...t, status: "Closed" } : t
        ),
      ];

      setLive(remainingLive);
      setArchived(updatedArchived);
      saveLiveTickets(remainingLive);
      saveArchivedTickets(updatedArchived);
      setSelected([]);
      showToast("Selected tickets marked as Closed and moved to Archives");
    } else if (action === "delete") {
      const remainingLive = live.filter((t) => !selected.includes(t.id));
      const remainingArchived = archived.filter((t) => !selected.includes(t.id));
      setLive(remainingLive);
      setArchived(remainingArchived);
      saveLiveTickets(remainingLive);
      saveArchivedTickets(remainingArchived);
      setSelected([]);
      showToast("Selected tickets deleted");
    } else if (action === "assign") {
      setAssignModalOpen(true);
    }
  };

  const handleConfirmAssign = () => {
    if (!selectedAdminName) {
      showToast("Please choose an Admin user");
      return;
    }

    const updatedLive = live.map((t) =>
      selected.includes(t.id) ? { ...t, assigned: selectedAdminName } : t
    );
    const updatedArchived = archived.map((t) =>
      selected.includes(t.id) ? { ...t, assigned: selectedAdminName } : t
    );

    setLive(updatedLive);
    setArchived(updatedArchived);
    saveLiveTickets(updatedLive);
    saveArchivedTickets(updatedArchived);
    setAssignModalOpen(false);
    showToast(`Selected tickets assigned to ${selectedAdminName}`);
  };

  const handleTicketClick = (ticketId) => {
    navigate(`/dashboard/support-tickets/${ticketId}`);
  };

  const refresh = () => {
    setLive(defaultLiveTickets);
    setArchived(defaultArchivedTickets);
    saveLiveTickets(defaultLiveTickets);
    saveArchivedTickets(defaultArchivedTickets);
    setSearch("");
    setCategory("");
    setSubcategory("");
    setSelected([]);
    showToast("Tickets refreshed to default");
  };

  return (
    <div className="min-h-full bg-white px-2 py-3 text-[#777] md:px-8 md:py-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 rounded bg-[#151d56] px-4 py-2 text-sm text-white shadow-lg transition-all">
          {toastMessage}
        </div>
      )}

      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-xl font-normal text-[#999] md:text-2xl">
          Support tickets
        </h1>
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
        onRowClick={handleTicketClick}
      />
      <TicketTable
        title="Archives"
        tickets={visibleArchived}
        selected={selected}
        onToggle={toggleSelected}
        onToggleAll={toggleAllArchived}
        onApplyAction={handleApplyAction}
        onRowClick={handleTicketClick}
      />

      {/* Assign to Admin Modal */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded bg-white p-5 shadow-xl">
            <h2 className="mb-2 text-base font-bold text-[#222]">Assign Ticket(s) to Admin</h2>
            <p className="mb-4 text-xs text-[#666]">
              Choose an admin user to assign <strong>{selected.length} selected ticket(s)</strong>:
            </p>

            <div className="max-h-60 space-y-2 overflow-y-auto border border-[#eee] p-2">
              {adminUsers.map((admin) => (
                <label
                  key={admin.id}
                  className={`flex cursor-pointer items-center justify-between rounded p-2 text-xs transition-colors ${
                    selectedAdminName === admin.name
                      ? "bg-[#fff3eb] border border-[#ff823d]"
                      : "hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="assignee-admin"
                      checked={selectedAdminName === admin.name}
                      onChange={() => setSelectedAdminName(admin.name)}
                      className="accent-[#ff823d]"
                    />
                    <div>
                      <p className="font-semibold text-[#333]">{admin.name}</p>
                      <p className="text-[11px] text-[#777]">{admin.role} &bull; {admin.email}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAssignModalOpen(false)}
                className="rounded border border-[#ccc] px-3 py-1.5 text-xs text-[#666] hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAssign}
                className="rounded bg-[#ff823d] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#e06d2c] cursor-pointer"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportTicket;
