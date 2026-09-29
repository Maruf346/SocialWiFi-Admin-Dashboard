import { useEffect, useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { auditLogsApi } from "../../api/auditLogsApi";

const PAGE_SIZE = 100;

const initialFilters = {
  date: "",
  user: "All Users",
  role: "All Roles",
  event: "All Event Types",
  section: "All Sections",
  outcome: "All Outcomes",
  search: "",
};

const FALLBACK_ACTIONS = [
  { value: "GET", label: "Get" },
  { value: "CREATE", label: "Create" },
  { value: "UPDATE", label: "Update" },
  { value: "DELETE", label: "Delete" },
];

const FALLBACK_STATUSES = [
  { value: "SUCCESS", label: "Success" },
  { value: "FAILED", label: "Failed" },
];

const toOption = (item) => {
  if (typeof item === "string") return { value: item, label: item };
  return {
    value: item.value ?? item.key ?? item.id ?? item.entity_type ?? item.entity_type_model ?? item.name ?? "",
    label: item.label ?? item.display ?? item.name ?? item.entity_type_label ?? item.value ?? item.key ?? "",
  };
};

const formatDateTime = (value) => {
  if (!value) return { date: "-", time: "-" };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: value, time: "" };
  return {
    date: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date),
    time: new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit" }).format(date),
  };
};

const normalizeLog = (log) => {
  const dateTime = formatDateTime(log.created_at);
  const section = log.entity_type_label || [log.entity_type_app, log.entity_type_model].filter(Boolean).join("/") || "-";

  return {
    id: log.id,
    date: dateTime.date,
    time: dateTime.time,
    user: log.user_name || log.user_email || "Unknown User",
    userEmail: log.user_email || "",
    role: "-",
    event: log.action_display || log.action || "-",
    actionValue: log.action || "",
    section,
    entityType: [log.entity_type_app, log.entity_type_model].filter(Boolean).join("."),
    action: log.message || log.action_display || "-",
    target: log.entity_display || (log.entity_id ? `ID: ${log.entity_id}` : "N/A"),
    entityId: log.entity_id || "",
    ip: log.ip_address || "-",
    device: log.device_info || "-",
    outcome: log.status_display || log.status || "-",
    statusValue: log.status || "",
    metadata: log.metadata_json,
    createdAt: log.created_at,
  };
};

const StatCard = ({ label, value, note }) => (
  <div className="h-[84px] min-w-0 rounded-lg border border-[#e1e1e1] bg-[#fafafa] px-3 py-2 shadow-sm">
    <p className="max-w-[110px] text-[11px] font-semibold leading-[13px] text-[#555]">{label}</p>
    <strong className="block text-lg leading-6 text-[#424242]">{value}</strong>
    <span className="text-[10px] text-[#555]">{note}</span>
  </div>
);

