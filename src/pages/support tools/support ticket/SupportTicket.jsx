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
const STATUS_OPTIONS = [["NEW", "New"], ["OPEN", "Open"], ["WAITING_CUSTOMER", "Waiting for Customer"], ["WAITING_INTERNAL", "Waiting for Internal Team"], ["RESOLVED", "Resolved"], ["CLOSED", "Closed"]];

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
        <button type="button" onClick={handleGo} className="h-8 border border-[#ccc] bg-[#f4f4f4] px-3 text-xs hover:bg-[#e4e4e4] cursor-pointer">Go</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr className="bg-[#f3f3f3] text-left text-xs uppercase text-[#999]">
              <th className="w-9 px-2 py-2"><input type="checkbox" checked={isAllSelected} onChange={(event) => onToggleAll(event.target.checked)} aria-label={`Select all ${title.toLowerCase()}`} /></th>
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
                <tr key={ticket.id} onClick={() => onRowClick(ticket.id)} className="border-b border-white bg-[#f8f8f8] even:bg-[#fcfcfc] hover:bg-[#f0f3fa] cursor-pointer transition-colors">
                  <td className="px-2 py-2" onClick={(event) => event.stopPropagation()}><input type="checkbox" checked={selected.includes(ticket.id)} onChange={() => onToggle(ticket.id)} aria-label={`Select ${ticket.ticketNumber}`} /></td>
                  <td className="px-2 py-2"><button type="button" onClick={(event) => { event.stopPropagation(); onRowClick(ticket.id); }} className="font-semibold underline underline-offset-2 hover:text-[#ff823d] cursor-pointer">{ticket.ticketNumber}</button></td>
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
        <span className="flex items-center gap-2 underline cursor-pointer">
          <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="disabled:text-[#aaa]">Previous</button>
          <span>{page}</span>
          <button type="button" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className="disabled:text-[#aaa]">Next</button>
        </span>
      </div>
    </section>
  );
};

