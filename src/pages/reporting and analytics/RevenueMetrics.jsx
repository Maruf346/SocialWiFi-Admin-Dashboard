import { useState } from 'react'

const periods = {
	'Last 30 Days': { suffix: 'since year start', arpa: '2,145', mrr: '$487,250', arr: '$5,846,300', arpaValue: '$227.05', newMrr: '$61,340', churned: '$18,260', total: '$503,210' },
	'Q3 2026 to Date': { suffix: 'since period start', arpa: '2,390', mrr: '$512,840', arr: '$6,154,080', arpaValue: '$229.15', newMrr: '$74,110', churned: '$20,420', total: '$531,770' },
	'2026 YTD': { suffix: 'since year start', arpa: '2,783', mrr: '$527,500', arr: '$6,330,000', arpaValue: '$227.05', newMrr: '$81,340', churned: '$21,260', total: '$583,210' },
}

const zeroMetrics = { suffix: 'for selected period', arpa: '0', mrr: '$0', arr: '$0', arpaValue: '$0.00', newMrr: '$0', churned: '$0', total: '$0' }

const getQuarter = (date) => Math.floor(date.getMonth() / 3) + 1
const getQuarterOptions = (date) => {
	const options = []
	let quarter = getQuarter(date)
	let year = date.getFullYear()
	for (let index = 0; index < 8; index += 1) {
		options.push(`${quarter === getQuarter(date) && year === date.getFullYear() ? `Q${quarter} ${year} to Date` : `Q${quarter} ${year}`}`)
		quarter -= 1
		if (quarter === 0) { quarter = 4; year -= 1 }
	}
	return options
}

const getYearOptions = (date) => Array.from({ length: 5 }, (_, index) => index === 0 ? `${date.getFullYear()} YTD` : String(date.getFullYear() - index))

const plans = [
	['Single Monthly', '1,128', '1,128', '102,400', '4.8%', '$1.20M'],
	['Single Yearly', '612', '612', '900,690', '1.3%', '$905K'],
	['Team 5', '348', '1,740', '64,200', '2.6%', '$640K'],
	['Team 10', '276', '2,760', '64,600', '2.2%', '$1.02M'],
	['Team 25', '192', '4,800', '103,200', '1.9%', '$1.06M'],
	['Team 50', '128', '6,400', '108,000', '1.6%', '$1.03M'],
	['Team 100', '62', '6,200', '73,500', '1.4%', '$750K'],
	['Fleet', '37', '5,820', '1,170,000', '1.1%', '$1.17M'],
]

const MetricCard = ({ label, value, change, note, negative = false }) => (
	<div className="rounded-lg border border-[#e2e2e2] bg-[#fafafa] px-3 py-3 shadow-sm">
		<p className="text-xs font-semibold text-[#666]">{label}</p>
		<strong className="mt-1 block text-lg leading-5 text-[#555]">{value}</strong>
		<span className={`text-[10px] font-semibold ${negative ? 'text-red-600' : 'text-green-600'}`}>↗ {change}% <span className="font-normal text-[#666]">{note}</span></span>
	</div>
)

