import { useMemo, useState } from 'react'
import { Download, Search } from 'lucide-react'

const auditRows = [
  { date: 'Jul 26, 2026', time: '10:41:26 AM', user: 'David Chen', role: 'Super Admin', event: 'Login', section: 'Dashboard/Overview', action: 'Admin login to dashboard', target: 'N/A', ip: '203.0.113.45', device: 'Chrome 12.4/macOS', outcome: 'Success' },
  { date: 'Jul 26, 2026', time: '10:07:12 AM', user: 'Unknown User', role: 'N/A', event: 'Login Attempt', section: 'Authentication', action: 'Failed login attempt', target: 'N/A', ip: '198.51.100.23', device: 'Chrome 12.4/Windows', outcome: 'Failed' },
  { date: 'Jul 26, 2026', time: '09:52:18 AM', user: 'Sarah Martinez', role: 'Finance Manager', event: 'View', section: 'Revenue Metrics/MRR', action: 'Viewed MRR dashboard', target: 'MRR Dashboard', ip: '203.0.113.12', device: 'Edge 12.4/Windows', outcome: 'Success' },
  { date: 'Jul 26, 2026', time: '09:43:20 AM', user: 'Mike Johnson', role: 'Support Agent', event: 'View', section: 'Support Tickets/Inbox', action: 'Opened support ticket', target: 'Ticket #RR-2026-0065', ip: '203.0.113.45', device: 'Chrome 12.4/macOS', outcome: 'Success' },
  { date: 'Jul 26, 2026', time: '09:31:22 AM', user: 'Mike Johnson', role: 'Support Agent', event: 'Update', section: 'Support Tickets/Inbox', action: 'Responded to customer', target: 'Ticket #RR-2026-0065', ip: '203.0.113.45', device: 'Chrome 12.4/macOS', outcome: 'Success' },
  { date: 'Jul 26, 2026', time: '09:20:26 AM', user: 'Mike Johnson', role: 'Support Agent', event: 'Create', section: 'Users/User Management', action: 'Created new user account', target: 'User: Jessica Lane', ip: '203.0.113.54', device: 'Chrome 12.4/macOS', outcome: 'Success' },
  { date: 'Jul 26, 2026', time: '08:56:44 AM', user: 'David Chen', role: 'Super Admin', event: 'Update', section: 'Subscriptions/Accounts', action: 'Changed seat count', target: 'Team: Blue Line Trucking', ip: '203.0.113.45', device: 'Chrome 12.4/macOS', outcome: 'Success' },
  { date: 'Jul 26, 2026', time: '08:38:12 AM', user: 'David Chen', role: 'Super Admin', event: 'Update', section: 'Users/User Management', action: 'Reset user password', target: 'User: John Doe', ip: '203.0.113.12', device: 'Edge 12.4/Windows', outcome: 'Success' },
  { date: 'Jul 26, 2026', time: '08:11:22 AM', user: 'David Chen', role: 'Super Admin', event: 'Update', section: 'Subscriptions/Plans', action: 'Updated subscription plan', target: 'Account: Acme Logistics', ip: '203.0.113.12', device: 'Edge 12.4/Windows', outcome: 'Success' },
  { date: 'Jul 26, 2026', time: '08:05:22 AM', user: 'Sarah Martinez', role: 'Finance Manager', event: 'Export', section: 'Revenue Metrics/Reports', action: 'Exported revenue report', target: 'Report: MRR May 2026', ip: '203.0.113.45', device: 'Chrome 12.4/macOS', outcome: 'Success' },
  { date: 'Jul 26, 2026', time: '07:32:14 AM', user: 'David Chen', role: 'Super Admin', event: 'Update', section: 'Users/User Management', action: 'Changed user role', target: 'User: Alex Jones', ip: '203.0.113.45', device: 'Chrome 12.4/macOS', outcome: 'Warning' },
  { date: 'Jul 26, 2026', time: '07:21:30 AM', user: 'David Chen', role: 'Super Admin', event: 'Update', section: 'Documents/Processed PDFs', action: 'Deleted processed PDF', target: 'PDF: Load_12345.pdf', ip: '203.0.113.45', device: 'Chrome 12.4/macOS', outcome: 'Success' },
  { date: 'Jul 26, 2026', time: '06:58:10 AM', user: 'Unknown User', role: 'N/A', event: 'Login Attempt', section: 'Data protection', action: 'Attempted restricted access', target: 'Security settings', ip: '198.51.100.23', device: 'Chrome 12.4/Windows', outcome: 'Blocked' },
]

