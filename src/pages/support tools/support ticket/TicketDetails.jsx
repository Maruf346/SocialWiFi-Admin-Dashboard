import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, CheckCircle2, Clock, UserCheck } from "lucide-react";
import { supportApi } from "../../../api/supportApi";

const statusClass = (status) => {
  if (status === "CLOSED" || status === "RESOLVED") return "bg-gray-200 text-gray-700";
  if (status === "NEW") return "bg-orange-100 text-orange-700";
  return "bg-blue-100 text-blue-700";
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const normalizeTicket = (ticket) => ({
  id: ticket.id,
  ticketNumber: ticket.ticket_number || `#${ticket.id}`,
  status: ticket.status,
  statusLabel: ticket.status_display || ticket.status,
  priority: ticket.priority,
  priorityLabel: ticket.priority_display || ticket.priority,
  category: ticket.main_category,
  categoryLabel: ticket.category_abbrev || ticket.main_category,
  subcategory: ticket.subcategory || "-",
  assignedTo: ticket.assigned_to,
  assignedName: ticket.assigned_to_name || ticket.assigned_name || "-",
  subject: ticket.subject || "-",
  description: ticket.description || "-",
  customerName: ticket.customer_display_name || ticket.customer_name || "Unknown",
  customerEmail: ticket.customer_email || "-",
  phone: ticket.customer_phone || "-",
  company: ticket.company_name || "-",
  plan: ticket.plan_type || "-",
  createdAt: ticket.created_at || ticket.submitted_at,
  messages: Array.isArray(ticket.messages) ? ticket.messages : [],
  activityLogs: Array.isArray(ticket.activity_logs) ? ticket.activity_logs : [],
});

const TicketDetails = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [assignees, setAssignees] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2500);
  };

  const loadTicket = async () => {
    try {
      setLoading(true);
      const detail = await supportApi.getTicket(ticketId);
      const normalized = normalizeTicket(detail);
      setTicket(normalized);
      setSelectedAssignee(normalized.assignedTo ? String(normalized.assignedTo) : "");
    } catch (err) {
      showToast(err.message || "Failed to load ticket.");
      setTicket(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
    supportApi.listAssignees().then(setAssignees).catch(() => setAssignees([]));
  }, [ticketId]);

  const handleToggleStatus = async () => {
    if (!ticket) return;
    try {
      if (ticket.status === "CLOSED") {
        await supportApi.updateTicket(ticket.id, { status: "OPEN", main_category: ticket.category });
        showToast("Ticket reopened");
      } else {
        await supportApi.archiveTicket(ticket.id);
        showToast("Ticket closed and archived");
      }
      loadTicket();
    } catch (err) {
      showToast(err.message || "Status update failed.");
    }
  };

  const handleAssignAdmin = async () => {
    const assignee = assignees.find((item) => String(item.id) === selectedAssignee);
    if (!assignee || !ticket) {
      showToast("Please select an admin user");
      return;
    }

    try {
      await supportApi.assignTicket(ticket.id, { assigned_to_id: assignee.id, assigned_name: assignee.full_name });
      setAssignModalOpen(false);
      showToast(`Ticket assigned to ${assignee.full_name}`);
      loadTicket();
    } catch (err) {
      showToast(err.message || "Assign failed.");
    }
  };

  const handleAddNote = async (event) => {
    event.preventDefault();
    if (!newNote.trim() || !ticket) return;

    try {
      await supportApi.addMessage(ticket.id, { body: newNote.trim(), is_internal_note: true });
      setNewNote("");
      showToast("Internal note added");
      loadTicket();
    } catch (err) {
      showToast(err.message || "Failed to add note.");
    }
  };

  if (loading) {
    return <div className="min-h-full bg-white px-2 py-3 text-[#777] md:px-8 md:py-6">Loading ticket...</div>;
  }

  if (!ticket) {
    return (
      <div className="min-h-full bg-white px-2 py-3 text-[#777] md:px-8 md:py-6">
        <button type="button" onClick={() => navigate("/dashboard/support-tickets")} className="mb-4 inline-flex items-center gap-1.5 text-xs text-[#1d2464] hover:underline"><ArrowLeft size={14} /> Back to support tickets</button>
        <div className="py-12 text-center text-[#888]"><p className="text-base">Ticket not found ({ticketId})</p></div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-white px-2 py-3 text-[#555] md:px-8 md:py-6">
      {toastMessage && <div className="fixed bottom-5 right-5 z-50 rounded bg-[#151d56] px-4 py-2 text-sm text-white shadow-lg">{toastMessage}</div>}

      <button type="button" onClick={() => navigate("/dashboard/support-tickets")} className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#ff823d] hover:underline"><ArrowLeft size={14} /> BACK TO SUPPORT TICKETS</button>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#eee] pb-4">
        <div>
          <h1 className="text-xl font-normal text-[#999] md:text-2xl">Ticket Details - {ticket.ticketNumber}</h1>
          <p className="mt-1 text-xs text-[#777]">Subject: <strong className="text-[#333]">{ticket.subject}</strong></p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setAssignModalOpen(true)} className="flex items-center gap-1.5 rounded border border-[#ccc] bg-[#f8f8f8] px-3 py-1.5 text-xs font-medium text-[#444] hover:bg-[#eaeaea]"><UserCheck size={14} /><span>Assign to Admin</span></button>
          <button type="button" onClick={handleToggleStatus} className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold text-white ${ticket.status === "CLOSED" ? "bg-[#18205c] hover:bg-[#13194a]" : "bg-[#4f8c62] hover:bg-[#3d6e4d]"}`}><CheckCircle2 size={14} /><span>{ticket.status === "CLOSED" ? "Reopen Ticket" : "Close Ticket"}</span></button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded border border-[#e5e5e5] bg-[#fafafa] p-4 text-xs">
            <h2 className="mb-3 text-sm font-semibold text-[#333]">Ticket Overview</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div><span className="text-[#888]">Status</span><div className="mt-1"><span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${statusClass(ticket.status)}`}>{ticket.statusLabel}</span></div></div>
              <div><span className="text-[#888]">Priority</span><p className="mt-1 font-semibold text-[#333]">{ticket.priorityLabel}</p></div>
              <div><span className="text-[#888]">Category</span><p className="mt-1 font-semibold text-[#333]">{ticket.categoryLabel}</p></div>
              <div><span className="text-[#888]">Assigned To</span><p className="mt-1 font-semibold text-[#18205c]">{ticket.assignedName}</p></div>
            </div>
          </section>

          <section className="rounded border border-[#e5e5e5] bg-white p-4 text-xs">
            <h2 className="mb-2 text-sm font-semibold text-[#333]">Issue Description</h2>
            <p className="leading-relaxed text-[#555]">{ticket.description}</p>
          </section>

          <section className="rounded border border-[#e5e5e5] bg-white p-4 text-xs">
            <h2 className="mb-3 text-sm font-semibold text-[#333]">Activity & Notes</h2>
            <div className="space-y-3">
              {ticket.messages.length === 0 ? <p className="text-[#888]">No messages or internal notes yet.</p> : ticket.messages.map((note) => (
                <div key={note.id} className="rounded border border-[#f0f0f0] bg-[#fafafa] p-3">
                  <div className="mb-1 flex items-center justify-between text-[11px] text-[#888]"><span className="font-semibold text-[#444]">{note.sender_display || note.sender_name || "System"}</span><span className="flex items-center gap-1"><Clock size={11} /> {formatDateTime(note.created_at)}</span></div>
                  <p className="text-[#555]">{note.body}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddNote} className="mt-4">
              <label htmlFor="ticket-new-note" className="mb-1 block font-semibold text-[#444]">Add Internal Note:</label>
              <textarea id="ticket-new-note" rows={3} value={newNote} onChange={(event) => setNewNote(event.target.value)} placeholder="Type note here..." className="w-full rounded border border-[#ccc] p-2 text-xs outline-none focus:border-[#ff823d]" />
              <button type="submit" className="mt-2 rounded bg-[#ff823d] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#e06d2c]">Add Note</button>
            </form>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded border border-[#e5e5e5] bg-[#fafafa] p-4 text-xs">
            <h2 className="mb-3 text-sm font-semibold text-[#333]">Customer Information</h2>
            <div className="space-y-2">
              <div><span className="text-[#888]">Customer Name:</span><p className="font-semibold text-[#333]">{ticket.customerName}</p></div>
              <div><span className="text-[#888]">Email Address:</span><p className="font-semibold text-[#333]">{ticket.customerEmail}</p></div>
              <div><span className="text-[#888]">Phone:</span><p className="font-semibold text-[#333]">{ticket.phone}</p></div>
              <div><span className="text-[#888]">Company:</span><p className="font-semibold text-[#333]">{ticket.company}</p></div>
              <div><span className="text-[#888]">Plan:</span><p className="font-semibold text-[#333]">{ticket.plan}</p></div>
              <div><span className="text-[#888]">Date Created:</span><p className="font-semibold text-[#333]">{formatDateTime(ticket.createdAt)}</p></div>
            </div>
          </section>
        </div>
      </div>

      {assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded bg-white p-5 shadow-xl">
            <h2 className="mb-2 text-base font-bold text-[#222]">Assign Ticket to Admin</h2>
            <p className="mb-4 text-xs text-[#666]">Choose an admin user to assign ticket <strong>{ticket.ticketNumber}</strong>:</p>
            <div className="max-h-60 space-y-2 overflow-y-auto border border-[#eee] p-2">
              {assignees.map((admin) => (
                <label key={admin.id} className={`flex cursor-pointer items-center justify-between rounded border p-2 text-xs transition-colors ${selectedAssignee === String(admin.id) ? "border-[#ff823d] bg-[#fff3eb]" : "border-transparent hover:bg-gray-50"}`}>
                  <div className="flex items-center gap-2"><input type="radio" name="selected-admin" checked={selectedAssignee === String(admin.id)} onChange={() => setSelectedAssignee(String(admin.id))} className="accent-[#ff823d]" /><div><p className="font-semibold text-[#333]">{admin.full_name}</p><p className="text-[11px] text-[#777]">{admin.email}</p></div></div>
                </label>
              ))}
            </div>
            <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setAssignModalOpen(false)} className="rounded border border-[#ccc] px-3 py-1.5 text-xs text-[#666] hover:bg-gray-100">Cancel</button><button type="button" onClick={handleAssignAdmin} className="rounded bg-[#ff823d] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#e06d2c]">Assign</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetails;
