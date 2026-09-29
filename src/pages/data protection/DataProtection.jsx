import { useEffect, useMemo, useState } from "react";
import { dataProtectionApi } from "../../api/dataProtectionApi";

const requestGroups = [
  { title: "New Requests", status: "NEW", columns: ["CUSTOMER NAME & EMAIL", "REQUEST TYPE", "", ""] },
  { title: "Pending Approval", status: "PENDING_APPROVAL", columns: ["CUSTOMER NAME & EMAIL", "REQUEST TYPE", "APP EMAIL SENT DATE", ""] },
  { title: "Completed Requests", status: "COMPLETED", columns: ["CUSTOMER NAME & EMAIL", "REQUEST TYPE", "COMPLETION DATE", ""] },
];

const fieldGroups = [
  ["Customer name", "Verified account email"],
  ["User ID", "Account status"],
  ["Plan type", "Account creation date"],
  ["Phone number", "Request type"],
];

const requestTypeOptions = [
  ["EXPORT", "Export User Data"],
  ["DELETE", "Delete User Data"],
  ["ANONYMIZE", "Anonymize User Data"],
  ["DELETE_ANONYMIZE", "Delete and Anonymize Retained Data"],
];

const sourceOptions = [
  ["PHONE", "Phone"],
  ["EMAIL", "Email"],
  ["WRITTEN", "Written Request"],
  ["OTHER", "Other"],
];

const requestDescriptions = {
  EXPORT: "The customer is requesting a copy of the personal information RightRoute maintains about their account. Once approved, RightRoute will create a secure export package for the verified email address associated with the account.",
  DELETE: "The customer is requesting deletion of personal information associated with their RightRoute account where deletion is permitted. Limited records may be retained where required by law or approved retention policy.",
  ANONYMIZE: "The customer is requesting that RightRoute permanently remove or transform identifying information connected with their records while retaining approved operational records.",
  DELETE_ANONYMIZE: "The customer is requesting that RightRoute delete personal information that is no longer required and remove identifying information from records retained for approved reasons.",
};

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const toDateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10);
};

const normalizeRequestRow = (request) => ({
  id: request.id,
  requestId: request.request_id,
  customerName: request.customer_name || "Unknown customer",
  customerEmail: request.customer_email || "",
  requestType: request.request_type,
  requestTypeLabel: request.request_type_display || request.request_type || "Not selected",
  approvalEmailSentAt: request.approval_email_sent_at,
  completedAt: request.completed_at,
  dateRequested: request.date_requested,
});

const detailToAccount = (detail) => ({
  "Customer name": detail.customer_name || "",
  "Verified account email": detail.customer_email || "",
  "User ID": detail.customer_user || "",
  "Plan type": detail.plan_type || "",
  "Account status": detail.account_status || "",
  "Account creation date": formatDate(detail.account_created_at),
  "Phone number": detail.phone_number || "",
});

const customerToAccount = (customer, fallbackEmail) => ({
  "Customer name": customer.customer_name || "",
  "Verified account email": customer.verified_email || fallbackEmail || "",
  "User ID": customer.user_id || "",
  "Plan type": customer.plan_type || "",
  "Account status": customer.account_status || "",
  "Account creation date": formatDate(customer.account_created_at),
  "Phone number": customer.phone_number || "",
});

