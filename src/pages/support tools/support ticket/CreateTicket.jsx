import { useState } from "react";
import { useNavigate } from "react-router";

const categories = [
  "Account and Login Issues",
  "Billing and Subscription Issues",
  "Permit Import and Processing",
  "Route and Navigation Issues",
  "App Technical Issues",
  "Team and Driver Management",
  "Account Changes and Requests",
  "Complaint or Service Concern",
  "Feature Request or Suggestion",
  "General Question or Other",
];
const subcategories = {
  "Account and Login Issues": [
    "Cannot log in",
    "Password reset",
    "Email address change",
    "Account not recognized",
    "Driver invitation issue",
    "Team or fleet account access",
    "Account locked or disabled",
    "Other account/login issues",
  ],
  "Billing and Subscription Issues": [
    "Payment failed",
    "Incorrect charge",
    "Duplicate charge",
    "Subscription cancellation",
    "Monthly-to-annual plan change",
    "Free trial issue",
    "Promotional offer or discount issue",
    "Apple App Store billing",
    "Google Play billing",
    "Fleet contract billing",
    "Other billing/subscription issue",
  ],
  "Permit Import and Processing": [
    "Permit will not upload",
    "Unsupported PDF",
    "Permit text not recognized",
    "Incorrect route extracted",
    "Missing route instructions",
    "Start or end point not detected",
    "Waypoints placed incorrectly",
    "Processing failed",
    "Duplicate permit",
    "Other import/processing issue",
  ],
  "Route and Navigation Issues": [
    "Route is incorrect",
    "Route does not match permit",
    "Missing waypoint",
    "Incorrect road or highway",
    "Navigation will not start",
    "Voice guidance issue",
    "Route recalculation issue",
    "Map display issue",
    "Offline route issue",
    "GPS location issue",
    "Other route/navigation issue",
  ],
  "App Technical Issues": [
    "App crashes",
    "App freezes",
    "Page will not load",
    "Button does not work",
    "Slow performance",
    "Installation issue",
    "Update issue",
    "Device compatibility",
    "Notification issue",
    "Internet connection issue",
    "Unknown technical error",
    "Other technical issue",
  ],
  "Team and Driver Management": [
    "Cannot add driver",
    "Driver invitation not received",
    "Driver cannot activate account",
    "Driver removal issue",
    "Driver limit reached",
    "Incorrect driver access",
    "Team Manager dashboard issue",
    "User role or permission issue",
    "Fleet account setup issue",
    "Other team/driver issue",
  ],
  "Account Changes and Requests": [
    "Update account information",
    "Change company information",
    "Add or remove administrator",
    "Transfer account ownership",
    "Delete account",
    "Request account records",
    "Change plan",
    "Increase driver allowance",
    "Other account issue",
  ],
  "Complaint or Service Concern": [
    "App performance complaint",
    "Routing complaint",
    "Billing complaint",
    "Customer service complaint",
    "Feature dissatisfaction",
    "Pricing complaint",
    "Privacy concern",
    "Safety concern",
    "Other concern",
  ],
  "Feature Request or Suggestion": [
    "New app feature",
    "Dashboard improvement",
    "Permit-processing improvement",
    "Navigation improvement",
    "Offline functionality",
    "Team-management improvement",
    "Billing improvement",
    "General suggestion",
  ],
  "General Question or Other": [
    "How-to question",
    "Product information",
    "Pricing question",
    "Feedback",
    "Testimonial",
    "Other",
  ],
};
const customers = [
  {
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "555-0101",
    company: "Right Route Logistics",
    accountEmail: "billing@rightroute.com",
    plan: "Team",
  },
  {
    name: "Alex Jones",
    email: "alex.jones@example.com",
    phone: "555-0102",
    company: "Blue Line Trucking",
    accountEmail: "accounts@blueline.com",
    plan: "Fleet",
  },
  {
    name: "Jessica Lane",
    email: "jessica.lane@example.com",
    phone: "555-0103",
    company: "Acme Logistics",
    accountEmail: "admin@acmelogistics.com",
    plan: "Individual",
  },
];

