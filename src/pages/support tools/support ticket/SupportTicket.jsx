import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { supportApi } from "../../../api/supportApi";

const PAGE_SIZE = 10;

const CATEGORY_OPTIONS = [
  ["ACCOUNT_LOGIN", "Account and Login Issues"],
  ["BILLING_SUBSCRIPTION", "Billing and Subscription Issues"],
  ["PERMIT_PROCESSING", "Permit Import and Processing"],
  ["ROUTE_NAVIGATION", "Route and Navigation Issues"],
  ["APP_TECHNICAL", "App Technical Issues"],
  ["TEAM_DRIVER", "Team and Driver Management"],
  ["ACCOUNT_CHANGES", "Account Changes and Requests"],
  ["COMPLAINT", "Complaint or Service Concern"],
  ["FEATURE_REQUEST", "Feature Request or Suggestion"],
  ["GENERAL_OTHER", "General Question or Other"],
];

const PRIORITY_OPTIONS = [
  ["LOW", "Low"],
  ["NORMAL", "Normal"],
  ["HIGH", "High"],
  ["URGENT", "Urgent"],
];

const statusClass = (status) => {
  if (status === "CLOSED" || status === "RESOLVED") return "bg-gray-200 text-gray-700";
  if (status === "NEW") return "bg-orange-100 text-orange-700";
  return "bg-blue-100 text-blue-700";
};

const normalizeTicket = (ticket) => ({
  id: ticket.id,
  ticketNumber: ticket.ticket_number || `#${ticket.id}`,
  priority: ticket.priority,
  priorityLabel: ticket.priority_display || ticket.priority,
  status: ticket.status,
  statusLabel: ticket.status_display || ticket.status,
  customer: ticket.customer_display_name || ticket.customer_name || "Unknown",
  customerEmail: ticket.customer_email || "",
  category: ticket.main_category,
  categoryLabel: ticket.category_abbrev || ticket.main_category,
  subject: ticket.subject || "-",
  assigned: ticket.assigned_to_name || "-",
});