const DataProtection = () => {
  const administratorName = "Admin";
  const [backendId, setBackendId] = useState(null);
  const [requestId, setRequestId] = useState("");
  const [requestedAt, setRequestedAt] = useState(() => new Date().toLocaleString());
  const [requestType, setRequestType] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [account, setAccount] = useState(null);
  const [accountNotFound, setAccountNotFound] = useState(false);
  const [warnings, setWarnings] = useState([]);
  const [source, setSource] = useState("OTHER");
  const [sourceOther, setSourceOther] = useState("");
  const [approvalReceived, setApprovalReceived] = useState(false);
  const [approvalSource, setApprovalSource] = useState("");
  const [approvalSourceChecked, setApprovalSourceChecked] = useState(false);
  const [approvalDate, setApprovalDate] = useState("");
  const [approvalDateChecked, setApprovalDateChecked] = useState(false);
  const [confirmation, setConfirmation] = useState(false);
  const [notes, setNotes] = useState("");
  const [savedNotes, setSavedNotes] = useState("");
  const [eventLog, setEventLog] = useState([]);
  const [requestLists, setRequestLists] = useState({ NEW: [], PENDING_APPROVAL: [], COMPLETED: [] });
  const [activeFormOpen, setActiveFormOpen] = useState(true);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [approvalEmailSent, setApprovalEmailSent] = useState(false);
  const [performOpen, setPerformOpen] = useState(false);
  const [exportResultOpen, setExportResultOpen] = useState(false);
  const [exportResult, setExportResult] = useState(null);
  const [requestProcessed, setRequestProcessed] = useState(false);
  const [completionOpen, setCompletionOpen] = useState(false);
  const [message, setMessage] = useState("");

  const checksComplete = approvalReceived && approvalSourceChecked && approvalSource.trim() && approvalDateChecked && approvalDate.trim() && confirmation;
  const pendingReady = Boolean(backendId && account?.["Verified account email"] && requestType && approvalEmailSent);
  const completionReady = Boolean(backendId && checksComplete && requestProcessed && (requestType !== "EXPORT" || exportResult));

  const requestTypeLabel = useMemo(() => requestTypeOptions.find(([value]) => value === requestType)?.[1] || requestType, [requestType]);

  const loadRequestLists = async () => {
    const entries = await Promise.all(
      requestGroups.map(async (group) => {
        const response = await dataProtectionApi.list({ status: group.status, page_size: 4 });
        const results = Array.isArray(response) ? response : response?.results || [];
        return [group.status, results.map(normalizeRequestRow)];
      }),
    );
    setRequestLists(Object.fromEntries(entries));
  };

  const generateRequestId = async () => {
    try {
      const response = await dataProtectionApi.generateId();
      setRequestId(response?.request_id || "");
    } catch {
      setRequestId(`DR-${new Date().getFullYear()}-NEW`);
    }
  };

  useEffect(() => {
    generateRequestId();
    loadRequestLists().catch((error) => setMessage(error.message || "Failed to load data protection requests."));
  }, []);

  const buildPayload = () => ({
    request_id: requestId,
    date_requested: new Date(requestedAt).toISOString(),
    customer_email: account?.["Verified account email"] || customerEmail.trim(),
    customer_user: account?.["User ID"] || null,
    customer_name: account?.["Customer name"] || "",
    plan_type: account?.["Plan type"] || "",
    account_status: account?.["Account status"] || "",
    account_created_at: account?.["Account creation date"] ? new Date(account["Account creation date"]).toISOString() : null,
    phone_number: account?.["Phone number"] || "",
    source,
    source_other_detail: sourceOther,
    request_type: requestType,
    approval_received: approvalReceived,
    approval_source: approvalSource,
    approval_received_date: approvalDate || null,
    admin_confirmed: confirmation,
  });

  const applyDetail = (detail) => {
    setBackendId(detail.id);
    setRequestId(detail.request_id || "");
    setRequestedAt(formatDateTime(detail.date_requested));
    setCustomerEmail(detail.customer_email || "");
    setAccount(detailToAccount(detail));
    setRequestType(detail.request_type || "");
    setSource(detail.source || "OTHER");
    setSourceOther(detail.source_other_detail || "");
    setApprovalReceived(Boolean(detail.approval_received));
    setApprovalSource(detail.approval_source || "");
    setApprovalSourceChecked(Boolean(detail.approval_source));
    setApprovalDate(toDateInput(detail.approval_received_date));
    setApprovalDateChecked(Boolean(detail.approval_received_date));
    setConfirmation(Boolean(detail.admin_confirmed));
    setApprovalEmailSent(Boolean(detail.approval_email_sent_at));
    setRequestProcessed(Boolean(detail.performed_at));
    setExportResult(detail.export_zip_created_at ? { createdAt: formatDate(detail.export_zip_created_at), expiresAt: formatDate(detail.export_zip_expires_at), size: detail.export_zip_size } : null);
    setWarnings((detail.warnings || []).map((warning) => ({ title: warning, detail: warning })));
    setEventLog((detail.notes || []).map((note) => ({ id: note.id, savedAt: formatDateTime(note.created_at), administrator: note.written_by_name || note.written_by_email || "System", note: note.body })));
    setActiveFormOpen(true);
  };

  const saveNoteToEventLog = async () => {
    if (!notes.trim()) return;
    try {
      if (backendId) {
        const note = await dataProtectionApi.addNote(backendId, notes.trim());
        setEventLog((current) => [{ id: note.id, savedAt: formatDateTime(note.created_at), administrator: note.written_by_name || administratorName, note: note.body }, ...current]);
      } else {
        setEventLog((current) => [{ id: requestId, savedAt: new Date().toLocaleString(), administrator: administratorName, note: notes.trim() }, ...current]);
      }
      setSavedNotes(notes.trim());
      setNotes("");
    } catch (error) {
      setMessage(error.message || "Failed to save note.");
    }
  };

  const saveAsNew = async () => {
    try {
      const detail = backendId ? await dataProtectionApi.update(backendId, buildPayload()) : await dataProtectionApi.create(buildPayload());
      applyDetail(detail);
      await loadRequestLists();
      setMessage("Request saved as New Request.");
    } catch (error) {
      setMessage(error.message || "Failed to save request.");
    }
  };

  const sendCustomerEmail = async () => {
    if (!emailMessage.trim() || !backendId) return;
    try {
      await dataProtectionApi.emailCustomer(backendId, emailMessage.trim());
      const detail = await dataProtectionApi.retrieve(backendId);
      applyDetail(detail);
      setEmailMessage("");
      setEmailOpen(false);
      setApprovalEmailSent(true);
      setMessage("Approval email sent.");
    } catch (error) {
      setMessage(error.message || "Failed to send email.");
    }
  };

  const findCustomer = async () => {
    const email = customerEmail.trim().toLowerCase();
    try {
      const result = await dataProtectionApi.findCustomer(email);
      if (!result?.found) {
        setAccount(null);
        setAccountNotFound(true);
        setWarnings([]);
        setMessage(result?.message || "No RightRoute account was found for this email.");
        return;
      }
      setAccount(customerToAccount(result, email));
      setAccountNotFound(false);
      setWarnings([]);
    } catch (error) {
      setMessage(error.message || "Customer lookup failed.");
    }
  };

  const openRequest = async (row) => {
    try {
      const detail = await dataProtectionApi.retrieve(row.id);
      applyDetail(detail);
    } catch (error) {
      setMessage(error.message || "Failed to open request.");
    }
  };

  const saveAsPendingApproval = async () => {
    if (!pendingReady) return;
    try {
      await dataProtectionApi.update(backendId, buildPayload());
      const detail = await dataProtectionApi.saveAsPending(backendId);
      applyDetail(detail);
      await loadRequestLists();
      setActiveFormOpen(false);
      setMessage("Request moved to Pending Approval.");
    } catch (error) {
      setMessage(error.message || "Failed to move request to pending approval.");
    }
  };

  const performApprovedRequest = async () => {
    try {
      await dataProtectionApi.update(backendId, buildPayload());
      const detail = await dataProtectionApi.perform(backendId);
      applyDetail(detail);
      setPerformOpen(false);
      setRequestProcessed(true);
      if (detail.export_zip_created_at) {
        setExportResult({ createdAt: formatDate(detail.export_zip_created_at), expiresAt: formatDate(detail.export_zip_expires_at), size: detail.export_zip_size });
        setExportResultOpen(true);
      }
      setMessage("Approved request performed.");
    } catch (error) {
      setMessage(error.message || "Failed to perform request.");
    }
  };

  const sendCompletionEmail = async () => {
    try {
      const detail = await dataProtectionApi.sendCompletionEmail(backendId);
      applyDetail(detail);
      await loadRequestLists();
      setCompletionOpen(false);
      setActiveFormOpen(false);
      setMessage("Completion email sent and request closed.");
    } catch (error) {
      setMessage(error.message || "Failed to send completion email.");
    }
  };

  const requestRows = (status) => requestLists[status] || [];

  return (
    <main className="data-protection-page min-h-full bg-white px-2 py-3 text-sm text-[#777] md:px-8 md:py-6">
      <h1 className="mb-8 text-xl font-normal text-[#999] md:text-2xl">Data protection</h1>
      {message && <div className="mb-3 rounded border border-[#ddd] bg-[#fafafa] px-3 py-2 text-xs text-[#555]">{message}</div>}
      <div className="grid gap-4 xl:grid-cols-[1fr_1.08fr]">
        {activeFormOpen && <section className="min-w-0 rounded border border-[#ddd] p-3">
          <div className="mb-3 flex items-center justify-between border-b border-[#ddd] pb-2"><h2 className="font-bold text-[#333]">Active Request Form</h2><span className="text-[9px] text-[#444]">ID: {requestId}&nbsp;&nbsp; Date Requested: {requestedAt}</span></div>
          <div className="mb-3 grid grid-cols-2 gap-3">
            <label className="block font-semibold">Customer email<span className="mt-1 flex"><input value={customerEmail} onChange={(event) => { setCustomerEmail(event.target.value); setWarnings([]); setAccount(null); setAccountNotFound(false); }} className="h-7 min-w-0 flex-1 border border-[#ddd] px-2 font-normal outline-none" placeholder="Enter email and click Find" /><button type="button" onClick={findCustomer} className="ml-1 h-7 border border-[#ccc] bg-[#f4f4f4] px-2">Find</button></span>{accountNotFound && <span className="mt-1 block font-normal text-red-600">No RightRoute account was found for this email.</span>}</label>
            <div className="text-[10px] font-semibold text-red-600"><span className="text-sm">Warning</span>{warnings.map((warning) => <p key={warning.title} className="mt-1 leading-tight"><strong>{warning.title}</strong><br /><span className="font-normal">{warning.detail}</span></p>)}</div>
          </div>
          <div className="mb-3 grid grid-cols-2 gap-3"><label className="font-semibold">Source of request<select value={source} onChange={(event) => setSource(event.target.value)} className="mt-1 h-7 w-full border border-[#ddd] bg-white px-2 font-normal">{sourceOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><input disabled={source !== "OTHER"} value={sourceOther} onChange={(event) => setSourceOther(event.target.value)} className="mt-5 h-7 border border-[#ddd] px-2 font-normal disabled:bg-[#f5f5f5] disabled:text-[#aaa]" placeholder="Describe request source" /></div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2">{fieldGroups.flatMap((group) => group).map((label) => <label key={label} className="font-semibold">{label}{label === "Request type" ? <select value={requestType} onChange={(event) => setRequestType(event.target.value)} className="mt-1 h-7 w-full border border-[#ddd] bg-white px-2 font-normal"><option value="">Select request type</option>{requestTypeOptions.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select> : <input value={account?.[label] || ""} readOnly className="mt-1 h-7 w-full border border-[#ddd] px-2 font-normal" />}</label>)}</div>
          {requestType && <div className="mt-3 border-t border-[#ddd] pt-2"><h3 className="mb-1 font-semibold">{requestTypeLabel}</h3><p className="leading-tight">{requestDescriptions[requestType]}</p></div>}
          <label className="mt-3 block font-semibold">New notes and correspondence<span className="relative mt-1 block"><textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="h-[96px] w-full resize-none border border-[#ddd] p-2 pb-9 font-normal" placeholder="Customer emailed approval of requested action." /><button type="button" onClick={saveNoteToEventLog} className="absolute bottom-2 right-2 rounded border border-[#bbb] bg-[#f7f7f7] px-2 py-1 font-normal text-[#555] shadow-sm">Save</button></span>{savedNotes && <span className="mt-1 block font-normal text-green-700">Note saved.</span>}</label>
          <div className="mt-3"><h3 className="font-semibold">Previous notes and correspondence</h3>{eventLog.map((event) => <p key={`${event.id}-${event.savedAt}`} className="mt-1 leading-tight"><strong>{event.savedAt} - {event.administrator} - Event {event.id}</strong><br />{event.note}</p>)}</div>
        </section>}
        <section className="min-w-0 space-y-4">
          {requestGroups.map((group) => {
            const rows = requestRows(group.status);
            return <div key={group.title}><h2 className="mb-2 font-bold text-[#333]">{group.title}</h2><div className="overflow-x-auto"><table className="w-full min-w-[430px] border-collapse"><thead><tr className="bg-[#f3f3f3] text-left text-[9px] text-[#999]">{group.columns.map((column, index) => <th key={`${column}-${index}`} className="px-2 py-2">{column}</th>)}</tr></thead><tbody>{rows.length === 0 ? <tr><td colSpan={4} className="px-2 py-3 text-center text-[#888]">No requests found.</td></tr> : rows.map((row) => <tr key={row.id} className="border-b border-white odd:bg-white even:bg-[#f7f7f7]"><td className="whitespace-pre-line px-2 py-1 leading-tight">{row.customerName}<br />{row.customerEmail}</td><td className="px-2 py-1">{row.requestTypeLabel}</td><td className="px-2 py-1">{formatDate(group.status === "COMPLETED" ? row.completedAt : row.approvalEmailSentAt)}</td><td className="px-2 py-1"><button type="button" onClick={() => openRequest(row)} className="rounded border border-[#ccc] bg-[#fafafa] px-2 py-0.5">Open</button></td></tr>)}</tbody></table></div><div className="flex justify-between border-b border-[#ddd] py-2 text-[#888]"><span>Showing {rows.length ? 1 : 0}-{rows.length} of {rows.length} results</span><span className="underline">Previous&nbsp; 1&nbsp; 2&nbsp; 3&nbsp; Next</span></div></div>;
          })}
        </section>
      </div>
      <div className="mt-4 border-t border-[#ddd] pt-3"><p className="mb-2 font-semibold">All checks must be completed before initiating request.</p><div className="flex flex-wrap gap-x-5 gap-y-2"><label><input type="checkbox" checked={approvalReceived} onChange={(event) => setApprovalReceived(event.target.checked)} /> Approval received</label><label><input type="checkbox" checked={approvalSourceChecked} onChange={(event) => setApprovalSourceChecked(event.target.checked)} /> Approval source: <input value={approvalSource} onChange={(event) => setApprovalSource(event.target.value)} className="ml-1 h-5 w-24 border border-[#ddd] px-1" placeholder="Enter source" /></label><label><input type="checkbox" checked={approvalDateChecked} onChange={(event) => setApprovalDateChecked(event.target.checked)} /> Approval received date: <input type="date" value={approvalDate} onChange={(event) => setApprovalDate(event.target.value)} className="ml-1 h-5 w-32 border border-[#ddd] px-1" /></label><label className="basis-full"><input type="checkbox" checked={confirmation} onChange={(event) => setConfirmation(event.target.checked)} /> I confirm that approval was received from the verified account email and that the requested action shown above is correct, and if this request is for deletion and anonymization I understand that this action may be irreversible.</label></div><div className="mt-3 flex flex-wrap gap-1 rounded-lg bg-[#fafafa] p-2"><button type="button" onClick={() => setEmailOpen(true)} disabled={!backendId || !account} className="rounded bg-[#151d56] px-3 py-1.5 text-white disabled:cursor-not-allowed disabled:bg-[#d4d4d4]">EMAIL CUSTOMER</button><button type="button" onClick={saveAsNew} className="rounded bg-[#151d56] px-3 py-1.5 text-white">SAVE AS NEW</button><button type="button" onClick={saveAsPendingApproval} disabled={!pendingReady} className={`rounded px-3 py-1.5 text-white ${pendingReady ? "bg-[#151d56]" : "bg-[#d4d4d4] disabled:cursor-not-allowed"}`}>SAVE AS PENDING APPROVAL</button><button type="button" onClick={() => setPerformOpen(true)} disabled={!checksComplete || !backendId} className={`rounded px-3 py-1.5 text-white ${checksComplete && backendId ? "bg-[#ff823d]" : "bg-[#d4d4d4] disabled:cursor-not-allowed"}`}>PERFORM APPROVED REQUEST</button><button type="button" onClick={() => setCompletionOpen(true)} disabled={!completionReady} className={`rounded px-3 py-1.5 text-white ${completionReady ? "bg-[#ff823d]" : "bg-[#d4d4d4] disabled:cursor-not-allowed"}`}>SEND COMPLETION EMAIL AND CLOSE</button></div></div>
      {emailOpen && account && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><div className="w-full max-w-lg rounded border border-[#ccc] bg-white p-5 shadow-lg"><div className="mb-4 flex items-center justify-between"><h2 className="font-semibold text-[#444]">Email customer</h2><button type="button" onClick={() => setEmailOpen(false)} className="text-lg text-[#666]" aria-label="Close email preview">&times;</button></div><label className="mb-3 block font-semibold">To<input value={account["Verified account email"]} readOnly className="mt-1 h-8 w-full border border-[#ccc] bg-[#f5f5f5] px-2 font-normal" /></label><label className="mb-3 block font-semibold">Subject<input value={`${requestId} - RightRoute data request`} readOnly className="mt-1 h-8 w-full border border-[#ccc] bg-[#f5f5f5] px-2 font-normal" /></label><p className="mb-2 text-[10px] text-[#555]">The email will include the request ID, customer account information, selected request type, warning details, and request description.</p><label className="block font-semibold">Personalized message<textarea value={emailMessage} onChange={(event) => setEmailMessage(event.target.value)} className="mt-1 h-24 w-full resize-none border border-[#ccc] p-2 font-normal" placeholder="Add a short message for the customer." /></label><div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setEmailOpen(false)} className="rounded border border-[#bbb] px-3 py-1.5">Cancel</button><button type="button" onClick={sendCustomerEmail} disabled={!emailMessage.trim()} className="rounded bg-[#151d56] px-3 py-1.5 text-white disabled:cursor-not-allowed disabled:bg-[#d4d4d4]">Send</button></div></div></div>}
      {performOpen && account && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><div className="w-full max-w-[424px] rounded border border-[#d8d8d8] bg-[#f4f4f4] p-3 text-[11px] text-[#888] shadow-lg"><div className="space-y-1"><p>Customer name: {account["Customer name"]}</p><p>Account email: {account["Verified account email"]}</p><p>Request type: {requestTypeLabel}</p></div><div className="mt-3 flex items-center justify-between gap-2"><button type="button" onClick={() => setPerformOpen(false)} className="rounded border border-[#c8c8c8] bg-[#fafafa] px-2 py-1 text-[#777] shadow-sm">Cancel</button><button type="button" onClick={performApprovedRequest} className="rounded border border-[#c8c8c8] bg-[#fafafa] px-2 py-1 text-[#777] shadow-sm">Confirm and Perform Request</button></div></div></div>}
      {exportResultOpen && exportResult && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><div className="w-full max-w-md rounded border border-[#ccc] bg-[#f4f4f4] p-3 text-[11px] text-[#888] shadow-lg"><p className="font-semibold uppercase">Export completed</p><p>File created date: {exportResult.createdAt}</p><p>Download expiration date: {exportResult.expiresAt} (7 days)</p><p>File size: {exportResult.size || "-"}</p><div className="mt-3 flex justify-end"><button type="button" onClick={() => setExportResultOpen(false)} className="rounded border border-[#c8c8c8] bg-[#fafafa] px-2 py-1 text-[#777] shadow-sm">Close</button></div></div></div>}
      {completionOpen && account && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><div className="w-full max-w-lg rounded border border-[#ccc] bg-white p-5 shadow-lg"><h2 className="mb-3 font-semibold text-[#444]">Completion email preview</h2><p className="mb-2 text-[11px] text-[#555]">To: {account["Verified account email"]}</p><div className="max-h-56 overflow-y-auto rounded border border-[#ddd] bg-[#fafafa] p-3 text-[11px] text-[#555]"><p>Request ID: {requestId}</p><p>Customer: {account["Customer name"]}</p><p>Request type: {requestTypeLabel}</p><p className="mt-2">The request process completed successfully. This email summarizes the request and its result without exposing unnecessary internal security details.</p>{requestType === "EXPORT" && <p className="mt-2 font-semibold">Download link: available for 7 days only. It is not a permanent public link and will be removed automatically after the retention period.</p>}</div><div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setCompletionOpen(false)} className="rounded border border-[#bbb] px-3 py-1.5">Cancel</button><button type="button" onClick={sendCompletionEmail} className="rounded bg-[#151d56] px-3 py-1.5 text-white">Send and Close</button></div></div></div>}
    </main>
  );
};

export default DataProtection;
