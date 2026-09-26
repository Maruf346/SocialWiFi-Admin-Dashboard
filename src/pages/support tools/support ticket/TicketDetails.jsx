import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, UserCheck, CheckCircle2, Clock } from "lucide-react";
import { getTicketById, updateTicketInStorage, getLiveTickets, saveLiveTickets, getArchivedTickets, saveArchivedTickets } from "../../../utils/ticketStorage";
import { getAdminUsers } from "../../../utils/adminUsersStorage";

const TicketDetails = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedAdminName, setSelectedAdminName] = useState("");
  const [adminUsers, setAdminUsers] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [notesList, setNotesList] = useState([]);

  useEffect(() => {
    const found = getTicketById(ticketId);
    if (found) {
      setTicket(found);
      setSelectedAdminName(found.assigned !== "-" ? found.assigned : "");
      if (found.notes && Array.isArray(found.notes)) {
        setNotesList(found.notes);
      } else {
        setNotesList([
          {
            id: 1,
            author: "System",
            time: found.date || "Jul 26, 2026",
            text: `Ticket created for ${found.customer}. Initial status: ${found.status}.`,
          },
        ]);
      }
    }
    setAdminUsers(getAdminUsers());
  }, [ticketId]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2500);
  };

  const handleToggleStatus = () => {
    if (!ticket) return;
    const isClosing = ticket.status !== "Closed";
    const nextStatus = isClosing ? "Closed" : "Open";

    const updated = {
      ...ticket,
      status: nextStatus,
    };

    setTicket(updated);

    // Update in storage and move between live/archived
    const live = getLiveTickets();
    const archived = getArchivedTickets();

    if (isClosing) {
      // Move from live to archived
      const newLive = live.filter((t) => t.id !== ticket.id);
      const newArchived = [updated, ...archived.filter((t) => t.id !== ticket.id)];
      saveLiveTickets(newLive);
      saveArchivedTickets(newArchived);
      showToast("Ticket marked as Closed and moved to Archives");
    } else {
      // Reopen to live
      const newArchived = archived.filter((t) => t.id !== ticket.id);
      const newLive = [updated, ...live.filter((t) => t.id !== ticket.id)];
      saveLiveTickets(newLive);
      saveArchivedTickets(newArchived);
      showToast("Ticket reopened and moved to Live Tickets");
    }
  };

  const handleAssignAdmin = () => {
    if (!selectedAdminName) {
      showToast("Please select an admin user");
      return;
    }
    const updated = {
      ...ticket,
      assigned: selectedAdminName,
    };
    setTicket(updated);
    updateTicketInStorage(updated);
    setNotesList((prev) => [
      ...prev,
      {
        id: Date.now(),
        author: "Admin",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        text: `Assigned ticket to ${selectedAdminName}.`,
      },
    ]);
    setAssignModalOpen(false);
    showToast(`Ticket assigned to ${selectedAdminName}`);
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const noteObj = {
      id: Date.now(),
      author: "Admin (You)",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: newNote.trim(),
    };

    const updatedNotes = [...notesList, noteObj];
    setNotesList(updatedNotes);
    setNewNote("");

    if (ticket) {
      const updated = { ...ticket, notes: updatedNotes };
      setTicket(updated);
      updateTicketInStorage(updated);
    }
    showToast("Internal note added");
  };

  if (!ticket) {
    return (
      <div className="min-h-full bg-white px-2 py-3 text-[#777] md:px-8 md:py-6">
        <button
          type="button"
          onClick={() => navigate("/dashboard/support-tickets")}
          className="mb-4 inline-flex items-center gap-1.5 text-xs text-[#1d2464] hover:underline cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to support tickets
        </button>
        <div className="py-12 text-center text-[#888]">
          <p className="text-base">Ticket not found ({ticketId})</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-white px-2 py-3 text-[#555] md:px-8 md:py-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 rounded bg-[#151d56] px-4 py-2 text-sm text-white shadow-lg transition-all">
          {toastMessage}
        </div>
      )}

      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate("/dashboard/support-tickets")}
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#ff823d] hover:underline cursor-pointer"
      >
        <ArrowLeft size={14} /> BACK TO SUPPORT TICKETS
      </button>

      {/* Header Row */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#eee] pb-4">
        <div>
          <h1 className="text-xl font-normal text-[#999] md:text-2xl">
            Ticket Details &mdash; {ticket.id}
          </h1>
          <p className="mt-1 text-xs text-[#777]">
            Subject: <strong className="text-[#333]">{ticket.subject}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setAssignModalOpen(true)}
            className="flex items-center gap-1.5 rounded border border-[#ccc] bg-[#f8f8f8] px-3 py-1.5 text-xs font-medium text-[#444] hover:bg-[#eaeaea] cursor-pointer"
          >
            <UserCheck size={14} />
            <span>Assign to Admin</span>
          </button>

          <button
            type="button"
            onClick={handleToggleStatus}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold text-white cursor-pointer ${
              ticket.status === "Closed"
                ? "bg-[#18205c] hover:bg-[#13194a]"
                : "bg-[#4f8c62] hover:bg-[#3d6e4d]"
            }`}
          >
            <CheckCircle2 size={14} />
            <span>{ticket.status === "Closed" ? "Reopen Ticket" : "Close Ticket"}</span>
          </button>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Main Info & Description & Timeline */}
        <div className="space-y-6 lg:col-span-2">
          {/* Summary Box */}
          <section className="rounded border border-[#e5e5e5] bg-[#fafafa] p-4 text-xs">
            <h2 className="mb-3 text-sm font-semibold text-[#333]">Ticket Overview</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <span className="text-[#888]">Status</span>
                <div className="mt-1">
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${
                      ticket.status === "Closed"
                        ? "bg-gray-200 text-gray-700"
                        : ticket.status === "New"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {ticket.status}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[#888]">Priority</span>
                <p className="mt-1 font-semibold text-[#333]">{ticket.priority}</p>
              </div>

              <div>
                <span className="text-[#888]">Category</span>
                <p className="mt-1 font-semibold text-[#333]">{ticket.category}</p>
              </div>

              <div>
                <span className="text-[#888]">Assigned To</span>
                <p className="mt-1 font-semibold text-[#18205c]">{ticket.assigned || "-"}</p>
              </div>
            </div>
          </section>

          {/* Issue Description */}
          <section className="rounded border border-[#e5e5e5] bg-white p-4 text-xs">
            <h2 className="mb-2 text-sm font-semibold text-[#333]">Issue Description</h2>
            <p className="leading-relaxed text-[#555]">
              {ticket.description || "Customer reported issue regarding ticket " + ticket.id + ". Full details logged from customer support correspondence."}
            </p>
          </section>

          {/* Activity & Internal Notes */}
          <section className="rounded border border-[#e5e5e5] bg-white p-4 text-xs">
            <h2 className="mb-3 text-sm font-semibold text-[#333]">Activity & Notes</h2>
            <div className="space-y-3">
              {notesList.map((note) => (
                <div key={note.id} className="rounded border border-[#f0f0f0] bg-[#fafafa] p-3">
                  <div className="mb-1 flex items-center justify-between text-[11px] text-[#888]">
                    <span className="font-semibold text-[#444]">{note.author}</span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {note.time}
                    </span>
                  </div>
                  <p className="text-[#555]">{note.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddNote} className="mt-4">
              <label htmlFor="ticket-new-note" className="mb-1 block font-semibold text-[#444]">
                Add Internal Note:
              </label>
              <textarea
                id="ticket-new-note"
                rows={3}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Type note here..."
                className="w-full rounded border border-[#ccc] p-2 text-xs outline-none focus:border-[#ff823d]"
              />
              <button
                type="submit"
                className="mt-2 rounded bg-[#ff823d] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#e06d2c] cursor-pointer"
              >
                Add Note
              </button>
            </form>
          </section>
        </div>

        {/* Right 1 Col: Customer Details */}
        <div className="space-y-6">
          <section className="rounded border border-[#e5e5e5] bg-[#fafafa] p-4 text-xs">
            <h2 className="mb-3 text-sm font-semibold text-[#333]">Customer Information</h2>
            <div className="space-y-2">
              <div>
                <span className="text-[#888]">Customer Name:</span>
                <p className="font-semibold text-[#333]">{ticket.customer}</p>
              </div>
              <div>
                <span className="text-[#888]">Email Address:</span>
                <p className="font-semibold text-[#333]">{ticket.customerEmail || "customer@example.com"}</p>
              </div>
              <div>
                <span className="text-[#888]">Date Created:</span>
                <p className="font-semibold text-[#333]">{ticket.date || "Jul 26, 2026"}</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Assign to Admin Modal */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded bg-white p-5 shadow-xl">
            <h2 className="mb-2 text-base font-bold text-[#222]">Assign Ticket to Admin</h2>
            <p className="mb-4 text-xs text-[#666]">
              Choose an admin user to assign ticket <strong>{ticket.id}</strong>:
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
                      name="selected-admin"
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
                onClick={handleAssignAdmin}
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

export default TicketDetails;
