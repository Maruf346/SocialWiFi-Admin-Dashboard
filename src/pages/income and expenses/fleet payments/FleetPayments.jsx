import { useMemo, useState } from 'react'

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const fleetPlansByDate = {
  '2026-08-29': [
    'Daseke Inc.',
    'Landstar System',
    'PS Logistics',
    'Anderson Trucking Service',
    'Bennett Motor Express',
    'Cal South Trucking',
  ],
  '2026-08-15': [
    'Bluebird Logistics',
    'Summit Transport',
    'Atlas Freight Group',
    'PrimeRoute Logistics',
    'Northline Haulage',
    'Harbor Fleet Group',
  ],
  '2026-08-01': [
    'Crestline Transport',
    'Wildwood Express',
    'MetroLine Fleet',
    'Highway One Logistics',
    'Coastal Haul',
    'Riverstone Freight',
  ],
  '2026-09-12': [
    'Redwood Transit',
    'Horizon Freight Co.',
    'Sunset Logistics',
    'Lakeshore Haul',
    'Metro Cargo',
    'Velvet Freight',
  ],
}

const fleetPlansByMonth = {
  '2026-08': [
    'Daseke Inc.',
    'Landstar System',
    'PS Logistics',
    'Anderson Trucking Service',
    'Bennett Motor Express',
    'Cal South Trucking',
    'Bluebird Logistics',
    'Summit Transport',
  ],
  '2026-09': [
    'Redwood Transit',
    'Horizon Freight Co.',
    'Sunset Logistics',
    'Lakeshore Haul',
    'Metro Cargo',
    'Velvet Freight',
    'Northline Haulage',
    'Harbor Fleet Group',
  ],
  '2026-10': [
    'Apex Fleet Group',
    'Silverline Transport',
    'Miller Logistics',
    'Continental Freight',
    'Westbridge Haul',
    'Fastline Cargo',
    'Pinecrest Trucking',
    'White Oak Logistics',
  ],
  '2027-01': [
    'NextWave Logistics',
    'Crossroad Freight',
    'Stonebridge Haul',
    'MidTown Transport',
    'Delta Cargo Co.',
    'Raven Fleet Group',
    'Blue Ridge Trucking',
    'Cedar Lane Freight',
  ],
}

const fleetPlansByYear = {
  2026: [
    'Daseke Inc.',
    'Landstar System',
    'PS Logistics',
    'Anderson Trucking Service',
    'Bennett Motor Express',
    'Cal South Trucking',
    'Bluebird Logistics',
    'Summit Transport',
    'Redwood Transit',
    'Horizon Freight Co.',
    'Sunset Logistics',
    'Lakeshore Haul',
  ],
  2027: [
    'NextWave Logistics',
    'Crossroad Freight',
    'Stonebridge Haul',
    'MidTown Transport',
    'Delta Cargo Co.',
    'Raven Fleet Group',
    'Blue Ridge Trucking',
    'Cedar Lane Freight',
    'Apex Fleet Group',
    'Silverline Transport',
  ],
}

const monthlyFleetIncome = {
  '2026-07': 17733,
  '2026-08': 21450,
  '2026-09': 19820,
  '2026-10': 19040,
  '2026-11': 22110,
  '2026-12': 24520,
  '2027-01': 17880,
  '2027-02': 18340,
}

const buildCalendarDays = (monthDate) => {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
  const lastDay = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
  const cells = []

  for (let index = 0; index < firstDay.getDay(); index += 1) {
    cells.push(null)
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    cells.push(day)
  }

  while (cells.length % 7 !== 0) {
    cells.push(null)
  }

  return cells
}

const formatCurrency = (value) => `$${value.toLocaleString()}`

const formatDisplayDate = (date) =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(date)

const formatDisplayDateWithYear = (date) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)

const getMonthIncome = (year, monthIndex) => {
  const key = `${year}-${String(monthIndex + 1).padStart(2, '0')}`
  return monthlyFleetIncome[key] ?? 0
}

const getYearIncome = (year) => {
  return Object.entries(monthlyFleetIncome).reduce((total, [key, value]) => {
    const [entryYear] = key.split('-').map(Number)
    return entryYear === year ? total + value : total
  }, 0)
}