const AuditLog = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [rows, setRows] = useState([]);
  const [options, setOptions] = useState({ actions: FALLBACK_ACTIONS, statuses: FALLBACK_STATUSES, entityTypes: [] });
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedLogId, setSelectedLogId] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadOptions = async () => {
      try {
        const response = await auditLogsApi.options();
        if (!isMounted) return;
        setOptions({
          actions: (response?.actions || FALLBACK_ACTIONS).map(toOption).filter((item) => item.value),
          statuses: (response?.statuses || FALLBACK_STATUSES).map(toOption).filter((item) => item.value),
          entityTypes: (response?.entity_types || []).map(toOption).filter((item) => item.value),
        });
      } catch {
        if (isMounted) setOptions({ actions: FALLBACK_ACTIONS, statuses: FALLBACK_STATUSES, entityTypes: [] });
      }
    };

    loadOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  const query = useMemo(() => {
    const nextQuery = {
      limit: PAGE_SIZE,
      offset,
      search: appliedFilters.search,
    };

    if (appliedFilters.date) {
      nextQuery.date_from = appliedFilters.date;
      nextQuery.date_to = appliedFilters.date;
    }
    if (appliedFilters.user && !appliedFilters.user.startsWith("All ")) nextQuery.user_email = appliedFilters.user;
    if (appliedFilters.event && !appliedFilters.event.startsWith("All ")) nextQuery.action = appliedFilters.event;
    if (appliedFilters.section && !appliedFilters.section.startsWith("All ")) nextQuery.entity_type = appliedFilters.section;
    if (appliedFilters.outcome && !appliedFilters.outcome.startsWith("All ")) nextQuery.status = appliedFilters.outcome;

    return nextQuery;
  }, [appliedFilters, offset]);

  useEffect(() => {
    let isMounted = true;

    const loadLogs = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await auditLogsApi.list(query);
        if (!isMounted) return;
        const list = Array.isArray(response) ? response : response?.results || [];
        setRows(list.map(normalizeLog));
        setSelectedRows([]);
        setSelectedLogId(null);
        setSelectedLog(null);
      } catch (err) {
        if (!isMounted) return;
        setRows([]);
        setError(err.message || "Failed to load audit logs.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadLogs();

    return () => {
      isMounted = false;
    };
  }, [query]);

  const userOptions = useMemo(() => {
    const users = Array.from(new Set(rows.map((row) => row.userEmail).filter(Boolean)));
    return ["All Users", ...users];
  }, [rows]);

  const statValues = useMemo(() => {
    const success = rows.filter((row) => row.statusValue === "SUCCESS").length;
    const failed = rows.filter((row) => row.statusValue === "FAILED").length;
    const critical = rows.filter((row) => ["DELETE", "UPDATE"].includes(row.actionValue)).length;
    const exports = rows.filter((row) => /export|download/i.test(row.action)).length;
    return { success, failed, critical, exports };
  }, [rows]);

  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));

  const applyFilters = () => {
    setAppliedFilters(filters);
    setOffset(0);
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setOffset(0);
    setSelectedRows([]);
    setSelectedLogId(null);
    setSelectedLog(null);
  };

  const handleFilterAction = (event) => {
    const button = event.target.closest("button");
    if (button && ["APPLY FILTERS", "Go"].includes(button.textContent.trim())) applyFilters();
  };

  const toggleRow = (row) => {
    setSelectedRows((current) => current.includes(row.id) ? current.filter((id) => id !== row.id) : [...current, row.id]);
  };

  const toggleAllRows = () => setSelectedRows((current) => current.length === rows.length ? [] : rows.map((row) => row.id));

  const showSelectedDetails = async () => {
    const firstSelected = selectedRows[0];
    if (!firstSelected) return;
    try {
      const response = await auditLogsApi.retrieve(firstSelected);
      setSelectedLogId(firstSelected);
      setSelectedLog(normalizeLog(response));
    } catch (err) {
      setError(err.message || "Failed to load audit log details.");
    }
  };

  const exportCsv = () => {
    const headers = ["Date", "Time", "User", "Role", "Event", "Section", "Action", "Target", "IP", "Device", "Outcome"];
    const body = rows.map((row) => [row.date, row.time, row.user, row.role, row.event, row.section, row.action, row.target, row.ip, row.device, row.outcome]);
    const csv = [headers, ...body].map((row) => row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.download = "audit-log.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const details = selectedLogId ? selectedLog : null;
  const hasNextPage = rows.length === PAGE_SIZE;

  return (
    <div onClick={handleFilterAction} className="audit-log-page min-h-full bg-white px-2 py-3 text-[#777] md:px-8 md:py-6">
      <div className="mb-8"><h1 className="text-xl font-normal text-[#999] md:text-2xl">Audit logs</h1></div>
      <div className="mb-4 grid max-w-[555px] grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Successful Events" value={statValues.success} note="current page" />
        <StatCard label="Failed Events" value={statValues.failed} note="current page" />
        <StatCard label="Critical Actions" value={statValues.critical} note="update/delete" />
        <StatCard label="Exports/Downloads" value={statValues.exports} note="current page" />
      </div>

      <div className="border border-[#d8d8d8] bg-white p-2 md:p-3">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-7">
          <label className="text-[10px] font-semibold">Date Range<input type="date" value={filters.date} onChange={(event) => updateFilter("date", event.target.value)} className="mt-1 h-7 w-full border border-[#ccc] px-1 text-[10px] font-normal" /></label>
          <label className="text-[10px] font-semibold">User<select value={filters.user} onChange={(event) => updateFilter("user", event.target.value)} className="mt-1 h-7 w-full border border-[#ccc] bg-white px-1 text-[10px] font-normal">{userOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
          <label className="text-[10px] font-semibold">Role<select value={filters.role} onChange={(event) => updateFilter("role", event.target.value)} className="mt-1 h-7 w-full border border-[#ccc] bg-white px-1 text-[10px] font-normal"><option>All Roles</option></select></label>
          <label className="text-[10px] font-semibold">Event<select value={filters.event} onChange={(event) => updateFilter("event", event.target.value)} className="mt-1 h-7 w-full border border-[#ccc] bg-white px-1 text-[10px] font-normal"><option>All Event Types</option>{options.actions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          <label className="text-[10px] font-semibold">Section<select value={filters.section} onChange={(event) => updateFilter("section", event.target.value)} className="mt-1 h-7 w-full border border-[#ccc] bg-white px-1 text-[10px] font-normal"><option>All Sections</option>{options.entityTypes.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          <label className="text-[10px] font-semibold">Outcome<select value={filters.outcome} onChange={(event) => updateFilter("outcome", event.target.value)} className="mt-1 h-7 w-full border border-[#ccc] bg-white px-1 text-[10px] font-normal"><option>All Outcomes</option>{options.statuses.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          <label className="text-[10px] font-semibold">Search<div className="mt-1 flex h-7 items-center gap-1 font-normal"><div className="flex h-7 min-w-0 flex-1 items-center rounded border border-[#ccc] px-2"><Search size={13} className="mr-1 shrink-0" /><input value={filters.search} onChange={(event) => updateFilter("search", event.target.value)} placeholder="Search by keyword..." className="min-w-0 flex-1 outline-none" /></div><button type="button" className="h-7 shrink-0 rounded border border-[#bbb] bg-[#f4f4f4] px-2 text-[10px] font-normal text-[#666] hover:bg-[#e8e8e8]">Go</button></div></label>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button type="button" className="h-7 rounded bg-[#ff823d] px-3 text-[10px] font-semibold text-white">APPLY FILTERS</button>
          <button type="button" onClick={exportCsv} className="flex h-7 items-center gap-1 rounded bg-[#18205c] px-3 text-[10px] text-white"><Download size={13} /> EXPORT CSV</button>
          <button type="button" onClick={showSelectedDetails} disabled={!selectedRows.length} className="h-7 rounded bg-[#18205c] px-3 text-[10px] text-white disabled:cursor-not-allowed disabled:opacity-50">VIEW DETAILS</button>
          <button type="button" onClick={clearFilters} className="ml-auto h-7 rounded bg-[#18205c] px-3 text-[10px] text-white">CLEAR FILTERS</button>
        </div>
      </div>

      {error && <div className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700">{error}</div>}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[1000px] border-collapse text-left text-[10px]">
          <thead><tr className="bg-[#f3f3f3] text-[9px] uppercase text-[#999]"><th className="w-7 px-2"><input type="checkbox" checked={rows.length > 0 && selectedRows.length === rows.length} onChange={toggleAllRows} aria-label="Select all logs" /></th>{["Date & Time", "User", "Role", "Event Type", "Section/Subsection", "Action Details", "Target/Record", "IP/Device", "Outcome"].map((heading) => <th key={heading} className="px-2 py-2">{heading}</th>)}</tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={10} className="py-6 text-center text-[#888]">Loading audit logs...</td></tr> : rows.length === 0 ? <tr><td colSpan={10} className="py-6 text-center text-[#888]">No audit logs found.</td></tr> : rows.map((row) => <tr key={row.id} className="border-b border-white bg-[#f7f7f7] even:bg-[#fbfbfb]"><td className="px-2"><input type="checkbox" checked={selectedRows.includes(row.id)} onChange={() => toggleRow(row)} aria-label={`Select ${row.action}`} /></td><td className="px-2 py-2">{row.date}<br />{row.time}</td><td className="px-2">{row.user}</td><td className="px-2">{row.role}</td><td className="px-2">{row.event}</td><td className="px-2">{row.section}</td><td className="px-2">{row.action}</td><td className="px-2">{row.target}</td><td className="px-2">{row.ip}<br />{row.device}</td><td className={`px-2 font-semibold ${row.statusValue === "FAILED" ? "text-[#d65b4a]" : "text-[#4f8c62]"}`}>{row.outcome}</td></tr>)}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-b border-[#eee] py-3 text-[10px]"><span>Showing {rows.length ? offset + 1 : 0}-{offset + rows.length} results</span><span className="flex items-center gap-2"><button type="button" disabled={offset === 0} onClick={() => setOffset((current) => Math.max(0, current - PAGE_SIZE))} className="disabled:text-[#aaa]">Previous</button><span>{Math.floor(offset / PAGE_SIZE) + 1}</span><button type="button" disabled={!hasNextPage} onClick={() => setOffset((current) => current + PAGE_SIZE)} className="disabled:text-[#aaa]">Next</button></span></div>

      {details && <section className="mt-4 border border-[#d8d8d8] bg-white"><div className="flex items-center justify-between border-b border-[#ddd] bg-[#f5f5f5] px-3 py-2 text-[11px] font-semibold text-[#444]"><span>Log Details</span><span>Severity level: INFORMATION &nbsp;&nbsp; Session outcome: {details.statusValue || details.outcome}</span></div><div className="grid gap-2 p-3 text-[10px] sm:grid-cols-3"><p><b>Event ID:</b> {details.id}</p><p><b>Entity Type:</b> {details.entityType || "-"}</p><p><b>Performed by:</b> {details.user}</p><p><b>Event:</b> {details.event}</p><p><b>Action:</b> {details.action}</p><p><b>Affected record:</b> {details.target}</p></div></section>}
    </div>
  );
};

export default AuditLog;