const TicketTable = ({ title, tickets, selected, onToggle, onToggleAll, onApplyAction, onRowClick, loading, page, totalPages, count, onPageChange }) => {
  const [selectedAction, setSelectedAction] = useState("");
  const isAllSelected = tickets.length > 0 && tickets.every((ticket) => selected.includes(ticket.id));
  const start = count === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, count);

  const handleGo = () => {
    if (!selectedAction) return;
    onApplyAction(selectedAction);
    setSelectedAction("");
  };

  return (
    <section className="mt-6">
      <h2 className="mb-2 text-base font-semibold text-[#444]">{title}</h2>
      <div className="mb-2 flex items-center gap-2 text-sm">
        <span>Action:</span>
        <select value={selectedAction} onChange={(event) => setSelectedAction(event.target.value)} className="h-8 w-44 border border-[#ccc] bg-white px-2 text-xs outline-none">
          <option value="">-----------</option>
          <option value="close">Close selected</option>
          <option value="delete">Delete selected</option>
          <option value="assign">Assign to Admin</option>
        </select>
        <button type="button" onClick={handleGo} className="h-8 border border-[#ccc] bg-[#f4f4f4] px-3 text-xs hover:bg-[#e4e4e4]">Go</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr className="bg-[#f3f3f3] text-left text-xs uppercase text-[#999]">
              <th className="w-9 px-2 py-2"><input type="checkbox" checked={isAllSelected} onChange={(event) => onToggleAll(event.target.checked)} /></th>
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
            {loading ? (
              <tr><td colSpan={8} className="py-6 text-center text-[#888]">Loading tickets...</td></tr>
            ) : tickets.length === 0 ? (
              <tr><td colSpan={8} className="py-6 text-center text-[#888]">No tickets found.</td></tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket.id} onClick={() => onRowClick(ticket.id)} className="cursor-pointer border-b border-white bg-[#f8f8f8] transition-colors even:bg-[#fcfcfc] hover:bg-[#f0f3fa]">
                  <td className="px-2 py-2" onClick={(event) => event.stopPropagation()}>
                    <input type="checkbox" checked={selected.includes(ticket.id)} onChange={() => onToggle(ticket.id)} />
                  </td>
                  <td className="px-2 py-2"><button type="button" className="font-semibold underline underline-offset-2 hover:text-[#ff823d]">{ticket.ticketNumber}</button></td>
                  <td className="px-2">{ticket.priorityLabel}</td>
                  <td className="px-2"><span className={`inline-block rounded px-1.5 py-0.5 text-xs font-semibold ${statusClass(ticket.status)}`}>{ticket.statusLabel}</span></td>
                  <td className="px-2">{ticket.customer}</td>
                  <td className="px-2">{ticket.categoryLabel}</td>
                  <td className="px-2">{ticket.subject}</td>
                  <td className="px-2">{ticket.assigned}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-b border-[#eee] py-3 text-xs text-[#777]">
        <span>Showing {start}-{end} of {count} results</span>
        <span className="flex items-center gap-2">
          <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="disabled:text-[#aaa]">Previous</button>
          <span>{page} / {totalPages}</span>
          <button type="button" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className="disabled:text-[#aaa]">Next</button>
        </span>
      </div>
    </section>
  );
};

const SupportTicket = () => {
  const navigate = useNavigate();
  const [scope, setScope] = useState("live");
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [stats, setStats] = useState({ live_tickets_count: 0, archived_tickets_count: 0 });
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [assignees, setAssignees] = useState([]);

  const query = useMemo(() => ({ scope, search, main_category: category, priority, page, page_size: PAGE_SIZE }), [category, page, priority, scope, search]);
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2500);
  };

  const loadTickets = async () => {
    setLoading(true);
    try {
      const [listResponse, statsResponse] = await Promise.all([
        supportApi.listTickets(query),
        supportApi.getStats(),
      ]);
      const results = Array.isArray(listResponse?.results) ? listResponse.results : [];
      setTickets(results.map(normalizeTicket));
      setCount(Number(listResponse?.count || results.length));
      setStats(statsResponse || { live_tickets_count: 0, archived_tickets_count: 0 });
    } catch (err) {
      showToast(err.message || "Failed to load support tickets.");
      setTickets([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [query]);

  useEffect(() => {
    supportApi.listAssignees().then(setAssignees).catch(() => setAssignees([]));
  }, []);

  const toggleSelected = (id) => setSelected((current) => current.includes(id) ? current.filter((ticketId) => ticketId !== id) : [...current, id]);
  const toggleAll = (checked) => setSelected((current) => checked ? Array.from(new Set([...current, ...tickets.map((ticket) => ticket.id)])) : current.filter((id) => !tickets.some((ticket) => ticket.id === id)));

  const handleApplyAction = async (action) => {
    if (selected.length === 0) {
      showToast("No tickets selected");
      return;
    }

    if (action === "assign") {
      setAssignModalOpen(true);
      return;
    }

    try {
      if (action === "close") {
        await Promise.all(selected.map((id) => supportApi.archiveTicket(id)));
        showToast("Selected tickets closed and archived");
      } else if (action === "delete") {
        await Promise.all(selected.map((id) => supportApi.deleteTicket(id)));
        showToast("Selected tickets deleted");
      }
      setSelected([]);
      loadTickets();
    } catch (err) {
      showToast(err.message || "Action failed");
    }
  };

  const handleConfirmAssign = async () => {
    const assignee = assignees.find((item) => String(item.id) === selectedAssignee);
    if (!assignee) {
      showToast("Please choose an Admin user");
      return;
    }

    try {
      await Promise.all(selected.map((id) => supportApi.assignTicket(id, { assigned_to_id: assignee.id, assigned_name: assignee.full_name })));
      setAssignModalOpen(false);
      setSelectedAssignee("");
      setSelected([]);
      showToast(`Selected tickets assigned to ${assignee.full_name}`);
      loadTickets();
    } catch (err) {
      showToast(err.message || "Assign failed");
    }
  };

  const handleScopeChange = (nextScope) => {
    setScope(nextScope);
    setPage(1);
    setSelected([]);
  };

  return (
    <div className="min-h-full bg-white px-2 py-3 text-[#777] md:px-8 md:py-6">
      {toastMessage && <div className="fixed bottom-5 right-5 z-50 rounded bg-[#151d56] px-4 py-2 text-sm text-white shadow-lg">{toastMessage}</div>}

      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-xl font-normal text-[#999] md:text-2xl">Support tickets</h1>
        <div className="flex gap-2">
          <button type="button" onClick={loadTickets} className="rounded-full bg-[#777] px-3 py-1 text-xs text-white hover:bg-[#666]">REFRESH PAGE</button>
          <button type="button" onClick={() => navigate("/dashboard/create-ticket")} className="rounded-full bg-[#777] px-3 py-1 text-xs text-white hover:bg-[#666]">CREATE TICKET <span className="text-base font-bold">+</span></button>
        </div>
      </div>

      <div className="rounded border border-[#e5e5e5] bg-[#fafafa] px-3 py-2 text-sm">
        {stats.live_tickets_count || 0} Live Tickets &nbsp; | &nbsp; {stats.archived_tickets_count || 0} Archived
      </div>

      <div className="mt-5 flex flex-wrap items-end gap-3 text-sm">
        <label>
          Search tickets:
          <span className="ml-2 inline-flex gap-1">
            <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} className="h-8 w-56 border border-[#ccc] px-2 outline-none" />
          </span>
        </label>
        <label>
          Scope:
          <select value={scope} onChange={(event) => handleScopeChange(event.target.value)} className="ml-2 h-8 border border-[#ccc] bg-white px-2">
            <option value="live">Live</option>
            <option value="archived">Archived</option>
            <option value="draft">Draft</option>
          </select>
        </label>
        <label>
          Category:
          <select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }} className="ml-2 h-8 border border-[#ccc] bg-white px-2">
            <option value="">All categories</option>
            {CATEGORY_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label>
          Priority:
          <select value={priority} onChange={(event) => { setPriority(event.target.value); setPage(1); }} className="ml-2 h-8 border border-[#ccc] bg-white px-2">
            <option value="">All priorities</option>
            {PRIORITY_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
      </div>

      <TicketTable
        title={scope === "archived" ? "Archives" : scope === "draft" ? "Draft Tickets" : "Live Tickets"}
        tickets={tickets}
        selected={selected}
        onToggle={toggleSelected}
        onToggleAll={toggleAll}
        onApplyAction={handleApplyAction}
        onRowClick={(ticketId) => navigate(`/dashboard/support-tickets/${ticketId}`)}
        loading={loading}
        page={page}
        totalPages={totalPages}
        count={count}
        onPageChange={setPage}
      />

      {assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded bg-white p-5 shadow-xl">
            <h2 className="mb-2 text-base font-bold text-[#222]">Assign Ticket(s) to Admin</h2>
            <p className="mb-4 text-xs text-[#666]">Choose an admin user to assign <strong>{selected.length} selected ticket(s)</strong>:</p>
            <div className="max-h-60 space-y-2 overflow-y-auto border border-[#eee] p-2">
              {assignees.map((admin) => (
                <label key={admin.id} className={`flex cursor-pointer items-center justify-between rounded border p-2 text-xs transition-colors ${selectedAssignee === String(admin.id) ? "border-[#ff823d] bg-[#fff3eb]" : "border-transparent hover:bg-gray-50"}`}>
                  <div className="flex items-center gap-2">
                    <input type="radio" name="assignee-admin" checked={selectedAssignee === String(admin.id)} onChange={() => setSelectedAssignee(String(admin.id))} className="accent-[#ff823d]" />
                    <div><p className="font-semibold text-[#333]">{admin.full_name}</p><p className="text-[11px] text-[#777]">{admin.email}</p></div>
                  </div>
                </label>
              ))}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setAssignModalOpen(false)} className="rounded border border-[#ccc] px-3 py-1.5 text-xs text-[#666] hover:bg-gray-100">Cancel</button>
              <button type="button" onClick={handleConfirmAssign} className="rounded bg-[#ff823d] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#e06d2c]">Assign</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportTicket;
