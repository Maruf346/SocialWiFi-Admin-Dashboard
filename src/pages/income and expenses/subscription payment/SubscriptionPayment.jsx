import { useEffect, useMemo, useState } from "react";
import { financeApi } from "../../../api/financeApi";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: amount >= 1000 ? 0 : 2,
  }).format(amount);
};

const toDateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const buildCalendarDays = (monthDate) => {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const lastDay = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  const cells = [];

  for (let index = 0; index < firstDay.getDay(); index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    cells.push(day);
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
};

const formatDisplayDate = (date) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);

const formatDisplayDateWithYear = (date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);

const getSummaryText = (summary, fallbackLabel) => {
  if (summary?.display_bar_text) return summary.display_bar_text;

  const amount = summary?.formatted_total || formatCurrency(summary?.total_amount);
  const label = summary?.formatted_label || fallbackLabel;
  return `${label}: ${amount}`;
};

const SubscriptionPayment = () => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [visibleMonth, setVisibleMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [calendarMode, setCalendarMode] = useState("day");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const calendarDays = useMemo(() => buildCalendarDays(visibleMonth), [visibleMonth]);

  const yearSelected = calendarMode === "year";
  const monthSelected = calendarMode === "month";

  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(visibleMonth);

  const query = useMemo(() => {
    if (yearSelected) {
      return {
        period: "year",
        year: visibleMonth.getFullYear(),
      };
    }

    if (monthSelected) {
      return {
        period: "month",
        year: visibleMonth.getFullYear(),
        month: visibleMonth.getMonth() + 1,
      };
    }

    return {
      period: "day",
      date: toDateKey(selectedDate),
      year: selectedDate.getFullYear(),
      month: selectedDate.getMonth() + 1,
      day: selectedDate.getDate(),
    };
  }, [monthSelected, selectedDate, visibleMonth, yearSelected]);

  const periodLabel = yearSelected
    ? `${visibleMonth.getFullYear()}`
    : monthSelected
      ? `${new Intl.DateTimeFormat("en-US", { month: "long" }).format(visibleMonth)} ${visibleMonth.getFullYear()}`
      : formatDisplayDateWithYear(selectedDate);

  useEffect(() => {
    let isMounted = true;

    const loadSummary = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await financeApi.getSubscriptionPaymentsSummary(query);
        if (!isMounted) return;
        setSummary(response);
      } catch (err) {
        if (!isMounted) return;
        setSummary(null);
        setError(err.message || "Failed to load subscription payment summary.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadSummary();

    return () => {
      isMounted = false;
    };
  }, [query]);

  const handlePrevMonth = () => {
    setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1));
  };

  const handleYearChange = (direction) => {
    const nextYear = visibleMonth.getFullYear() + direction;
    setVisibleMonth(new Date(nextYear, visibleMonth.getMonth(), 1));
  };

  const handleMonthSelect = (monthIndex) => {
    setVisibleMonth(new Date(visibleMonth.getFullYear(), monthIndex, 1));
    setCalendarMode("month");
  };

  const handleYearSelect = (year) => {
    setVisibleMonth(new Date(year, visibleMonth.getMonth(), 1));
    setCalendarMode("year");
  };

  const handleDaySelect = (day) => {
    if (!day) return;
    const nextDate = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
    setSelectedDate(nextDate);
    setCalendarMode("day");
  };

  const isSelectedDay = (day) => {
    if (!day) return false;
    return (
      selectedDate.getFullYear() === visibleMonth.getFullYear() &&
      selectedDate.getMonth() === visibleMonth.getMonth() &&
      selectedDate.getDate() === day
    );
  };

  const yearOptions = Array.from({ length: 12 }, (_, index) => visibleMonth.getFullYear() - 5 + index);
  const summaryText = loading ? "Loading subscription payment summary..." : getSummaryText(summary, periodLabel);

  return (
    <div className="min-h-full bg-white px-2 py-3 text-[#666] md:px-8 md:py-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-xl font-normal text-[#999] md:text-2xl">Subscription payments</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-[440px_minmax(0,1fr)]">
        <div className="w-full max-w-[440px] rounded-[10px] border border-[#d9d9d9] bg-[#f3f3f3] p-0 shadow-sm">
          <div className="mb-1 flex items-center justify-between bg-[#ececec] px-4 py-3 text-[#4a4a4a]">
            <span className="text-[18px] font-medium leading-none">{formatDisplayDate(selectedDate)}</span>
          </div>

          {calendarMode === "day" ? (
            <>
              <div className="mb-3 flex items-center justify-between px-4 pb-1 pt-2">
                <button
                  type="button"
                  onClick={() => setCalendarMode("month")}
                  className="text-left text-[20px] font-medium text-[#333]"
                >
                  {monthLabel}
                </button>
                <div className="flex items-center gap-2 text-[#666]">
                  <button type="button" onClick={handlePrevMonth} aria-label="Previous month" className="rounded px-2 py-1 text-[12px] hover:bg-[#e0e0e0]">
                    Prev
                  </button>
                  <button type="button" onClick={handleNextMonth} aria-label="Next month" className="rounded px-2 py-1 text-[12px] hover:bg-[#e0e0e0]">
                    Next
                  </button>
                </div>
              </div>

              <div className="px-4 pb-4">
                <div className="grid grid-cols-7 gap-1 text-center text-[13px] text-[#666]">
                  {WEEKDAYS.map((day) => (
                    <div key={day} className="pb-2 font-medium">
                      {day}
                    </div>
                  ))}

                  {calendarDays.map((day, index) => (
                    <button
                      key={`${day ?? "empty"}-${index}`}
                      type="button"
                      onClick={() => handleDaySelect(day)}
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-[14px] transition ${
                        !day ? "invisible" : "text-[#555] hover:bg-[#e0e0e0]"
                      } ${isSelectedDay(day) ? "bg-[#f28d4d] text-white shadow-sm" : ""}`}
                    >
                      {day ?? ""}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : calendarMode === "month" ? (
            <div className="px-4 py-3">
              <div className="mb-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCalendarMode("year")}
                  className="text-[18px] font-medium text-[#333]"
                >
                  {visibleMonth.getFullYear()}
                </button>
                <div className="flex items-center gap-2 text-[#666]">
                  <button type="button" onClick={() => handleYearChange(-1)} aria-label="Previous year" className="rounded px-2 py-1 text-[12px] hover:bg-[#e0e0e0]">
                    Prev
                  </button>
                  <button type="button" onClick={() => handleYearChange(1)} aria-label="Next year" className="rounded px-2 py-1 text-[12px] hover:bg-[#e0e0e0]">
                    Next
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 text-center">
                {MONTHS.map((month, index) => {
                  const isSelected = visibleMonth.getMonth() === index;

                  return (
                    <button
                      key={month}
                      type="button"
                      onClick={() => handleMonthSelect(index)}
                      className={`flex h-12 w-12 items-center justify-center rounded-full text-[16px] transition ${
                        isSelected ? "bg-[#f28d4d] text-white" : "text-[#444] hover:bg-[#e8e8e8]"
                      }`}
                    >
                      {month}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="px-4 py-3">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[18px] font-medium text-[#333]">{visibleMonth.getFullYear()}</span>
                <div className="flex items-center gap-2 text-[#666]">
                  <button type="button" onClick={() => handleYearChange(-1)} aria-label="Previous year" className="rounded px-2 py-1 text-[12px] hover:bg-[#e0e0e0]">
                    Prev
                  </button>
                  <button type="button" onClick={() => handleYearChange(1)} aria-label="Next year" className="rounded px-2 py-1 text-[12px] hover:bg-[#e0e0e0]">
                    Next
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 text-center">
                {yearOptions.map((year) => {
                  const isSelected = year === visibleMonth.getFullYear();

                  return (
                    <button
                      key={year}
                      type="button"
                      onClick={() => handleYearSelect(year)}
                      className={`flex h-12 w-12 items-center justify-center rounded-full text-[16px] transition ${
                        isSelected ? "bg-[#f28d4d] text-white" : "text-[#444] hover:bg-[#e8e8e8]"
                      }`}
                    >
                      {year}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col items-start gap-3 pt-1">
          <div className="w-full max-w-[460px] rounded-[8px] bg-[#f39f5f] px-4 py-3 text-[14px] font-medium text-white shadow-sm">
            {summaryText}
          </div>

          {error && (
            <div className="w-full max-w-[460px] rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {!error && summary?.start_date && summary?.end_date && (
            <div className="w-full max-w-[460px] rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
              API period: {summary.start_date} to {summary.end_date}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPayment;