const RevenueMetrics = () => {
	const today = new Date()
	const currentQuarter = `Q${getQuarter(today)} ${today.getFullYear()} to Date`
	const [period, setPeriod] = useState('2026 YTD')
	const [quarter, setQuarter] = useState(currentQuarter)
	const [year, setYear] = useState('2026 YTD')
	const [customRange, setCustomRange] = useState({ start: '', end: '' })
	const metrics = periods[period] || (period === '2026 YTD' ? periods['2026 YTD'] : zeroMetrics)
	const selectPeriod = (value, type) => {
		if (type === 'quarter') { setQuarter(value); setPeriod(value === currentQuarter ? 'Q3 2026 to Date' : value) }
		if (type === 'year') { setYear(value); setPeriod(value) }
	}
	const applyCustomRange = () => setPeriod(customRange.start && customRange.end ? 'Custom Range' : period)

	return (
		<div className="revenue-metrics-page min-h-full px-2 py-2 text-[#777] md:px-4 md:py-3">
			<h1 className="mb-4 text-2xl font-normal text-[#999]">Revenue metrics</h1>
			<div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
				<button type="button" onClick={() => setPeriod('Last 30 Days')} className={`rounded border px-2 py-1 ${period === 'Last 30 Days' ? 'border-[#ff823d] bg-[#ff823d] text-white' : 'border-[#ccc] bg-white text-[#666]'}`}>Last 30 Days</button>
				<select value={quarter} onChange={(event) => selectPeriod(event.target.value, 'quarter')} className="rounded border border-[#ccc] bg-white px-2 py-1 text-[#666]">{getQuarterOptions(today).map((item) => <option key={item}>{item}</option>)}</select>
				<select value={year} onChange={(event) => selectPeriod(event.target.value, 'year')} className={`rounded border px-2 py-1 ${year === '2026 YTD' ? 'border-[#ff823d] bg-[#ff823d] text-white' : 'border-[#ccc] bg-white text-[#666]'}`}>{getYearOptions(today).map((item) => <option key={item}>{item}</option>)}</select>
				<div className="flex items-center gap-1 rounded border border-[#ccc] bg-white px-2 py-1"><span className="text-[#666]">Custom Range:</span><input type="date" value={customRange.start} onChange={(event) => setCustomRange((current) => ({ ...current, start: event.target.value }))} aria-label="Custom range start date" /><span>-</span><input type="date" value={customRange.end} onChange={(event) => setCustomRange((current) => ({ ...current, end: event.target.value }))} aria-label="Custom range end date" /><button type="button" onClick={applyCustomRange} className="font-semibold text-[#666]">GO</button></div>
			</div>

			<div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
				<MetricCard label="ARPA" value={metrics.arpa} change="7.3" note={metrics.suffix} />
				<MetricCard label="MRR" value={metrics.mrr} change="11.2" note={metrics.suffix} />
				<MetricCard label="ARR" value={metrics.arr} change="13.4" note={metrics.suffix} />
				<MetricCard label="ARPA" value={metrics.arpaValue} change="3.7" note={metrics.suffix} />
				<MetricCard label="New MRR" value={metrics.newMrr} change="18.7" note="vs previous year" />
				<MetricCard label="Churned MRR" value={metrics.churned} change="6.1" note="vs previous year" negative />
				<MetricCard label="Total Revenue" value={metrics.total} change="9.6" note="vs previous period" />
			</div>

			<div className="mt-6 grid gap-6 lg:grid-cols-2">
				<section className="rounded-lg border border-[#e2e2e2] bg-[#fafafa] p-4"><h2 className="mb-4 text-sm font-semibold text-[#666]">Revenue Mix by Customer Type</h2><div className="flex items-center gap-6"><div className="flex h-40 w-40 shrink-0 items-center justify-center rounded-full" style={{ background: 'conic-gradient(#2867c7 0 36%, #ff5b00 36% 80%, #3f984c 80% 100%)' }}><div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-[#fafafa] text-center"><strong className="text-base text-[#555]">$5.85M</strong><span className="text-xs">ARR</span></div></div><div className="space-y-3 text-xs"><p><b className="text-[#2867c7]">■</b> Single<br /><strong>$2.11M (36%)</strong></p><p><b className="text-[#ff5b00]">■</b> Team<br /><strong>$2.58M (44%)</strong></p><p><b className="text-[#3f984c]">■</b> Fleet<br /><strong>$1.17M (20%)</strong></p></div></div></section>
				<section className="rounded-lg border border-[#e2e2e2] bg-[#fafafa] p-4"><h2 className="mb-4 text-sm font-semibold text-[#666]">Revenue by Plan</h2><div className="space-y-2 text-xs">{plans.map(([name, , , , , amount], index) => <div className="flex items-center gap-2" key={name}><span className="w-24 truncate">{name}</span><div className="h-2 flex-1 bg-[#eee]"><div className="h-full bg-[#ff5b00]" style={{ width: `${45 + (index % 4) * 12}%` }} /></div><b className="w-12 text-right">{amount}</b></div>)}</div></section>
			</div>

			<section className="mt-6 max-w-[650px] rounded-lg border border-[#e2e2e2] bg-[#fafafa] p-3"><h2 className="mb-3 text-sm font-semibold text-[#666]">Plan Performance</h2><div className="overflow-x-auto"><table className="w-full min-w-[580px] border-collapse text-xs"><thead><tr className="border-b border-[#ddd] text-left text-[10px] text-[#777]"><th className="px-2 py-2">Plan</th><th className="px-2">Active Accounts</th><th className="px-2">Drivers / Seats</th><th className="px-2">MRR</th><th className="px-2">Churn Rate</th></tr></thead><tbody>{plans.map(([name, accounts, drivers, mrr, churn]) => <tr key={name} className="border-b border-[#e6e6e6]"><td className="px-2 py-2">{name}</td><td className="px-2">{accounts}</td><td className="px-2">{drivers}</td><td className="px-2">{mrr}</td><td className="px-2">{churn}</td></tr>)}<tr className="font-semibold"><td className="px-2 py-2">Total</td><td className="px-2">2,783</td><td className="px-2">29,460</td><td className="px-2">2,608,300</td><td className="px-2">2.0%</td></tr></tbody></table></div></section>
		</div>
	)
}

export default RevenueMetrics