const LIVE_TICKETS_KEY = "socialwifi-live-tickets";
const DRAFT_TICKETS_KEY = "socialwifi-ticket-drafts";
const TICKET_SEQUENCE_KEY = "socialwifi-ticket-sequence";

const CreateTicket = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [source, setSource] = useState("Customer-reported");
  const [assignedTo, setAssignedTo] = useState("");
  const [contactMethod, setContactMethod] = useState("Email");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [safetyCritical, setSafetyCritical] = useState("No");
  const [internalNotes, setInternalNotes] = useState("");
  const [sendConfirmation, setSendConfirmation] = useState(true);
  const [createWithoutNotification, setCreateWithoutNotification] =
    useState(false);
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState("");
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    accountEmail: "",
    plan: "Individual",
  });
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerResults, setCustomerResults] = useState([]);
  const [drafts, setDrafts] = useState(() =>
    JSON.parse(localStorage.getItem(DRAFT_TICKETS_KEY) || "[]"),
  );
  const [draftsOpen, setDraftsOpen] = useState(false);

  const searchCustomer = () =>
    setCustomerResults(
      customers.filter((item) =>
        `${item.name} ${item.email} ${item.company}`
          .toLowerCase()
          .includes(customerSearch.toLowerCase()),
      ),
    );
  const insertCustomer = (item) => {
    setCustomer(item);
    setCustomerSearch(item.name);
    setCustomerResults([]);
  };
  const allowedExtensions = ["jpg", "jpeg", "png", "pdf", "doc", "docx", "txt"];
  const handleFiles = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    const invalidType = selectedFiles.find(
      (file) =>
        !allowedExtensions.includes(file.name.split(".").pop().toLowerCase()),
    );
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
  const removeFile = (fileToRemove) =>
    setFiles((current) => current.filter((file) => file !== fileToRemove));

  const getFormData = () => ({
    customer,
    category,
    subcategory,
    priority,
    source,
    assignedTo,
    contactMethod,
    subject,
    description,
    safetyCritical,
    internalNotes,
    sendConfirmation,
    createWithoutNotification,
    files: files.map((file) => ({ name: file.name, size: file.size })),
  });
  const saveDraft = () => {
    const draft = {
      id: `draft-${Date.now()}`,
      savedAt: new Date().toISOString(),
      ...getFormData(),
    };
    const nextDrafts = [draft, ...drafts];
    localStorage.setItem(DRAFT_TICKETS_KEY, JSON.stringify(nextDrafts));
    setDrafts(nextDrafts);
    setMessage("Draft saved. No ticket number was created.");
  };
  const loadDraft = (draft) => {
    setCustomer(draft.customer);
    setCategory(draft.category);
    setSubcategory(draft.subcategory);
    setPriority(draft.priority);
    setSource(draft.source);
    setAssignedTo(draft.assignedTo);
    setContactMethod(draft.contactMethod);
    setSubject(draft.subject);
    setDescription(draft.description);
    setSafetyCritical(draft.safetyCritical);
    setInternalNotes(draft.internalNotes);
    setSendConfirmation(draft.sendConfirmation);
    setCreateWithoutNotification(draft.createWithoutNotification);
    setDraftsOpen(false);
    setMessage(
      `Draft loaded from ${new Date(draft.savedAt).toLocaleString()}. Attachments must be selected again.`,
    );
  };
  const clearForm = () => {
    setCustomer({
      name: "",
      email: "",
      phone: "",
      company: "",
      accountEmail: "",
      plan: "Individual",
    });
    setCategory("");
    setSubcategory("");
    setPriority("Normal");
    setSource("Customer-reported");
    setAssignedTo("");
    setContactMethod("Email");
    setSubject("");
    setDescription("");
    setSafetyCritical("No");
    setInternalNotes("");
    setSendConfirmation(true);
    setCreateWithoutNotification(false);
    setFiles([]);
    setFileError("");
    setMessage("");
  };

  const submitTicket = (event) => {
    event.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setMessage("Subject and description are required.");
      return;
    }
    const currentSequence =
      Number(localStorage.getItem(TICKET_SEQUENCE_KEY) || "74") + 1;
    const ticket = {
      id: `RR-${new Date().getFullYear()}-${String(currentSequence).padStart(5, "0")}`,
      priority,
      status: "New",
      customer: customer.name || "Unknown customer",
      category: category || "General Question or Other",
      subject: subject.trim(),
      assigned: assignedTo || "-",
      details: getFormData(),
    };
      //  Console-e data dekhar jonno ei line add korun:
  // console.log("Ticket Data:", ticket);
  console.log("Full Form Data:", getFormData());
    const liveTickets = JSON.parse(
      localStorage.getItem(LIVE_TICKETS_KEY) || "[]",
    );
    localStorage.setItem(TICKET_SEQUENCE_KEY, String(currentSequence));
    localStorage.setItem(
      LIVE_TICKETS_KEY,
      JSON.stringify([ticket, ...liveTickets]),
    );
    setMessage(
      `${ticket.id} created. ${sendConfirmation && !createWithoutNotification ? `Confirmation email queued for ${customer.email || "the customer"}; technician notification queued for ${assignedTo || "the assigned technician"}.` : "No customer notification was requested."}`,
    );
    navigate("/dashboard/support-tickets");
  };

  return (
    <form
      onSubmit={submitTicket}
      className="min-h-full px-2 py-2 text-[#777] md:px-4 md:py-3"
    >
      <div className="mb-6">
        <h1 className="text-2xl font-normal text-[#999]">Create Ticket</h1>
        <p className="mt-2 text-sm">
          Create a support ticket from phone calls, direct emails or internal
          reports.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded border border-[#d8d8d8] p-4">
          <h2 className="mb-4 font-semibold text-[#444]">
            1. Customer Information
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold">
              Customer name
              <input
                value={customer.name}
                onChange={(event) =>
                  setCustomer((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                className="mt-1 h-8 w-full rounded border border-[#ccc] px-2"
              />
            </label>
            <label className="text-xs font-semibold">
              Customer email
              <input
                value={customer.email}
                onChange={(event) =>
                  setCustomer((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                className="mt-1 h-8 w-full rounded border border-[#ccc] px-2"
              />
            </label>
            <label className="text-xs font-semibold">
              Phone number
              <input
                value={customer.phone}
                onChange={(event) =>
                  setCustomer((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
                className="mt-1 h-8 w-full rounded border border-[#ccc] px-2"
              />
            </label>
            <label className="text-xs font-semibold">
              Company name
              <input
                value={customer.company}
                onChange={(event) =>
                  setCustomer((current) => ({
                    ...current,
                    company: event.target.value,
                  }))
                }
                className="mt-1 h-8 w-full rounded border border-[#ccc] px-2"
              />
            </label>
            <label className="text-xs font-semibold">
              Account email
              <input
                value={customer.accountEmail}
                onChange={(event) =>
                  setCustomer((current) => ({
                    ...current,
                    accountEmail: event.target.value,
                  }))
                }
                className="mt-1 h-8 w-full rounded border border-[#ccc] px-2"
              />
            </label>
            <label className="text-xs font-semibold">
              Plan type
              <select
                value={customer.plan}
                onChange={(event) =>
                  setCustomer((current) => ({
                    ...current,
                    plan: event.target.value,
                  }))
                }
                className="mt-1 h-8 w-full rounded border border-[#ccc] bg-white px-2"
              >
                <option>Individual</option>
                <option>Team</option>
                <option>Fleet</option>
                <option>Trial User</option>
              </select>
            </label>
          </div>
          <label className="mt-3 block text-xs font-semibold">
            Search and link customer account
            <div className="mt-1 flex gap-1">
              <input
                value={customerSearch}
                onChange={(event) => setCustomerSearch(event.target.value)}
                className="h-8 flex-1 rounded border border-[#ccc] px-2"
              />
              <button
                type="button"
                onClick={searchCustomer}
                className="border border-[#ccc] bg-[#f4f4f4] px-2 text-xs cursor-pointer"
              >
                Go
              </button>
            </div>
          </label>
          {customerResults.length > 0 && (
            <div className="mt-2 border border-[#ddd] bg-[#fafafa] p-2">
              {customerResults.map((item) => (
                <div
                  key={item.email}
                  className="flex items-center justify-between gap-2 border-b border-white py-1 text-xs"
                >
                  <span>
                    {item.name} - {item.company}
                  </span>
                  <button
                    type="button"
                    onClick={() => insertCustomer(item)}
                    className="rounded bg-[#18205c] px-2 py-1 text-white"
                  >
                    INSERT
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="rounded border border-[#d8d8d8] p-4">
          <h2 className="mb-4 font-semibold text-[#444]">
            2. Ticket Classification
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold">
              Main Category
              <select
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  setSubcategory("");
                }}
                className="mt-1 h-8 w-full rounded border border-[#ccc] bg-white px-2"
              >
                <option value="">Select category</option>
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold">
              Subcategory
              <select
                value={subcategory}
                onChange={(event) => setSubcategory(event.target.value)}
                disabled={!category}
                className="mt-1 h-8 w-full rounded border border-[#ccc] bg-white px-2"
              >
                <option value="">Select subcategory</option>
                {(subcategories[category] || []).map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold">
              Source
              <select
                value={source}
                onChange={(event) => setSource(event.target.value)}
                className="mt-1 h-8 w-full rounded border border-[#ccc] bg-white px-2"
              >
                <option>Customer-reported</option>
                <option>Staff-discovered</option>
                <option>Automated system alert</option>
              </select>
            </label>
            <label className="text-xs font-semibold">
              Priority
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
                className="mt-1 h-8 w-full rounded border border-[#ccc] bg-white px-2"
              >
                <option>Low</option>
                <option>Normal</option>
                <option>High</option>
                <option>Urgent</option>
              </select>
            </label>
            <label className="text-xs font-semibold">
              Assigned to
              <select
                value={assignedTo}
                onChange={(event) => setAssignedTo(event.target.value)}
                className="mt-1 h-8 w-full rounded border border-[#ccc] bg-white px-2"
              >
                <option value="">Select assignee</option>
                <option>Jocelyn</option>
                <option>Damon</option>
                <option>Brad</option>
                <option>Nahid</option>
                <option>Mahdi</option>
              </select>
            </label>
            <label className="text-xs font-semibold">
              Preferred contact method
              <select
                value={contactMethod}
                onChange={(event) => setContactMethod(event.target.value)}
                className="mt-1 h-8 w-full rounded border border-[#ccc] bg-white px-2"
              >
                <option>Email</option>
                <option>Phone</option>
                <option>Video call</option>
              </select>
            </label>
          </div>
        </section>
        <section className="rounded border border-[#d8d8d8] p-4">
          <h2 className="mb-4 font-semibold text-[#444]">3. Issue Details</h2>
          <label className="block text-xs font-semibold">
            Subject
            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="mt-1 h-8 w-full rounded border border-[#ccc] px-2"
            />
          </label>
          <label className="mt-3 block text-xs font-semibold">
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="mt-1 h-28 w-full rounded border border-[#ccc] p-2"
            />
          </label>
          <label className="mt-3 block text-xs font-semibold">
            Safety-critical?
            <select
              value={safetyCritical}
              onChange={(event) => setSafetyCritical(event.target.value)}
              className="ml-2 h-8 rounded border border-[#ccc] bg-white px-2"
            >
              <option>No</option>
              <option>Yes</option>
            </select>
          </label>
        </section>
        <section className="rounded border border-[#d8d8d8] p-4">
          <h2 className="mb-4 font-semibold text-[#444]">4. Attachments</h2>
          <label className="flex h-20 cursor-pointer items-center justify-center rounded border-2 border-dashed border-[#bbb] text-sm text-[#777] hover:border-[#ff823d]">
            Drop files here or{" "}
            <span className="ml-1 text-[#ff823d]">browse</span>
            <input
              type="file"
              multiple
              onChange={handleFiles}
              className="hidden"
            />
          </label>
          <p className="mt-2 text-xs">
            Max file size 3MB. Max 3 files. Allowed types: jpg, jpeg, png, pdf,
            doc, docx, txt.
          </p>
          {fileError && (
            <p className="mt-2 text-xs text-red-600">{fileError}</p>
          )}
          {files.length > 0 && (
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {files.map((file) => (
                <div
                  key={`${file.name}-${file.lastModified}`}
                  className="flex items-center justify-between gap-2 rounded bg-[#f5f5f5] px-2 py-2 text-xs"
                >
                  <span className="min-w-0 truncate">
                    {file.name}
                    <small className="block text-[10px] text-[#888]">
                      {Math.ceil(file.size / 1024)} KB
                    </small>
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(file)}
                    aria-label={`Remove ${file.name}`}
                    className="text-[#888] hover:text-red-600"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="rounded border border-[#d8d8d8] p-4 lg:col-start-2">
          <h2 className="mb-4 font-semibold text-[#444]">
            5. Internal Options
          </h2>
          <label className="block text-sm">
            <input
              type="checkbox"
              checked={sendConfirmation}
              onChange={(event) => {
                setSendConfirmation(event.target.checked);
                if (event.target.checked) setCreateWithoutNotification(false);
              }}
              className="mr-2"
            />
            Send customer confirmation email
          </label>
          <label className="mt-2 block text-sm">
            <input
              type="checkbox"
              checked={createWithoutNotification}
              onChange={(event) => {
                setCreateWithoutNotification(event.target.checked);
                if (event.target.checked) setSendConfirmation(false);
              }}
              className="mr-2"
            />
            Create without customer notification
          </label>
        </section>
      </div>
      <section className="mt-4 rounded border border-[#d8d8d8] p-4">
        <h2 className="mb-3 font-semibold text-[#444]">6. Internal Notes</h2>
        <textarea
          value={internalNotes}
          onChange={(event) => setInternalNotes(event.target.value)}
          aria-label="Internal notes"
          className="h-28 w-full rounded border border-[#ccc] p-2"
        />
      </section>
      <div className="mt-4 flex flex-wrap gap-2 rounded bg-[#fafafa] p-3">
        <button
          type="submit"
          className="rounded bg-[#ff823d] px-3 py-2 text-xs font-semibold text-white cursor-pointer"
        >
          CREATE TICKET
        </button>
        <button
          type="button"
          onClick={saveDraft}
          className="rounded bg-[#18205c] px-3 py-2 text-xs text-white cursor-pointer"
        >
          SAVE DRAFT
        </button>
        <button
          type="button"
          onClick={() => setDraftsOpen(true)}
          className="rounded bg-[#18205c] px-3 py-2 text-xs text-white cursor-pointer"
        >
          OPEN DRAFT
        </button>
        <button
          type="button"
          onClick={() => {
            clearForm();
            navigate("/dashboard/support-tickets");
          }}
          className="rounded bg-[#18205c] px-3 py-2 text-xs text-white cursor-pointer"
        >
          CANCEL
        </button>
        {message && (
          <span className="self-center text-sm text-[#555]">{message}</span>
        )}
      </div>
      {draftsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="drafts-title"
            className="w-full max-w-lg rounded border border-[#ccc] bg-white p-5 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <h2
                id="drafts-title"
                className="text-lg font-semibold text-[#444]"
              >
                Drafts
              </h2>
              <button
                type="button"
                onClick={() => setDraftsOpen(false)}
                aria-label="Close drafts"
                className="text-xl"
              >
                &times;
              </button>
            </div>
            {drafts.length === 0 ? (
              <p className="mt-4 text-sm">No saved drafts.</p>
            ) : (
              <div className="mt-4 space-y-2">
                {drafts.map((draft) => (
                  <button
                    type="button"
                    key={draft.id}
                    onClick={() => loadDraft(draft)}
                    className="block w-full border border-[#ddd] p-3 text-left text-sm cursor-pointer"
                  >
                    <b>{draft.subject || "Untitled ticket"}</b>
                    <span className="block text-xs text-[#777]">
                      Saved {new Date(draft.savedAt).toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </form>
  );
};

export default CreateTicket;