const FleetPayments = () => {
  const today = new Date()
  const [selectedDate, setSelectedDate] = useState(today)
  const [visibleMonth, setVisibleMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [calendarMode, setCalendarMode] = useState('day')

  const calendarDays = useMemo(
    () => buildCalendarDays(visibleMonth),
    [visibleMonth],
  )

  const dateKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
  const monthKey = `${visibleMonth.getFullYear()}-${String(visibleMonth.getMonth() + 1).padStart(2, '0')}`
  const monthSelected = calendarMode === 'month'
  const yearSelected = calendarMode === 'year'

  const selectedValue = yearSelected
    ? getYearIncome(visibleMonth.getFullYear())
    : monthSelected
      ? getMonthIncome(visibleMonth.getFullYear(), visibleMonth.getMonth())
      : monthlyFleetIncome[`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`] ?? 0

  const activeFleetPlans = yearSelected
    ? fleetPlansByYear[visibleMonth.getFullYear()] ?? fleetPlansByMonth[monthKey] ?? []
    : monthSelected
      ? fleetPlansByMonth[monthKey] ?? fleetPlansByDate[dateKey] ?? []
      : fleetPlansByDate[dateKey] ?? fleetPlansByMonth[monthKey] ?? []

  const monthLabel = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(visibleMonth)

  const handlePrevMonth = () => {
    setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))
  }

  const handleYearChange = (direction) => {
    const nextYear = visibleMonth.getFullYear() + direction
    setVisibleMonth(new Date(nextYear, visibleMonth.getMonth(), 1))
  }

  const handleMonthSelect = (monthIndex) => {
    setVisibleMonth(new Date(visibleMonth.getFullYear(), monthIndex, 1))
    setCalendarMode('month')
  }

  const handleYearSelect = (year) => {
    setVisibleMonth(new Date(year, visibleMonth.getMonth(), 1))
    setCalendarMode('year')
  }

  const isSelectedDay = (day) => {
    if (!day) return false
    return (
      selectedDate.getFullYear() === visibleMonth.getFullYear() &&
      selectedDate.getMonth() === visibleMonth.getMonth() &&
      selectedDate.getDate() === day
    )
  }

  const periodLabel = yearSelected
    ? `${visibleMonth.getFullYear()}`
    : monthSelected
      ? `${new Intl.DateTimeFormat('en-US', { month: 'long' }).format(visibleMonth)} ${visibleMonth.getFullYear()}`
      : formatDisplayDateWithYear(selectedDate)

  const yearOptions = Array.from({ length: 12 }, (_, index) => visibleMonth.getFullYear() - 5 + index)

  return (
    <div className="min-h-full px-2 py-2 text-[#666] md:px-4 md:py-3">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-[24px] font-normal text-[#2d2d2d]">Fleet payments</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-[440px_minmax(0,1fr)]">
        <div className="w-full max-w-[440px] rounded-[10px] border border-[#d9d9d9] bg-[#f3f3f3] p-0 shadow-sm">
          <div className="mb-1 flex items-center justify-between bg-[#ececec] px-4 py-3 text-[#4a4a4a]">
            <span className="text-[18px] font-medium leading-none">{formatDisplayDate(selectedDate)}</span>
          </div>

          {calendarMode === 'day' ? (
            <>
              <div className="mb-3 flex items-center justify-between px-4 pt-2 pb-1">
                <button
                  type="button"
                  onClick={() => setCalendarMode('month')}
                  className="text-left text-[20px] font-medium text-[#333]"
                >
                  {monthLabel}
                </button>
                <div className="flex items-center gap-2 text-[#666]">
                  <button type="button" onClick={handlePrevMonth} aria-label="Previous month" className="text-[16px] leading-none">▲</button>
                  <button type="button" onClick={handleNextMonth} aria-label="Next month" className="text-[16px] leading-none">▼</button>
                </div>
              </div>

              <div className="px-4 pb-4">
                <div className="grid grid-cols-7 gap-1 text-center text-[13px] text-[#666]">
                  {WEEKDAYS.map((day) => (
                    <div key={day} className="pb-2 font-medium">{day}</div>
                  ))}

                  {calendarDays.map((day, index) => (
                    <button
                      key={`${day ?? 'empty'}-${index}`}
                      type="button"
                      onClick={() => day && setSelectedDate(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day))}
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-[14px] transition ${
                        !day ? 'invisible' : 'text-[#555] hover:bg-[#e0e0e0]'
                      } ${isSelectedDay(day) ? 'bg-[#f28d4d] text-white shadow-sm' : ''}`}
                    >
                      {day ?? ''}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : calendarMode === 'month' ? (
            <div className="px-4 py-3">
              <div className="mb-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCalendarMode('year')}
                  className="text-[18px] font-medium text-[#333]"
                >
                  {visibleMonth.getFullYear()}
                </button>
                <div className="flex items-center gap-2 text-[#666]">
                  <button type="button" onClick={() => handleYearChange(-1)} aria-label="Previous year" className="text-[16px] leading-none">▲</button>
                  <button type="button" onClick={() => handleYearChange(1)} aria-label="Next year" className="text-[16px] leading-none">▼</button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 text-center">
                {MONTHS.map((month, index) => {
                  const isSelected = visibleMonth.getMonth() === index

                  return (
                    <button
                      key={month}
                      type="button"
                      onClick={() => handleMonthSelect(index)}
                      className={`flex h-12 w-12 items-center justify-center rounded-full text-[16px] transition ${
                        isSelected ? 'bg-[#f28d4d] text-white' : 'text-[#444] hover:bg-[#e8e8e8]'
                      }`}
                    >
                      {month}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="px-4 py-3">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[18px] font-medium text-[#333]">{visibleMonth.getFullYear()}</span>
                <div className="flex items-center gap-2 text-[#666]">
                  <button type="button" onClick={() => handleYearChange(-1)} aria-label="Previous year" className="text-[16px] leading-none">▲</button>
                  <button type="button" onClick={() => handleYearChange(1)} aria-label="Next year" className="text-[16px] leading-none">▼</button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 text-center">
                {yearOptions.map((year) => {
                  const isSelected = year === visibleMonth.getFullYear()

                  return (
                    <button
                      key={year}
                      type="button"
                      onClick={() => handleYearSelect(year)}
                      className={`flex h-12 w-12 items-center justify-center rounded-full text-[16px] transition ${
                        isSelected ? 'bg-[#f28d4d] text-white' : 'text-[#444] hover:bg-[#e8e8e8]'
                      }`}
                    >
                      {year}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex w-full flex-col gap-4 pt-1">
          <div className="w-full rounded-[8px] bg-[#f39f5f] px-4 py-3 text-[14px] font-medium text-white shadow-sm">
            {periodLabel}: {formatCurrency(selectedValue)}
          </div>

          <div className="overflow-hidden rounded-[8px] border border-[#d9d9d9] bg-[#f1f1f1] shadow-sm">
            <div className="border-b border-[#d9d9d9] bg-[#f3f3f3] px-4 py-3 text-[16px] font-semibold uppercase tracking-wide text-[#333]">
              Fleet plans
            </div>

            <div className="max-h-[420px] overflow-y-auto">
              {activeFleetPlans.map((plan, index) => (
                <button
                  key={`${plan}-${index}`}
                  type="button"
                  className={`flex w-full items-center justify-between border-b border-[#d9d9d9] px-4 py-3 text-left text-[14px] text-[#333] underline decoration-1 underline-offset-2 transition hover:text-[#1b1b1b] last:border-b-0 ${
                    index % 2 === 0 ? 'bg-[#f8f8f8]' : 'bg-[#f3f3f3]'
                  }`}
                >
                  <span className="cursor-pointer">{plan}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-[#d9d9d9] bg-[#f3f3f3] px-4 py-3 text-[12px] text-[#666]">
              <span>{`1–${activeFleetPlans.length} of ${activeFleetPlans.length} fleet plans`}</span>
              <div className="flex items-center gap-2">
                <button type="button" className="text-[#555]">Previous</button>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-[#333]">1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>Next</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FleetPayments
