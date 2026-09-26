import { useState } from "react";

const requestGroups = [
  {
    title: "New Requests",
    columns: ["CUSTOMER NAME & EMAIL", "REQUEST TYPE", "", ""],
    rows: [
      ["Sponge Bob\nsbob@spongteruckers.com", "Anonymize"],
      ["John Cross\njcross@crossshipping.com", "Delete & Anonymize"],
      ["Alex Jones\najones@jonestrucking.com", "Delete"],
    ],
  },
  {
    title: "Pending Approval",
    columns: ["CUSTOMER NAME & EMAIL", "REQUEST TYPE", "APP EMAIL SENT DATE", ""],
    rows: [
      ["Jill Joe\njj@jillhauling.com", "Delete & Anonymize", "7/3/26"],
      ["Sammy Devos\nsamdevos@trucker.com", "Delete", "6/24/25"],
      ["Peter Daily\npeterd@dailytrucking.com", "Anonymize", "6/15/26"],
    ],
  },
  {
    title: "Completed Requests",
    columns: ["CUSTOMER NAME & EMAIL", "REQUEST TYPE", "COMPLETION DATE", ""],
    rows: [
      ["Micro Hauling\njim@microhauling.com", "Delete & Anonymize", "7/3/26"],
      ["Tom Thumb\nthum@thumbcare.com", "Delete", "6/24/25"],
      ["Clint Jeffrey\ncjeffrey@citytrucking.com", "Delete", "6/15/26"],
    ],
  },
];

const fieldGroups = [
  ["Customer name", "Verified account email"],
  ["User ID", "Account status"],
  ["Plan type", "Account creation date"],
  ["Phone number", "Request type"],
];

const requestDescriptions = {
  "Export User Data":
    "The customer is requesting a copy of the personal information RightRoute maintains about their account. Once approved, RightRoute will create a ZIP package containing the available data in PDF, CSV, and JSON formats. The export will be provided securely to the verified email address associated with the account.",
  "Delete User Data":
    "The customer is requesting deletion of personal information associated with their RightRoute account where deletion is permitted. The account will be deactivated, and eligible profile, permit, route, support, and related records will be removed. Certain limited records may be retained where required by law, necessary for fraud prevention, accounting, security, dispute handling, or another approved retention purpose.",
  "Anonymize User Data":
    "The customer is requesting that RightRoute permanently remove or transform identifying information connected with their records. Information that can no longer reasonably be associated with the customer may remain for aggregate analytics, operational reporting, and system improvement.",
  "Delete and Anonymize Retained Data":
    "The customer is requesting that RightRoute delete personal information that is no longer required and permanently remove identifying information from records retained for approved analytics, legal, security, accounting, or operational purposes.",
};

const accountWarnings = {
  "ethancaldwell@gmail.com": ["Active paid subscription"],
  "marcusbennett@yahoo.com": ["Open billing dispute"],
  "danielreed@outlook.com": ["Previous privacy request already open"],
  "nathanparker@hotmail.com": ["Customer account blocked"],
};

const warningMessages = {
  "Active paid subscription":
    "The user may be asking for a data deletion for an active open account.",
  "Open billing dispute":
    "The Fleet plan customer may not have made a payment and wants to destroy any records related to missed payments.",
  "Previous privacy request already open":
    "The customer has previously submitted a data request and the request has not been completed.",
  "Customer account blocked": "The customer's account is currently blocked.",
};

const demoAccounts = {
  "ethancaldwell@gmail.com": {
    "Customer name": "Ethan Caldwell",
    "Verified account email": "ethancaldwell@gmail.com",
    "User ID": "USR-1001",
    "Plan type": "Fleet",
    "Account status": "Active",
    "Account creation date": "01/15/2024",
    "Phone number": "+1 555-0101",
  },
  "marcusbennett@yahoo.com": {
    "Customer name": "Marcus Bennett",
    "Verified account email": "marcusbennett@yahoo.com",
    "User ID": "USR-1002",
    "Plan type": "Fleet",
    "Account status": "Active",
    "Account creation date": "03/22/2024",
    "Phone number": "+1 555-0102",
  },
  "danielreed@outlook.com": {
    "Customer name": "Daniel Reed",
    "Verified account email": "danielreed@outlook.com",
    "User ID": "USR-1003",
    "Plan type": "Single",
    "Account status": "Active",
    "Account creation date": "06/08/2024",
    "Phone number": "+1 555-0103",
  },
  "nathanparker@hotmail.com": {
    "Customer name": "Nathan Parker",
    "Verified account email": "nathanparker@hotmail.com",
    "User ID": "USR-1004",
    "Plan type": "Single",
    "Account status": "Blocked",
    "Account creation date": "09/19/2024",
    "Phone number": "+1 555-0104",
  },
};