const filterOptions = {
  user: ['All Users', 'David Chen', 'Mike Johnson', 'Sarah Martinez'],
  role: ['All Roles', 'Super Admin', 'Support Agent', 'Finance Manager'],
  event: [
    'All Event Types',
    'Login',
    'Logout',
    'Login Attempt',
    'View',
    'Create',
    'Update',
    'Delete',
    'Export',
    'Download',
    'Upload',
    'Send',
    'Assign',
    'Approve',
    'Reject',
    'Refund',
    'Permission Change',
    'Security Change',
  ],
  section: [
    'All Sections',
    'Admin user list',
    'Add user',
    'Plans list/edit/create',
    'List/manage/create',
    'Single acct management',
    'Team acct management',
    'Fleet acct management',
    'Subscription payments',
    'Fleet payments',
    'Billing/payments history',
    'Expenses',
    'Revenue metrics',
    'User resources',
    'Staff resources',
    'Email system login',
    'Support tickets',
    'Audit logs',
    'Data protection',
  ],
  outcome: ['All Outcomes', 'Success', 'Failed', 'Warning', 'Blocked'],
}

const initialFilters = { user: 'All Users', role: 'All Roles', event: 'All Event Types', section: 'All Sections', outcome: 'All Outcomes', search: '' }

const StatCard = ({ label, value, note }) => (
  <div className="h-[84px] min-w-0 rounded-lg border border-[#e1e1e1] bg-[#fafafa] px-3 py-2 shadow-sm">
    <p className="max-w-[110px] text-[11px] font-semibold leading-[13px] text-[#555]">{label}</p>
    <strong className="block text-lg leading-6 text-[#424242]">{value}</strong>
    <span className="text-[10px] text-[#555]">↗ {note}</span>
  </div>
)