const SupportTicket = () => {
  const navigate = useNavigate();
  const [live, setLive] = useState([]);
  const [archived, setArchived] = useState([]);
  const [liveCount, setLiveCount] = useState(0);
  const [archivedCount, setArchivedCount] = useState(0);
  const [livePage, setLivePage] = useState(1);
  const [archivedPage, setArchivedPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [assignees, setAssignees] = useState([]);
  const [stats, setStats] = useState({ live_tickets_count: 0, archived_tickets_count: 0 });
  const [loading, setLoading] = useState(true);

  const liveTotalPages = Math.max(1, Math.ceil(liveCount / PAGE_SIZE));
  const archivedTotalPages = Math.max(1, Math.ceil(archivedCount / PAGE_SIZE));

  const baseQuery = useMemo(() => ({ search, main_category: category }), [category, search]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2500);
  };

  const applyClientStatusFilter = (items) => (status ? items.filter((ticket) => ticket.status === status) : items);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const [liveResponse, archivedResponse, statsResponse] = await Promise.all([
        supportApi.listTickets({ ...baseQuery, scope: "live", page: livePage, page_size: PAGE_SIZE }),
        supportApi.listTickets({ ...baseQuery, scope: "archived", page: archivedPage, page_size: PAGE_SIZE }),
        supportApi.getStats(),
      ]);
      const liveResults = (Array.isArray(liveResponse?.results) ? liveResponse.results : []).map(normalizeTicket);
      const archivedResults = (Array.isArray(archivedResponse?.results) ? archivedResponse.results : []).map(normalizeTicket);
      setLive(applyClientStatusFilter(liveResults));
      setArchived(applyClientStatusFilter(archivedResults));
      setLiveCount(Number(liveResponse?.count || liveResults.length));
      setArchivedCount(Number(archivedResponse?.count || archivedResults.length));
      setStats(statsResponse || { live_tickets_count: 0, archived_tickets_count: 0 });
    } catch (err) {
      showToast(err.message || "Failed to load support tickets.");
      setLive([]);
      setArchived([]);
      setLiveCount(0);
      setArchivedCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [baseQuery, livePage, archivedPage, status]);

  useEffect(() => {
    supportApi.listAssignees().then(setAssignees).catch(() => setAssignees([]));
  }, []);

  const toggleSelected = (id) => setSelected((current) => current.includes(id) ? current.filter((ticketId) => ticketId !== id) : [...current, id]);
  const toggleAllLive = (checked) => setSelected((current) => checked ? Array.from(new Set([...current, ...live.map((ticket) => ticket.id)])) : current.filter((id) => !live.some((ticket) => ticket.id === id)));
  const toggleAllArchived = (checked) => setSelected((current) => checked ? Array.from(new Set([...current, ...archived.map((ticket) => ticket.id)])) : current.filter((id) => !archived.some((ticket) => ticket.id === id)));

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
        showToast("Selected tickets marked as Closed and moved to Archives");
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

  const refresh = () => {
    setSearch("");
    setCategory("");
    setStatus("");
    setSelected([]);
    setLivePage(1);
    setArchivedPage(1);
    loadTickets();
  };

  return (
    <div className="min-h-full bg-white px-2 py-3 text-[#777] md:px-8 md:py-6">
      {toastMessage && <div className="fixed bottom-5 right-5 z-50 rounded bg-[#151d56] px-4 py-2 text-sm text-white shadow-lg transition-all">{toastMessage}</div>}

      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-xl font-normal text-[#999] md:text-2xl">Support tickets</h1>
        <div className="flex gap-2">
          <button type="button" onClick={refresh} className="rounded-full bg-[#777] px-3 py-1 text-xs text-white hover:bg-[#666] cursor-pointer">REFRESH PAGE</button>
          <button type="button" onClick={() => navigate("/dashboard/create-ticket")} className="rounded-full bg-[#777] px-3 py-1 text-xs text-white hover:bg-[#666] cursor-pointer">CREATE TICKET <span className="text-base font-bold">+</span></button>
        </div>
      </div>

      <div className="rounded border border-[#e5e5e5] bg-[#fafafa] px-3 py-2 text-sm">{stats.live_tickets_count || 0} Live Tickets &nbsp; | &nbsp; {stats.archived_tickets_count || 0} Archived</div>

      <div className="mt-5 flex flex-wrap items-end gap-3 text-sm">
        <label>Search tickets:<span className="ml-2 inline-flex gap-1"><input value={search} onChange={(event) => { setSearch(event.target.value); setLivePage(1); setArchivedPage(1); }} className="h-8 w-56 border border-[#ccc] px-2 outline-none" /><button type="button" onClick={loadTickets} className="h-8 border border-[#ccc] bg-[#f4f4f4] px-2 text-xs cursor-pointer">Go</button></span></label>
        <label>Filters:{" "}<select value={category} onChange={(event) => { setCategory(event.target.value); setLivePage(1); setArchivedPage(1); }} className="ml-2 h-8 border border-[#ccc] bg-white px-2"><option value="">Main Category</option>{CATEGORY_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <select value={status} onChange={(event) => { setStatus(event.target.value); setLivePage(1); setArchivedPage(1); }} className="h-8 border border-[#ccc] bg-white px-2"><option value="">Subcategory</option>{STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      </div>

      <TicketTable title="Live Tickets" tickets={live} selected={selected} onToggle={toggleSelected} onToggleAll={toggleAllLive} onApplyAction={handleApplyAction} onRowClick={(ticketId) => navigate(`/dashboard/support-tickets/${ticketId}`)} loading={loading} page={livePage} totalPages={liveTotalPages} count={liveCount} onPageChange={setLivePage} />
      <TicketTable title="Archives" tickets={archived} selected={selected} onToggle={toggleSelected} onToggleAll={toggleAllArchived} onApplyAction={handleApplyAction} onRowClick={(ticketId) => navigate(`/dashboard/support-tickets/${ticketId}`)} loading={loading} page={archivedPage} totalPages={archivedTotalPages} count={archivedCount} onPageChange={setArchivedPage} />

      {assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded bg-white p-5 shadow-xl">
            <h2 className="mb-2 text-base font-bold text-[#222]">Assign Ticket(s) to Admin</h2>
            <p className="mb-4 text-xs text-[#666]">Choose an admin user to assign <strong>{selected.length} selected ticket(s)</strong>:</p>
            <div className="max-h-60 space-y-2 overflow-y-auto border border-[#eee] p-2">
              {assignees.map((admin) => <label key={admin.id} className={`flex cursor-pointer items-center justify-between rounded p-2 text-xs transition-colors ${selectedAssignee === String(admin.id) ? "bg-[#fff3eb] border border-[#ff823d]" : "hover:bg-gray-50 border border-transparent"}`}><div className="flex items-center gap-2"><input type="radio" name="assignee-admin" checked={selectedAssignee === String(admin.id)} onChange={() => setSelectedAssignee(String(admin.id))} className="accent-[#ff823d]" /><div><p className="font-semibold text-[#333]">{admin.full_name}</p><p className="text-[11px] text-[#777]">{admin.email}</p></div></div></label>)}
            </div>
            <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setAssignModalOpen(false)} className="rounded border border-[#ccc] px-3 py-1.5 text-xs text-[#666] hover:bg-gray-100 cursor-pointer">Cancel</button><button type="button" onClick={handleConfirmAssign} className="rounded bg-[#ff823d] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#e06d2c] cursor-pointer">Assign</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportTicket;