const createRequestId = () => {
  const year = new Date().getFullYear();
  const storageKey = "data-protection-used-request-numbers";
  const usedNumbers = new Set(
    JSON.parse(localStorage.getItem(storageKey) || "[]"),
  );
  const availableNumbers = Array.from(
    { length: 9000 },
    (_, index) => index + 1000,
  ).filter((number) => !usedNumbers.has(number));
  const number =
    availableNumbers[Math.floor(Math.random() * availableNumbers.length)];

  usedNumbers.add(number);
  localStorage.setItem(storageKey, JSON.stringify([...usedNumbers]));
  return `DR-${year}-${String(number).padStart(4, "0")}`;
};

const DataProtection = () => {
  const administratorName = "Admin";
  const [requestId] = useState(createRequestId);
  const [requestedAt] = useState(() => new Date().toLocaleString());
  const [requestType, setRequestType] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [account, setAccount] = useState(null);
  const [accountNotFound, setAccountNotFound] = useState(false);
  const [warnings, setWarnings] = useState([]);
  const [source, setSource] = useState("Other");
  const [approvalReceived, setApprovalReceived] = useState(false);
  const [approvalSource, setApprovalSource] = useState("");
  const [approvalSourceChecked, setApprovalSourceChecked] = useState(false);
  const [approvalDate, setApprovalDate] = useState("");
  const [approvalDateChecked, setApprovalDateChecked] = useState(false);
  const [confirmation, setConfirmation] = useState(false);
  const [notes, setNotes] = useState("");
  const [savedNotes, setSavedNotes] = useState("");
  const [eventLog, setEventLog] = useState([]);
  const [newRequests, setNewRequests] = useState(requestGroups[0].rows);
  const [pendingRequests, setPendingRequests] = useState(requestGroups[1].rows);
  const [completedRequests, setCompletedRequests] = useState(requestGroups[2].rows);
  const [activeFormOpen, setActiveFormOpen] = useState(true);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [approvalEmailSent, setApprovalEmailSent] = useState(false);
  const [performOpen, setPerformOpen] = useState(false);
  const [exportResultOpen, setExportResultOpen] = useState(false);
  const [exportResult, setExportResult] = useState(null);
  const [requestProcessed, setRequestProcessed] = useState(false);
  const [completionOpen, setCompletionOpen] = useState(false);
  const checksComplete = approvalReceived && approvalSourceChecked && approvalSource.trim() && approvalDateChecked && approvalDate.trim() && confirmation;
  const pendingReady = Boolean(account?.["Verified account email"] && requestType && approvalEmailSent);
  const completionReady = checksComplete && requestProcessed && (requestType !== "Export User Data" || exportResult);

  const saveNoteToEventLog = () => {
    if (!notes.trim()) return;
    const event = {
      id: requestId,
      savedAt: new Date().toLocaleString(),
      administrator: administratorName,
      note: notes.trim(),
    };
    setSavedNotes(notes.trim());
    setEventLog((current) => [event, ...current]);
    setNotes("");
  };

  const saveAsNew = () => {
    const savedAt = new Date().toLocaleString();
    const email = account?.["Verified account email"] || customerEmail.trim();
    const name = account?.["Customer name"] || "Unknown customer";
    setNewRequests((current) => [
      [`${name}\n${email}`, requestType || "Not selected", ""],
      ...current,
    ]);
    setEventLog((current) => [
      {
        id: requestId,
        savedAt,
        administrator: administratorName,
        note: `Request saved as New Request by ${administratorName}.`,
      },
      ...current,
    ]);
  };

  const sendCustomerEmail = () => {
    const message = emailMessage.trim();
    if (!message || !account) return;
    setEventLog((current) => [
      {
        id: requestId,
        savedAt: new Date().toLocaleString(),
        administrator: administratorName,
        note: `Email sent to ${account["Verified account email"]}: ${message}`,
      },
      ...current,
    ]);
    setEmailMessage("");
    setEmailOpen(false);
    setApprovalEmailSent(true);
  };

  const findCustomer = () => {
    const email = customerEmail.trim().toLowerCase();
    setAccount(demoAccounts[email] || null);
    setAccountNotFound(!demoAccounts[email]);
    setWarnings(
      (accountWarnings[email] || []).map((title) => ({
        title,
        detail: warningMessages[title],
      })),
    );
  };

  const openRequest = (row) => {
    const [name, email] = row[0].split("\n");
    const matchedAccount = demoAccounts[email.toLowerCase()];
    setCustomerEmail(email);
    setAccount(matchedAccount || {
      "Customer name": name,
      "Verified account email": email,
    });
    setAccountNotFound(false);
    setRequestType(row[1] === "Anonymize" ? "Anonymize User Data" : row[1] === "Delete" ? "Delete User Data" : row[1] === "Delete & Anonymize" ? "Delete and Anonymize Retained Data" : row[1]);
    setWarnings(
      (accountWarnings[email.toLowerCase()] || []).map((title) => ({
        title,
        detail: warningMessages[title],
      })),
    );
    setActiveFormOpen(true);
  };

  const saveAsPendingApproval = () => {
    if (!pendingReady) return;
    const savedAt = new Date().toLocaleString();
    const email = account["Verified account email"];
    const name = account["Customer name"];
    setPendingRequests((current) => [
      [`${name}\n${email}`, requestType, savedAt.split(",")[0]],
      ...current,
    ]);
    setEventLog((current) => [
      {
        id: requestId,
        savedAt,
        administrator: administratorName,
        note: `Request placed in Pending Approval by ${administratorName}. Approval email sent on ${savedAt}.`,
      },
      ...current,
    ]);
    setActiveFormOpen(false);
  };

  const performApprovedRequest = () => {
    const completedAt = new Date().toLocaleString();
    const outcomeNotes = {
      "Export User Data": "Export completed. ZIP package generated on",
      "Delete User Data": "Deletion workflow completed on",
      "Anonymize User Data": "Anonymization completed on",
      "Delete and Anonymize Retained Data": "Deletion and anonymization completed on",
    };
    const outcome = outcomeNotes[requestType];
    const systemNote = requestType === "Delete User Data"
      ? `${outcome} ${completedAt}. Eligible personal data was removed from active systems. Limited records retained under the RightRoute retention policy are listed below. Retained categories and reasons will be provided.`
      : requestType === "Anonymize User Data"
        ? `${outcome} ${completedAt}. Identifying fields were removed or irreversibly transformed from retained records.`
        : requestType === "Delete and Anonymize Retained Data"
          ? `${outcome} ${completedAt}. Eligible personal data was deleted, and identifying information was removed from retained records.`
          : `${outcome || "Request completed on"} ${completedAt}.`;
    setSavedNotes(systemNote);
    setEventLog((current) => [
      {
        id: requestId,
        savedAt: completedAt,
        administrator: administratorName,
        note: systemNote,
      },
      ...current,
    ]);
    setPerformOpen(false);
    setRequestProcessed(true);
    if (requestType === "Export User Data") {
      const createdAt = new Date();
      setExportResult({
        createdAt: createdAt.toLocaleDateString(),
        expiresAt: new Date(createdAt.getTime() + 7 * 86400000).toLocaleDateString(),
      });
      setExportResultOpen(true);
    }
  };

  const sendCompletionEmail = () => {
    const completedAt = new Date().toLocaleString();
    const email = account["Verified account email"];
    const name = account["Customer name"];
    setCompletedRequests((current) => [
      [`${name}\n${email}`, requestType, completedAt.split(",")[0]],
      ...current,
    ]);
    setEventLog((current) => [
      {
        id: requestId,
        savedAt: completedAt,
        administrator: administratorName,
        note: `Completion email sent to ${email}. Request moved to Completed Requests and closed.`,
      },
      ...current,
    ]);
    setCompletionOpen(false);
    setActiveFormOpen(false);
  };

  return (
    <main className="data-protection-page min-h-full bg-white px-2 py-3 text-sm text-[#777] md:px-8 md:py-6">
      <h1 className="mb-8 text-xl font-normal text-[#999] md:text-2xl">
        Data protection
      </h1>
      <div className="grid gap-4 xl:grid-cols-[1fr_1.08fr]">
        {activeFormOpen && <section className="min-w-0 rounded border border-[#ddd] p-3">
          <div className="mb-3 flex items-center justify-between border-b border-[#ddd] pb-2">
            <h2 className="font-bold text-[#333]">Active Request Form</h2>
            <span className="text-[9px] text-[#444]">
              ID: {requestId}&nbsp;&nbsp; Date Requested: {requestedAt}
            </span>
          </div>
          <div className="mb-3 grid grid-cols-2 gap-3">
            <label className="block font-semibold">
              Customer email
              <span className="mt-1 flex">
                <input
                  value={customerEmail}
                  onChange={(event) => {
                    setCustomerEmail(event.target.value);
                    setWarnings([]);
                    setAccount(null);
                    setAccountNotFound(false);
                  }}
                  className="h-7 min-w-0 flex-1 border border-[#ddd] px-2 font-normal outline-none"
                  placeholder="Enter email and click Find"
                />
                <button
                  type="button"
                  onClick={findCustomer}
                  className="ml-1 h-7 border border-[#ccc] bg-[#f4f4f4] px-2"
                >
                  Find
                </button>
              </span>
              {accountNotFound && (
                <span className="mt-1 block font-normal text-red-600">
                  No RightRoute account was found for this email.
                </span>
              )}
            </label>
            <div className="text-[10px] font-semibold text-red-600">
              <span className="text-sm">Warning</span>
              {warnings.map((warning) => (
                <p key={warning.title} className="mt-1 leading-tight">
                  <strong>{warning.title}</strong>
                  <br />
                  <span className="font-normal">{warning.detail}</span>
                </p>
              ))}
            </div>
          </div>
          <div className="mb-3 grid grid-cols-2 gap-3">
            <label className="font-semibold">
              Source of request
              <select
                value={source}
                onChange={(event) => setSource(event.target.value)}
                className="mt-1 h-7 w-full border border-[#ddd] bg-white px-2 font-normal"
              >
                <option>Phone</option>
                <option>Email</option>
                <option>Written Request</option>
                <option>Other</option>
              </select>
            </label>
            <input
              disabled={source !== "Other"}
              className="mt-5 h-7 border border-[#ddd] px-2 font-normal disabled:bg-[#f5f5f5] disabled:text-[#aaa]"
              placeholder="Describe request source"
            />
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2">
            {fieldGroups
              .flatMap((group) => group)
              .map((label) => (
                <label key={label} className="font-semibold">
                  {label}
                  {label === "Request type" ? (
                    <select
                      value={requestType}
                      onChange={(event) => setRequestType(event.target.value)}
                      className="mt-1 h-7 w-full border border-[#ddd] bg-white px-2 font-normal"
                    >
                      <option value="">Select request type</option>
                      <option>Export User Data</option>
                      <option>Delete User Data</option>
                      <option>Anonymize User Data</option>
                      <option>Delete and Anonymize Retained Data</option>
                    </select>
                  ) : (
                    <input
                      value={account?.[label] || ""}
                      readOnly
                      className="mt-1 h-7 w-full border border-[#ddd] px-2 font-normal"
                    />
                  )}
                </label>
              ))}
          </div>
          {requestType && (
            <div className="mt-3 border-t border-[#ddd] pt-2">
              <h3 className="mb-1 font-semibold">{requestType}</h3>
              <p className="leading-tight">
                {requestDescriptions[requestType]}
              </p>
            </div>
          )}
          <label className="mt-3 block font-semibold">
            New notes and correspondence
            <span className="relative mt-1 block">
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="h-[96px] w-full resize-none border border-[#ddd] p-2 pb-9 font-normal"
                placeholder="Customer emailed approval of requested action."
              />
              <button
                type="button"
                onClick={saveNoteToEventLog}
                className="absolute bottom-2 right-2 rounded border border-[#bbb] bg-[#f7f7f7] px-2 py-1 font-normal text-[#555] shadow-sm"
              >
                Save
              </button>
            </span>
            {savedNotes && (
              <span className="mt-1 block font-normal text-green-700">
                Note saved.
              </span>
            )}
          </label>
          <div className="mt-3">
            <h3 className="font-semibold">Previous notes and correspondence</h3>
            {eventLog.map((event) => (
              <p
                key={`${event.id}-${event.savedAt}`}
                className="mt-1 leading-tight"
              >
                <strong>
                  {event.savedAt} – {event.administrator} – Event {event.id}
                </strong>
                <br />
                {event.note}
              </p>
            ))}
            <p className="mt-2 leading-tight">
              <strong>August 1, 2026, 11:05 AM – Brad Cooper</strong>
              <br />
              Admin sent confirmation email detailing request and requested a
              review and approval for action to take place.
            </p>
            <p className="mt-2 leading-tight">
              <strong>July 31, 2026, 4:35 PM – Brad Cooper</strong>
              <br />
              Customer requested official RightRoute account and all saved
              permit and route information.
            </p>
          </div>
        </section>}
        <section className="min-w-0 space-y-4">
          {requestGroups.map((group) => (
            <div key={group.title}>
              {(() => {
                const rows = (group.title === "New Requests" ? newRequests : group.title === "Pending Approval" ? pendingRequests : completedRequests).slice(0, 4);
                return (
                  <>
              <h2 className="mb-2 font-bold text-[#333]">{group.title}</h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[430px] border-collapse">
                  <thead>
                    <tr className="bg-[#f3f3f3] text-left text-[9px] text-[#999]">
                      {group.columns.map((column, index) => (
                        <th key={`${column}-${index}`} className="px-2 py-2">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr
                        key={row[0]}
                        className="border-b border-white odd:bg-white even:bg-[#f7f7f7]"
                      >
                        <td className="whitespace-pre-line px-2 py-1 leading-tight">
                          {row[0]}
                        </td>
                        <td className="px-2 py-1">{row[1]}</td>
                        <td className="px-2 py-1">{row[2]}</td>
                        <td className="px-2 py-1">
                          <button
                            type="button"
                            onClick={() => openRequest(row)}
                            className="rounded border border-[#ccc] bg-[#fafafa] px-2 py-0.5"
                          >
                            Open
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between border-b border-[#ddd] py-2 text-[#888]">
                <span>Showing 1-{rows.length} of {rows.length} results</span>
                <span className="underline">
                  Previous&nbsp; 1&nbsp; 2&nbsp; 3&nbsp; Next
                </span>
              </div>
                  </>
                );
              })()}
            </div>
          ))}
        </section>
      </div>
      <div className="mt-4 border-t border-[#ddd] pt-3">
        <p className="mb-2 font-semibold">
          All checks must be completed before initiating request.
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <label>
            <input type="checkbox" checked={approvalReceived} onChange={(event) => setApprovalReceived(event.target.checked)} /> Approval received
          </label>
          <label>
            <input type="checkbox" checked={approvalSourceChecked} onChange={(event) => setApprovalSourceChecked(event.target.checked)} /> Approval source:{" "}
            <input
              value={approvalSource}
              onChange={(event) => setApprovalSource(event.target.value)}
              className="ml-1 h-5 w-24 border border-[#ddd] px-1"
              placeholder="Enter source"
            />
          </label>
          <label>
            <input type="checkbox" checked={approvalDateChecked} onChange={(event) => setApprovalDateChecked(event.target.checked)} /> Approval received date:{" "}
            <input
              value={approvalDate}
              onChange={(event) => setApprovalDate(event.target.value)}
              className="ml-1 h-5 w-20 border border-[#ddd] px-1"
              placeholder="Enter date"
            />
          </label>
          <label className="basis-full">
            <input
              type="checkbox"
              checked={confirmation}
              onChange={(event) => setConfirmation(event.target.checked)}
            />{" "}
            I confirm that approval was received from the verified account email
            and that the requested action shown above is correct, and if this
            request is for deletion and anonymization I understand that this
            action may be irreversible.
          </label>
        </div>
        <div className="mt-3 flex flex-wrap gap-1 rounded-lg bg-[#fafafa] p-2">
          <button
            type="button"
            onClick={() => setEmailOpen(true)}
            disabled={!account}
            className="rounded bg-[#151d56] px-3 py-1.5 text-white disabled:cursor-not-allowed disabled:bg-[#d4d4d4]"
          >
            EMAIL CUSTOMER
          </button>
          <button
            type="button"
            onClick={saveAsNew}
            className="rounded bg-[#151d56] px-3 py-1.5 text-white"
          >
            SAVE AS NEW
          </button>
          <button
            type="button"
            onClick={saveAsPendingApproval}
            disabled={!pendingReady}
            className={`rounded px-3 py-1.5 text-white ${pendingReady ? "bg-[#151d56]" : "bg-[#d4d4d4] disabled:cursor-not-allowed"}`}
          >
            SAVE AS PENDING APPROVAL
          </button>
          <button
            type="button"
            onClick={() => setPerformOpen(true)}
            disabled={!checksComplete}
            className={`rounded px-3 py-1.5 text-white ${checksComplete ? "bg-[#ff823d]" : "bg-[#d4d4d4] disabled:cursor-not-allowed"}`}
          >
            PERFORM APPROVED REQUEST
          </button>
          <button
            type="button"
            onClick={() => setCompletionOpen(true)}
            disabled={!completionReady}
            className={`rounded px-3 py-1.5 text-white ${completionReady ? "bg-[#ff823d]" : "bg-[#d4d4d4] disabled:cursor-not-allowed"}`}
          >
            SEND COMPLETION EMAIL AND CLOSE
          </button>
        </div>
      </div>
      {emailOpen && account && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded border border-[#ccc] bg-white p-5 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-[#444]">Email customer</h2>
              <button type="button" onClick={() => setEmailOpen(false)} className="text-lg text-[#666]" aria-label="Close email preview">&times;</button>
            </div>
            <label className="mb-3 block font-semibold">To
              <input value={account["Verified account email"]} readOnly className="mt-1 h-8 w-full border border-[#ccc] bg-[#f5f5f5] px-2 font-normal" />
            </label>
            <label className="mb-3 block font-semibold">Subject
              <input value={`${requestId} - RightRoute data request`} readOnly className="mt-1 h-8 w-full border border-[#ccc] bg-[#f5f5f5] px-2 font-normal" />
            </label>
            <p className="mb-2 text-[10px] text-[#555]">The email will include the request ID, customer account information, selected request type, warning details, and request description.</p>
            <label className="block font-semibold">Personalized message
              <textarea value={emailMessage} onChange={(event) => setEmailMessage(event.target.value)} className="mt-1 h-24 w-full resize-none border border-[#ccc] p-2 font-normal" placeholder="Add a short message for the customer." />
            </label>
            <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setEmailOpen(false)} className="rounded border border-[#bbb] px-3 py-1.5">Cancel</button><button type="button" onClick={sendCustomerEmail} disabled={!emailMessage.trim()} className="rounded bg-[#151d56] px-3 py-1.5 text-white disabled:cursor-not-allowed disabled:bg-[#d4d4d4]">Send</button></div>
          </div>
        </div>
      )}
      {performOpen && account && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-[424px] rounded border border-[#d8d8d8] bg-[#f4f4f4] p-3 text-[11px] text-[#888] shadow-lg">
            <div className="space-y-1">
              <p>Customer name: {account["Customer name"]}</p>
              <p>Account email: {account["Verified account email"]}</p>
              <p>Request type: {requestType}</p>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <button type="button" onClick={() => setPerformOpen(false)} className="rounded border border-[#c8c8c8] bg-[#fafafa] px-2 py-1 text-[#777] shadow-sm">Cancel</button>
              <button type="button" onClick={performApprovedRequest} className="rounded border border-[#c8c8c8] bg-[#fafafa] px-2 py-1 text-[#777] shadow-sm">Confirm and Perform Request</button>
            </div>
          </div>
        </div>
      )}
      {exportResultOpen && exportResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded border border-[#ccc] bg-[#f4f4f4] p-3 text-[11px] text-[#888] shadow-lg">
            <p className="font-semibold uppercase">Export completed</p>
            <p>File created date: {exportResult.createdAt}</p>
            <p>Download expiration date: {exportResult.expiresAt} (7 days)</p>
            <p>File size: 3.5MB</p>
            <div className="mt-3 flex justify-end"><button type="button" onClick={() => setExportResultOpen(false)} className="rounded border border-[#c8c8c8] bg-[#fafafa] px-2 py-1 text-[#777] shadow-sm">Close</button></div>
          </div>
        </div>
      )}
      {completionOpen && account && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded border border-[#ccc] bg-white p-5 shadow-lg">
            <h2 className="mb-3 font-semibold text-[#444]">Completion email preview</h2>
            <p className="mb-2 text-[11px] text-[#555]">To: {account["Verified account email"]}</p>
            <div className="max-h-56 overflow-y-auto rounded border border-[#ddd] bg-[#fafafa] p-3 text-[11px] text-[#555]">
              <p>Request ID: {requestId}</p>
              <p>Customer: {account["Customer name"]}</p>
              <p>Request type: {requestType}</p>
              <p className="mt-2">The request process completed successfully. This email summarizes the request and its result without exposing unnecessary internal security details.</p>
              {requestType === "Export User Data" && <p className="mt-2 font-semibold">Download link: available for 7 days only. It is not a permanent public link and will be removed automatically after the retention period.</p>}
            </div>
            <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setCompletionOpen(false)} className="rounded border border-[#bbb] px-3 py-1.5">Cancel</button><button type="button" onClick={sendCompletionEmail} className="rounded bg-[#151d56] px-3 py-1.5 text-white">Send and Close</button></div>
          </div>
        </div>
      )}
    </main>
  );
};

export default DataProtection;