const AuditLog = () => {
  const [filters, setFilters] = useState(initialFilters)
  const [appliedFilters, setAppliedFilters] = useState(initialFilters)
  const [selectedRows, setSelectedRows] = useState([])
  const [selectedLog, setSelectedLog] = useState(null)

  const filteredRows = useMemo(() => auditRows.filter((row) => Object.entries(appliedFilters).every(([key, value]) => {
    if (!value || value.startsWith('All ')) return true
    if (key === 'search') return Object.values(row).some((field) => field.toLowerCase().includes(value.toLowerCase()))
    return row[key] === value
  })), [appliedFilters])

  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }))
  const applyFilters = () => { setAppliedFilters(filters); setSelectedRows([]); setSelectedLog(null) }
  const clearFilters = () => { setFilters(initialFilters); setAppliedFilters(initialFilters); setSelectedRows([]); setSelectedLog(null) }
  const handleFilterAction = (event) => {
    const button = event.target.closest('button')
    if (button && ['APPLY FILTERS', 'Go'].includes(button.textContent.trim())) applyFilters()
  }
  const getRowId = (row) => `${row.time}-${row.user}`
  const toggleRow = (row) => setSelectedRows((current) => current.includes(getRowId(row)) ? current.filter((id) => id !== getRowId(row)) : [...current, getRowId(row)])
  const toggleAllRows = () => setSelectedRows((current) => current.length === filteredRows.length ? [] : filteredRows.map(getRowId))
  const showSelectedDetails = () => {
    const firstSelected = filteredRows.find((row) => selectedRows.includes(getRowId(row)))
    if (firstSelected) setSelectedLog(getRowId(firstSelected))
  }
  const exportCsv = () => {
    const header = Object.keys(auditRows[0]).join(',')
    const body = filteredRows.map((row) => Object.values(row).map((value) => `"${value}"`).join(',')).join('\n')
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([`${header}\n${body}`], { type: 'text/csv' }))
    link.download = 'audit-log.csv'
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return (
    <div onClick={handleFilterAction} className="audit-log-page min-h-full px-2 py-2 text-[#777] md:px-4 md:py-3">
      <div className="mb-3"><h1 className="text-xl font-normal text-[#999] md:text-2xl">Audit logs</h1></div>
      <div className="mb-4 grid max-w-[555px] grid-cols-2 gap-3 sm:grid-cols-4"><StatCard label="Successful Logins Today" value="2,145" note="12% vs yesterday" /><StatCard label="Failed Logins Today" value="17" note="21% vs yesterday" /><StatCard label="Critical Actions Today" value="26" note="8% vs yesterday" /><StatCard label="Exports/Downloads Today" value="42" note="15% vs yesterday" /></div>
      <div className="border border-[#d8d8d8] bg-white p-2 md:p-3"><div className="grid grid-cols-2 gap-2 md:grid-cols-7"><label className="text-[10px] font-semibold">Date Range<input type="date" defaultValue="2026-07-26" className="mt-1 h-7 w-full border border-[#ccc] px-1 text-[10px] font-normal" /></label>{Object.entries(filterOptions).map(([key, options]) => <label key={key} className="text-[10px] font-semibold">{key[0].toUpperCase() + key.slice(1)}<select value={filters[key]} onChange={(event) => updateFilter(key, event.target.value)} className="mt-1 h-7 w-full border border-[#ccc] bg-white px-1 text-[10px] font-normal">{options.map((option) => <option key={option}>{option}</option>)}</select></label>)}<label className="text-[10px] font-semibold">Search<div className="mt-1 flex h-7 items-center gap-1 font-normal"><div className="flex h-7 min-w-0 flex-1 items-center rounded border border-[#ccc] px-2"><Search size={13} className="mr-1 shrink-0" /><input value={filters.search} onChange={(event) => updateFilter('search', event.target.value)} placeholder="Search by keyword..." className="min-w-0 flex-1 outline-none" /></div><button type="button" onClick={() => setFilters((current) => ({ ...current }))} className="h-7 shrink-0 rounded border border-[#bbb] bg-[#f4f4f4] px-2 text-[10px] font-normal text-[#666] hover:bg-[#e8e8e8]">Go</button></div></label></div><div className="mt-2 flex flex-wrap items-center gap-2"><button type="button" className="h-7 rounded bg-[#ff823d] px-3 text-[10px] font-semibold text-white">APPLY FILTERS</button><button type="button" onClick={exportCsv} className="flex h-7 items-center gap-1 rounded bg-[#18205c] px-3 text-[10px] text-white"><Download size={13} /> EXPORT CSV</button><button type="button" onClick={showSelectedDetails} disabled={!selectedRows.length} className="h-7 rounded bg-[#18205c] px-3 text-[10px] text-white disabled:cursor-not-allowed disabled:opacity-50">VIEW DETAILS</button><button type="button" onClick={clearFilters} className="ml-auto h-7 rounded bg-[#18205c] px-3 text-[10px] text-white">CLEAR FILTERS</button></div></div>
      <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[1000px] border-collapse text-left text-[10px]"><thead><tr className="bg-[#f3f3f3] text-[9px] uppercase text-[#999]"><th className="w-7 px-2"><input type="checkbox" checked={filteredRows.length > 0 && selectedRows.length === filteredRows.length} onChange={toggleAllRows} aria-label="Select all logs" /></th>{['Date & Time', 'User', 'Role', 'Event Type', 'Section/Subsection', 'Action Details', 'Target/Record', 'IP/Device', 'Outcome'].map((heading) => <th key={heading} className="px-2 py-2">{heading}</th>)}</tr></thead><tbody>{filteredRows.map((row) => <tr key={getRowId(row)} className="border-b border-white bg-[#f7f7f7] even:bg-[#fbfbfb]"><td className="px-2"><input type="checkbox" checked={selectedRows.includes(getRowId(row))} onChange={() => toggleRow(row)} aria-label={`Select ${row.action}`} /></td><td className="px-2 py-2">{row.date}<br />{row.time}</td><td className="px-2">{row.user}</td><td className="px-2">{row.role}</td><td className="px-2">{row.event}</td><td className="px-2">{row.section}</td><td className="px-2">{row.action}</td><td className="px-2">{row.target}</td><td className="px-2">{row.ip}<br />{row.device}</td><td className={`px-2 font-semibold ${row.outcome === 'Failed' ? 'text-[#d65b4a]' : row.outcome === 'Warning' ? 'text-[#c88a19]' : 'text-[#4f8c62]'}`}>{row.outcome}</td></tr>)}</tbody></table></div>
      <div className="flex items-center justify-between border-b border-[#eee] py-3 text-[10px]"><span>Showing {filteredRows.length ? 1 : 0}-{filteredRows.length} of {filteredRows.length} results</span><span>Previous &nbsp; 1 &nbsp; Next</span></div>
      {selectedLog !== null && filteredRows.find((row) => getRowId(row) === selectedLog) && <section className="mt-4 border border-[#d8d8d8] bg-white"><div className="flex items-center justify-between border-b border-[#ddd] bg-[#f5f5f5] px-3 py-2 text-[11px] font-semibold text-[#444]"><span>Log Details</span><span>Severity level: INFORMATION &nbsp;&nbsp; Session outcome: {filteredRows.find((row) => getRowId(row) === selectedLog).outcome.toUpperCase()}</span></div><div className="grid gap-2 p-3 text-[10px] sm:grid-cols-3"><p><b>Event ID:</b> EVT-2025-05-15-000245</p><p><b>Session ID:</b> SES-8f4a3c7d2b7e9145</p><p><b>Performed by:</b> {filteredRows.find((row) => getRowId(row) === selectedLog).user}</p><p><b>Event:</b> {filteredRows.find((row) => getRowId(row) === selectedLog).event}</p><p><b>Action:</b> {filteredRows.find((row) => getRowId(row) === selectedLog).action}</p><p><b>Affected record:</b> {filteredRows.find((row) => getRowId(row) === selectedLog).target}</p></div></section>}
    </div>
  )
}

export default AuditLog
