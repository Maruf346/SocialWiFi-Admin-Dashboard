import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { supportApi } from "../../../api/supportApi";

const categories = [
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

const subcategories = {
  ACCOUNT_LOGIN: ["Cannot log in", "Password reset", "Email address change", "Account locked or disabled", "Other account/login issues"],
  BILLING_SUBSCRIPTION: ["Payment failed", "Incorrect charge", "Duplicate charge", "Subscription cancellation", "Fleet contract billing", "Other billing/subscription issue"],
  PERMIT_PROCESSING: ["Permit will not upload", "Unsupported PDF", "Permit text not recognized", "Processing failed", "Other import/processing issue"],
  ROUTE_NAVIGATION: ["Route is incorrect", "Missing waypoint", "Navigation will not start", "GPS location issue", "Other route/navigation issue"],
  APP_TECHNICAL: ["App crashes", "Page will not load", "Button does not work", "Slow performance", "Other technical issue"],
  TEAM_DRIVER: ["Cannot add driver", "Driver invitation not received", "Driver limit reached", "Team Manager dashboard issue", "Other team/driver issue"],
  ACCOUNT_CHANGES: ["Update account information", "Transfer account ownership", "Delete account", "Change plan", "Other account issue"],
  COMPLAINT: ["App performance complaint", "Routing complaint", "Billing complaint", "Customer service complaint", "Other concern"],
  FEATURE_REQUEST: ["New app feature", "Dashboard improvement", "Permit-processing improvement", "Navigation improvement", "General suggestion"],
  GENERAL_OTHER: ["How-to question", "Product information", "Pricing question", "Feedback", "Other"],
};

const priorityOptions = [["LOW", "Low"], ["NORMAL", "Normal"], ["HIGH", "High"], ["URGENT", "Urgent"]];
const sourceOptions = [["DASHBOARD", "Customer-reported"], ["STAFF_DISCOVERED", "Staff-discovered"], ["AUTOMATED_ALERT", "Automated system alert"]];
const contactOptions = [["EMAIL", "Email"], ["PHONE", "Phone"], ["VIDEO_CALL", "Video call"], ["WEBSITE_FORM", "Website form"]];

const emptyCustomer = { name: "", email: "", phone: "", company: "", accountEmail: "", plan: "Individual", userId: null };

const CreateTicket = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [source, setSource] = useState("DASHBOARD");
  const [assignedTo, setAssignedTo] = useState("");
  const [contactMethod, setContactMethod] = useState("EMAIL");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [safetyCritical, setSafetyCritical] = useState(false);
  const [internalNotes, setInternalNotes] = useState("");
  const [sendConfirmation, setSendConfirmation] = useState(true);
  const [createWithoutNotification, setCreateWithoutNotification] = useState(false);
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState("");
  const [customer, setCustomer] = useState(emptyCustomer);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerResults, setCustomerResults] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [draftsOpen, setDraftsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supportApi.listAssignees().then(setAssignees).catch(() => setAssignees([]));
  }, []);

  const searchCustomer = async () => {
    try {
      const results = await supportApi.searchCustomers(customerSearch);
      setCustomerResults(Array.isArray(results) ? results : []);
    } catch (err) {
      setMessage(err.message || "Customer search failed.");
    }
  };

  const insertCustomer = (item) => {
    setCustomer({
      name: item.full_name || "",
      email: item.email || "",
      phone: item.phone || "",
      company: item.company_name || "",
      accountEmail: item.email || "",
      plan: item.plan_type || "Individual",
      userId: item.id,
    });
    setCustomerSearch(item.full_name || item.email || "");
    setCustomerResults([]);
  };

  const allowedExtensions = ["jpg", "jpeg", "png", "pdf", "doc", "docx", "txt"];
  const handleFiles = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    const invalidType = selectedFiles.find((file) => !allowedExtensions.includes(file.name.split(".").pop().toLowerCase()));
    const tooLarge = selectedFiles.find((file) => file.size > 3 * 1024 * 1024);
    if (invalidType) {
      setFileError(`${invalidType.name} is not an allowed file type.`);
      event.target.value = "";
      return;
    }
    if (tooLarge) {
      setFileError(`${tooLarge.name} is larger than 3MB.`);
      event.target.value = "";
      return;
    }
    if (files.length + selectedFiles.length > 3) {
      setFileError("You can upload a maximum of 3 files.");
      event.target.value = "";
      return;
    }
    setFiles((current) => [...current, ...selectedFiles]);
    setFileError("");
    event.target.value = "";
  };

  const removeFile = (fileToRemove) => setFiles((current) => current.filter((file) => file !== fileToRemove));

  const buildPayload = (isDraft = false) => {
    const assignee = assignees.find((item) => String(item.id) === String(assignedTo));
    return {
      is_draft: isDraft,
      customer_name: customer.name.trim(),
      customer_email: customer.email.trim(),
      customer_phone: customer.phone.trim() || null,
      company_name: customer.company.trim() || null,
      account_email: customer.accountEmail.trim() || null,
      plan_type: customer.plan || null,
      customer_user: customer.userId || null,
      main_category: category,
      subcategory: subcategory || null,
      priority,
      preferred_contact_method: contactMethod,
      source,
      assigned_to: assignee?.id || null,
      assigned_name: assignee?.full_name || null,
      subject: subject.trim(),
      description: description.trim(),
      safety_critical: safetyCritical,
      send_confirmation_email: sendConfirmation && !createWithoutNotification,
      internal_notes: internalNotes.trim(),
      uploaded_files: [],
    };
  };

  const clearForm = () => {
    setCustomer(emptyCustomer);
    setCategory("");
    setSubcategory("");
    setPriority("NORMAL");
    setSource("DASHBOARD");
    setAssignedTo("");
    setContactMethod("EMAIL");
    setSubject("");
    setDescription("");
    setSafetyCritical(false);
    setInternalNotes("");
    setSendConfirmation(true);
    setCreateWithoutNotification(false);
    setFiles([]);
    setFileError("");
    setMessage("");
  };

  const uploadSelectedFiles = async (ticketId) => {
    if (!ticketId || files.length === 0) return;
    await Promise.all(files.map((file) => supportApi.uploadAttachment(ticketId, file)));
  };

  const saveDraft = async () => {
    try {
      setSubmitting(true);
      const draft = await supportApi.createTicket(buildPayload(true));
      await uploadSelectedFiles(draft.id);
      setDrafts((current) => [draft, ...current]);
      setMessage(files.length > 0 ? "Draft saved in backend with attachments." : "Draft saved in backend.");
    } catch (err) {
      setMessage(err.message || "Failed to save draft.");
    } finally {
      setSubmitting(false);
    }
  };

  const loadDraft = (draft) => {
    setCustomer({
      name: draft.customer_name || "",
      email: draft.customer_email || "",
      phone: draft.customer_phone || "",
      company: draft.company_name || "",
      accountEmail: draft.account_email || "",
      plan: draft.plan_type || "Individual",
      userId: draft.customer_user || null,
    });
    setCategory(draft.main_category || "");
    setSubcategory(draft.subcategory || "");
    setPriority(draft.priority || "NORMAL");
    setSource(draft.source || "DASHBOARD");
    setAssignedTo(draft.assigned_to ? String(draft.assigned_to) : "");
    setContactMethod(draft.preferred_contact_method || "EMAIL");
    setSubject(draft.subject || "");
    setDescription(draft.description || "");
    setSafetyCritical(Boolean(draft.safety_critical));
    setDraftsOpen(false);
  };

  const openDrafts = async () => {
    try {
      const response = await supportApi.listTickets({ scope: "draft", page_size: 50 });
      setDrafts(Array.isArray(response?.results) ? response.results : []);
      setDraftsOpen(true);
    } catch (err) {
      setMessage(err.message || "Failed to load drafts.");
    }
  };

  const submitTicket = async (event) => {
    event.preventDefault();
    if (!subject.trim() || !description.trim() || !customer.name.trim() || !customer.email.trim() || !category) {
      setMessage("Customer name, customer email, category, subject, and description are required.");
      return;
    }

    try {
      setSubmitting(true);
      const ticket = await supportApi.createTicket(buildPayload(false));
      await uploadSelectedFiles(ticket.id);
      setMessage(`${ticket.ticket_number || "Ticket"} created.`);
      navigate("/dashboard/support-tickets");
    } catch (err) {
      setMessage(err.message || "Failed to create ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submitTicket} className="min-h-full bg-white px-2 py-3 text-[#777] md:px-8 md:py-6">
      <div className="mb-8">
        <h1 className="text-xl font-normal text-[#999] md:text-2xl">Create Ticket</h1>
        <p className="mt-2 text-sm">Create a support ticket from phone calls, direct emails or internal reports.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded border border-[#d8d8d8] p-4">
          <h2 className="mb-4 font-semibold text-[#444]">1. Customer Information</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[["name", "Customer name"], ["email", "Customer email"], ["phone", "Phone number"], ["company", "Company name"], ["accountEmail", "Account email"]].map(([key, label]) => (
              <label key={key} className="text-xs font-semibold">
                {label}
                <input value={customer[key]} onChange={(event) => setCustomer((current) => ({ ...current, [key]: event.target.value }))} className="mt-1 h-8 w-full rounded border border-[#ccc] px-2" />
              </label>
            ))}
            <label className="text-xs font-semibold">
              Plan type
              <select value={customer.plan} onChange={(event) => setCustomer((current) => ({ ...current, plan: event.target.value }))} className="mt-1 h-8 w-full rounded border border-[#ccc] bg-white px-2">
                <option>Individual</option><option>Team</option><option>Fleet</option><option>Trial User</option>
              </select>
            </label>
          </div>
          <label className="mt-3 block text-xs font-semibold">
            Search and link customer account
            <div className="mt-1 flex gap-1">
              <input value={customerSearch} onChange={(event) => setCustomerSearch(event.target.value)} className="h-8 flex-1 rounded border border-[#ccc] px-2" />
              <button type="button" onClick={searchCustomer} className="border border-[#ccc] bg-[#f4f4f4] px-2 text-xs">Go</button>
            </div>
          </label>
          {customerResults.length > 0 && <div className="mt-2 border border-[#ddd] bg-[#fafafa] p-2">{customerResults.map((item) => <div key={item.id} className="flex items-center justify-between gap-2 border-b border-white py-1 text-xs"><span>{item.full_name || item.email} - {item.company_name || "No company"}</span><button type="button" onClick={() => insertCustomer(item)} className="rounded bg-[#18205c] px-2 py-1 text-white">INSERT</button></div>)}</div>}
        </section>

        <section className="rounded border border-[#d8d8d8] p-4">
          <h2 className="mb-4 font-semibold text-[#444]">2. Ticket Classification</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold">Main Category<select value={category} onChange={(event) => { setCategory(event.target.value); setSubcategory(""); }} className="mt-1 h-8 w-full rounded border border-[#ccc] bg-white px-2"><option value="">Select category</option>{categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className="text-xs font-semibold">Subcategory<select value={subcategory} onChange={(event) => setSubcategory(event.target.value)} disabled={!category} className="mt-1 h-8 w-full rounded border border-[#ccc] bg-white px-2"><option value="">Select subcategory</option>{(subcategories[category] || []).map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="text-xs font-semibold">Source<select value={source} onChange={(event) => setSource(event.target.value)} className="mt-1 h-8 w-full rounded border border-[#ccc] bg-white px-2">{sourceOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className="text-xs font-semibold">Priority<select value={priority} onChange={(event) => setPriority(event.target.value)} className="mt-1 h-8 w-full rounded border border-[#ccc] bg-white px-2">{priorityOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className="text-xs font-semibold">Assigned to<select value={assignedTo} onChange={(event) => setAssignedTo(event.target.value)} className="mt-1 h-8 w-full rounded border border-[#ccc] bg-white px-2"><option value="">Select assignee</option>{assignees.map((admin) => <option key={admin.id} value={admin.id}>{admin.full_name}</option>)}</select></label>
            <label className="text-xs font-semibold">Preferred contact method<select value={contactMethod} onChange={(event) => setContactMethod(event.target.value)} className="mt-1 h-8 w-full rounded border border-[#ccc] bg-white px-2">{contactOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          </div>
        </section>

        <section className="rounded border border-[#d8d8d8] p-4">
          <h2 className="mb-4 font-semibold text-[#444]">3. Issue Details</h2>
          <label className="block text-xs font-semibold">Subject<input value={subject} onChange={(event) => setSubject(event.target.value)} className="mt-1 h-8 w-full rounded border border-[#ccc] px-2" /></label>
          <label className="mt-3 block text-xs font-semibold">Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} className="mt-1 h-28 w-full rounded border border-[#ccc] p-2" /></label>
          <label className="mt-3 block text-xs font-semibold"><input type="checkbox" checked={safetyCritical} onChange={(event) => setSafetyCritical(event.target.checked)} className="mr-2" />Safety-critical</label>
        </section>

        <section className="rounded border border-[#d8d8d8] p-4">
          <h2 className="mb-4 font-semibold text-[#444]">4. Attachments</h2>
          <label className="flex h-20 cursor-pointer items-center justify-center rounded border-2 border-dashed border-[#bbb] text-sm text-[#777] hover:border-[#ff823d]">Drop files here or <span className="ml-1 text-[#ff823d]">browse</span><input type="file" multiple onChange={handleFiles} className="hidden" /></label>
          <p className="mt-2 text-xs">Max file size 3MB. Max 3 files. Allowed types: jpg, jpeg, png, pdf, doc, docx, txt.</p>
          {fileError && <p className="mt-2 text-xs text-orange-600">{fileError}</p>}
          {files.length > 0 && <div className="mt-2 grid gap-2 sm:grid-cols-3">{files.map((file) => <div key={`${file.name}-${file.lastModified}`} className="flex items-center justify-between gap-2 rounded bg-[#f5f5f5] px-2 py-2 text-xs"><span className="min-w-0 truncate">{file.name}<small className="block text-[10px] text-[#888]">{Math.ceil(file.size / 1024)} KB</small></span><button type="button" onClick={() => removeFile(file)} className="text-[#888] hover:text-red-600">x</button></div>)}</div>}
        </section>

        <section className="rounded border border-[#d8d8d8] p-4 lg:col-start-2">
          <h2 className="mb-4 font-semibold text-[#444]">5. Internal Options</h2>
          <label className="block text-sm"><input type="checkbox" checked={sendConfirmation} onChange={(event) => { setSendConfirmation(event.target.checked); if (event.target.checked) setCreateWithoutNotification(false); }} className="mr-2" />Send customer confirmation email</label>
          <label className="mt-2 block text-sm"><input type="checkbox" checked={createWithoutNotification} onChange={(event) => { setCreateWithoutNotification(event.target.checked); if (event.target.checked) setSendConfirmation(false); }} className="mr-2" />Create without customer notification</label>
        </section>
      </div>

      <section className="mt-4 rounded border border-[#d8d8d8] p-4"><h2 className="mb-3 font-semibold text-[#444]">6. Internal Notes</h2><textarea value={internalNotes} onChange={(event) => setInternalNotes(event.target.value)} className="h-28 w-full rounded border border-[#ccc] p-2" /></section>

      <div className="mt-4 flex flex-wrap gap-2 rounded bg-[#fafafa] p-3">
        <button type="submit" disabled={submitting} className="rounded bg-[#ff823d] px-3 py-2 text-xs font-semibold text-white disabled:opacity-60">CREATE TICKET</button>
        <button type="button" disabled={submitting} onClick={saveDraft} className="rounded bg-[#18205c] px-3 py-2 text-xs text-white disabled:opacity-60">SAVE DRAFT</button>
        <button type="button" onClick={openDrafts} className="rounded bg-[#18205c] px-3 py-2 text-xs text-white">OPEN DRAFT</button>
        <button type="button" onClick={() => { clearForm(); navigate("/dashboard/support-tickets"); }} className="rounded bg-[#18205c] px-3 py-2 text-xs text-white">CANCEL</button>
        {message && <span className="self-center text-sm text-[#555]">{message}</span>}
      </div>

      {draftsOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><div className="w-full max-w-lg rounded border border-[#ccc] bg-white p-5 shadow-lg"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-[#444]">Drafts</h2><button type="button" onClick={() => setDraftsOpen(false)} className="text-xl">x</button></div>{drafts.length === 0 ? <p className="mt-4 text-sm">No saved drafts.</p> : <div className="mt-4 space-y-2">{drafts.map((draft) => <button type="button" key={draft.id} onClick={() => loadDraft(draft)} className="block w-full border border-[#ddd] p-3 text-left text-sm"><b>{draft.subject || "Untitled ticket"}</b><span className="block text-xs text-[#777]">{draft.ticket_number || `Draft #${draft.id}`}</span></button>)}</div>}</div></div>}
    </form>
  );
};

export default CreateTicket;

