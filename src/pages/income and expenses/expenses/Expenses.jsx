import { useEffect, useMemo, useState } from "react";
import { financeApi } from "../../../api/financeApi";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const PAYMENT_METHODS = ["MC Card", "Visa", "Cash", "Wire", "Bank Transfer", "Other"];
const RECURRING_OPTIONS = ["No", "Monthly", "Yearly"];
const PAGE_SIZE = 10;

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const toDateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const toDisplayDate = (value) => {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}/${date.getFullYear()}`;
};

const fromDisplayDate = (value) => {
  if (!value) return "";
  if (value.includes("-")) return value;
  const [month, day, year] = value.split("/").map(Number);
  if (!month || !day || !year) return "";
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

const parseDate = (value) => {
  if (!value) return new Date();
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

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

const normalizeExpense = (expense) => ({
  id: expense.id,
  vendor: expense.vendor_company || "",
  date: expense.date_paid || "",
  amount: expense.amount || "0",
  amountDisplay: expense.amount_display || formatCurrency(expense.amount),
  paidBy: expense.who_paid || "",
  paymentMethod: expense.payment_method || "MC Card",
  recurring: expense.recurring || "No",
  description: expense.description || "",
  createdByEmail: expense.created_by_email || "",
});

const emptyForm = (date) => ({
  vendor: "",
  date: toDisplayDate(toDateKey(date)),
  amount: "",
  paidBy: "",
  paymentMethod: "MC Card",
  recurring: "No",
  description: "",
});

const formFromExpense = (expense) => ({
  vendor: expense?.vendor || "",
  date: toDisplayDate(expense?.date) || "",
  amount: expense?.amount ? String(expense.amount) : "",
  paidBy: expense?.paidBy || "",
  paymentMethod: expense?.paymentMethod || "MC Card",
  recurring: expense?.recurring || "No",
  description: expense?.description || "",
});

const buildExpensePayload = (form) => ({
  vendor_company: form.vendor.trim(),
  date_paid: fromDisplayDate(form.date),
  amount: String(form.amount).trim(),
  who_paid: form.paidBy.trim(),
  payment_method: form.paymentMethod,
  recurring: form.recurring,
  description: form.description.trim(),
});

const getPeriodRange = (mode, selectedDate, visibleMonth) => {
  if (mode === "year") {
    return {
      start_date: `${visibleMonth.getFullYear()}-01-01`,
      end_date: `${visibleMonth.getFullYear()}-12-31`,
    };
  }

  if (mode === "month") {
    const start = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const end = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0);
    return {
      start_date: toDateKey(start),
      end_date: toDateKey(end),
    };
  }

  return { date: toDateKey(selectedDate) };
};

const getSummaryText = (summary, fallbackLabel) => {
  if (summary?.display_bar_text) return summary.display_bar_text;
  const amount = summary?.formatted_total || formatCurrency(summary?.total_amount);
  const label = summary?.formatted_label || fallbackLabel;
  return `${label}: ${amount}`;
};

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const Expenses = () => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [visibleMonth, setVisibleMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [calendarMode, setCalendarMode] = useState("day");
  const [expenses, setExpenses] = useState([]);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);
  const [expenseForm, setExpenseForm] = useState(emptyForm(today));
  const [summary, setSummary] = useState(null);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const calendarDays = useMemo(() => buildCalendarDays(visibleMonth), [visibleMonth]);
  const yearSelected = calendarMode === "year";
  const monthSelected = calendarMode === "month";
  const selectedExpense = expenses.find((entry) => entry.id === selectedExpenseId) || null;

  const periodLabel = yearSelected
    ? `${visibleMonth.getFullYear()}`
    : monthSelected
      ? `${new Intl.DateTimeFormat("en-US", { month: "long" }).format(visibleMonth)} ${visibleMonth.getFullYear()}`
      : formatDisplayDateWithYear(selectedDate);

  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(visibleMonth);

  const periodQuery = useMemo(() => {
    const period = yearSelected ? "year" : monthSelected ? "month" : "day";
    return {
      period,
      ...getPeriodRange(period, selectedDate, visibleMonth),
    };
  }, [monthSelected, selectedDate, visibleMonth, yearSelected]);

  const listQuery = useMemo(
    () => ({
      ...periodQuery,
      search,
      page,
      page_size: PAGE_SIZE,
    }),
    [page, periodQuery, search],
  );

  useEffect(() => {
    let isMounted = true;

    const loadExpenses = async () => {
      try {
        setLoading(true);
        setError("");
        const [listResponse, summaryResponse] = await Promise.all([
          financeApi.listExpenses(listQuery),
          financeApi.getExpensesSummary(periodQuery),
        ]);

        if (!isMounted) return;

        const results = Array.isArray(listResponse?.results) ? listResponse.results : [];
        const normalized = results.map(normalizeExpense);
        setExpenses(normalized);
        setCount(Number(listResponse?.count || normalized.length));
        setSummary(summaryResponse);
        setSelectedExpenseId((current) => {
          if (current && normalized.some((entry) => entry.id === current)) return current;
          return normalized[0]?.id || null;
        });
      } catch (err) {
        if (!isMounted) return;
        setExpenses([]);
        setCount(0);
        setSummary(null);
        setError(err.message || "Failed to load expenses.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadExpenses();

    return () => {
      isMounted = false;
    };
  }, [listQuery, periodQuery]);

  useEffect(() => {
    if (selectedExpense) {
      setExpenseForm(formFromExpense(selectedExpense));
    } else {
      setExpenseForm(emptyForm(selectedDate));
    }
  }, [selectedDate, selectedExpense]);

  const refreshCurrentPage = async () => {
    const [listResponse, summaryResponse] = await Promise.all([
      financeApi.listExpenses(listQuery),
      financeApi.getExpensesSummary(periodQuery),
    ]);
    const normalized = (Array.isArray(listResponse?.results) ? listResponse.results : []).map(normalizeExpense);
    setExpenses(normalized);
    setCount(Number(listResponse?.count || normalized.length));
    setSummary(summaryResponse);
    setSelectedExpenseId((current) => {
      if (current && normalized.some((entry) => entry.id === current)) return current;
      return normalized[0]?.id || null;
    });
  };

  const handlePrevMonth = () => {
    setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1));
    setPage(1);
  };

  const handleNextMonth = () => {
    setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1));
    setPage(1);
  };

  const handleYearChange = (direction) => {
    const nextYear = visibleMonth.getFullYear() + direction;
    setVisibleMonth(new Date(nextYear, visibleMonth.getMonth(), 1));
    setPage(1);
  };

  const handleMonthSelect = (monthIndex) => {
    setVisibleMonth(new Date(visibleMonth.getFullYear(), monthIndex, 1));
    setCalendarMode("month");
    setPage(1);
  };

  const handleYearSelect = (year) => {
    setVisibleMonth(new Date(year, visibleMonth.getMonth(), 1));
    setCalendarMode("year");
    setPage(1);
  };

  const handleDaySelect = (day) => {
    if (!day) return;
    const nextDate = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
    setSelectedDate(nextDate);
    setCalendarMode("day");
    setPage(1);
  };

  const isSelectedDay = (day) => {
    if (!day) return false;
    return (
      selectedDate.getFullYear() === visibleMonth.getFullYear() &&
      selectedDate.getMonth() === visibleMonth.getMonth() &&
      selectedDate.getDate() === day
    );
  };

  const handleChange = (field, value) => {
    setExpenseForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleSaveExpense = async () => {
    const payload = buildExpensePayload(expenseForm);
    if (!payload.vendor_company || !payload.date_paid || !payload.amount || !payload.who_paid) {
      setError("Vendor, date, amount, and payer are required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");
      const saved = selectedExpenseId
        ? await financeApi.updateExpense(selectedExpenseId, payload)
        : await financeApi.createExpense(payload);
      const savedExpense = normalizeExpense(saved);
      const savedDate = parseDate(savedExpense.date);
      setSelectedDate(savedDate);
      setVisibleMonth(new Date(savedDate.getFullYear(), savedDate.getMonth(), 1));
      setCalendarMode("day");
      setSelectedExpenseId(savedExpense.id);
      setMessage(selectedExpenseId ? "Expense updated." : "Expense created.");
      await refreshCurrentPage();
    } catch (err) {
      setError(err.message || "Failed to save expense.");
    } finally {
      setSaving(false);
    }
  };

  const handleClearExpense = () => {
    setSelectedExpenseId(null);
    setExpenseForm(emptyForm(selectedDate));
    setMessage("");
    setError("");
  };

  const handleDeleteExpense = async () => {
    if (!selectedExpenseId) return;
    try {
      setSaving(true);
      setError("");
      setMessage("");
      await financeApi.deleteExpense(selectedExpenseId);
      setSelectedExpenseId(null);
      setMessage("Expense deleted.");
      await refreshCurrentPage();
    } catch (err) {
      setError(err.message || "Failed to delete expense.");
    } finally {
      setSaving(false);
    }
  };

  const handleSelectExpense = async (entry) => {
    setSelectedExpenseId(entry.id);
    const entryDate = parseDate(entry.date);
    setSelectedDate(entryDate);
    setVisibleMonth(new Date(entryDate.getFullYear(), entryDate.getMonth(), 1));
    try {
      const detail = await financeApi.getExpense(entry.id);
      const normalized = normalizeExpense(detail);
      setExpenseForm(formFromExpense(normalized));
    } catch (err) {
      setError(err.message || "Failed to load expense details.");
    }
  };

  const handleDownloadExpenses = async () => {
    try {
      setError("");
      const response = await financeApi.downloadExpenses({ ...periodQuery, search });
      const blob = response instanceof Blob ? response : new Blob([response], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      downloadBlob(blob, `expenses-${periodQuery.period}-${Date.now()}.xlsx`);
    } catch (err) {
      setError(err.message || "Failed to download expenses.");
    }
  };

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const startIndex = count === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(page * PAGE_SIZE, count);
  const yearOptions = Array.from({ length: 12 }, (_, index) => visibleMonth.getFullYear() - 5 + index);
  const summaryText = loading ? "Loading expenses summary..." : getSummaryText(summary, periodLabel);

  return (
    <div className="min-h-full bg-white px-2 py-3 text-[#666] md:px-8 md:py-6">
      <div className="mb-8">
        <h1 className="text-xl font-normal text-[#999] md:text-2xl">Expenses</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[440px_minmax(0,1fr)]">
        <div className="w-full max-w-[440px] rounded-[10px] border border-[#d9d9d9] bg-[#f3f3f3] p-0 shadow-sm">
          <div className="mb-1 flex items-center justify-between bg-[#ececec] px-4 py-3 text-[#4a4a4a]">
            <span className="text-[18px] font-medium leading-none">{formatDisplayDate(selectedDate)}</span>
          </div>

          {calendarMode === "day" ? (
            <>
              <div className="mb-3 flex items-center justify-between px-4 pb-1 pt-2">
                <button type="button" onClick={() => setCalendarMode("month")} className="text-left text-[20px] font-medium text-[#333]">
                  {monthLabel}
                </button>
                <div className="flex items-center gap-2 text-[#666]">
                  <button type="button" onClick={handlePrevMonth} className="rounded px-2 py-1 text-[12px] hover:bg-[#e0e0e0]">Prev</button>
                  <button type="button" onClick={handleNextMonth} className="rounded px-2 py-1 text-[12px] hover:bg-[#e0e0e0]">Next</button>
                </div>
              </div>

              <div className="px-4 pb-4">
                <div className="grid grid-cols-7 gap-1 text-center text-[13px] text-[#666]">
                  {WEEKDAYS.map((day) => (
                    <div key={day} className="pb-2 font-medium">{day}</div>
                  ))}

                  {calendarDays.map((day, index) => (
                    <button
                      key={`${day ?? "empty"}-${index}`}
                      type="button"
                      onClick={() => handleDaySelect(day)}
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-[14px] transition ${!day ? "invisible" : "text-[#555] hover:bg-[#e0e0e0]"} ${isSelectedDay(day) ? "bg-[#f28d4d] text-white shadow-sm" : ""}`}
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
                <button type="button" onClick={() => setCalendarMode("year")} className="text-[18px] font-medium text-[#333]">
                  {visibleMonth.getFullYear()}
                </button>
                <div className="flex items-center gap-2 text-[#666]">
                  <button type="button" onClick={() => handleYearChange(-1)} className="rounded px-2 py-1 text-[12px] hover:bg-[#e0e0e0]">Prev</button>
                  <button type="button" onClick={() => handleYearChange(1)} className="rounded px-2 py-1 text-[12px] hover:bg-[#e0e0e0]">Next</button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 text-center">
                {MONTHS.map((month, index) => (
                  <button
                    key={month}
                    type="button"
                    onClick={() => handleMonthSelect(index)}
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-[16px] transition ${visibleMonth.getMonth() === index ? "bg-[#f28d4d] text-white" : "text-[#444] hover:bg-[#e8e8e8]"}`}
                  >
                    {month}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="px-4 py-3">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[18px] font-medium text-[#333]">{visibleMonth.getFullYear()}</span>
                <div className="flex items-center gap-2 text-[#666]">
                  <button type="button" onClick={() => handleYearChange(-1)} className="rounded px-2 py-1 text-[12px] hover:bg-[#e0e0e0]">Prev</button>
                  <button type="button" onClick={() => handleYearChange(1)} className="rounded px-2 py-1 text-[12px] hover:bg-[#e0e0e0]">Next</button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 text-center">
                {yearOptions.map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => handleYearSelect(year)}
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-[16px] transition ${year === visibleMonth.getFullYear() ? "bg-[#f28d4d] text-white" : "text-[#444] hover:bg-[#e8e8e8]"}`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex w-full flex-col gap-5 pt-1">
          <div className="w-full rounded-[8px] bg-[#f39f5f] px-4 py-3 text-[14px] font-medium text-white shadow-sm">{summaryText}</div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search vendor, payer, or description"
              className="h-10 w-full rounded-md border border-[#d9d9d9] px-3 text-sm outline-none focus:border-[#f08a45]"
            />
            <button type="button" onClick={handleDownloadExpenses} className="h-10 rounded-md bg-[#1f2d5b] px-4 text-sm font-semibold text-white">
              Download
            </button>
          </div>

          {error && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          {message && <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>}

          <div className="overflow-hidden rounded-[8px] border border-[#d9d9d9] bg-[#f1f1f1] shadow-sm">
            <div className="border-b border-[#d9d9d9] bg-[#f3f3f3] px-4 py-3 text-[16px] font-semibold uppercase tracking-[0.06em] text-[#333]">Expenses</div>

            <div className="max-h-[320px] overflow-y-auto">
              {loading ? (
                <div className="border-b border-[#d9d9d9] bg-[#f8f8f8] px-4 py-3 text-[14px] text-[#888]">Loading expenses...</div>
              ) : expenses.length > 0 ? (
                expenses.map((entry, index) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => handleSelectExpense(entry)}
                    className={`flex w-full items-center justify-between border-b border-[#d9d9d9] px-4 py-3 text-left text-[14px] text-[#333] transition hover:text-[#1b1b1b] last:border-b-0 ${index % 2 === 0 ? "bg-[#f8f8f8]" : "bg-[#f3f3f3]"} ${selectedExpenseId === entry.id ? "bg-[#f7ded0]" : ""}`}
                  >
                    <span>{entry.vendor}</span>
                    <span className="text-xs text-[#777]">{entry.amountDisplay}</span>
                  </button>
                ))
              ) : (
                <div className="border-b border-[#d9d9d9] bg-[#f8f8f8] px-4 py-3 text-[14px] text-[#888]">No expenses found</div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-[#d9d9d9] bg-[#f3f3f3] px-4 py-3 text-[12px] text-[#666]">
              <span>{`${startIndex}-${endIndex} of ${count} entries`}</span>
              <div className="flex items-center gap-2">
                <button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="disabled:text-[#aaa]">Previous</button>
                <span className="font-semibold text-[#333]">{page}</span>
                <span>of {totalPages}</span>
                <button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="disabled:text-[#aaa]">Next</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded-[10px] border border-[#d9d9d9] bg-[#f5f5f5] p-4 shadow-sm">
          <div className="mb-4 text-[18px] font-medium text-[#2d2d2d]">Add New Expense / Edit Expense</div>

          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-[12px] text-[#555]">
                <span>Vendor/Company:</span>
                <input value={expenseForm.vendor} onChange={(event) => handleChange("vendor", event.target.value)} className="h-[38px] rounded-[4px] border border-[#d3d3d3] bg-white px-3 text-[14px] text-[#333] outline-none focus:border-[#f08a45]" />
              </label>

              <label className="flex flex-col gap-1 text-[12px] text-[#555]">
                <span>Date paid:</span>
                <input type="date" value={fromDisplayDate(expenseForm.date)} onChange={(event) => handleChange("date", toDisplayDate(event.target.value))} className="h-[38px] rounded-[4px] border border-[#d3d3d3] bg-white px-3 text-[14px] text-[#333] outline-none focus:border-[#f08a45]" />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-[12px] text-[#555]">
                <span>Amount:</span>
                <input value={expenseForm.amount} onChange={(event) => handleChange("amount", event.target.value)} className="h-[38px] rounded-[4px] border border-[#d3d3d3] bg-white px-3 text-[14px] text-[#333] outline-none focus:border-[#f08a45]" />
              </label>

              <label className="flex flex-col gap-1 text-[12px] text-[#555]">
                <span>Who paid?</span>
                <input value={expenseForm.paidBy} onChange={(event) => handleChange("paidBy", event.target.value)} className="h-[38px] rounded-[4px] border border-[#d3d3d3] bg-white px-3 text-[14px] text-[#333] outline-none focus:border-[#f08a45]" />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-[12px] text-[#555]">
                <span>Payment method:</span>
                <select value={expenseForm.paymentMethod} onChange={(event) => handleChange("paymentMethod", event.target.value)} className="h-[38px] rounded-[4px] border border-[#d3d3d3] bg-white px-3 text-[14px] text-[#333] outline-none focus:border-[#f08a45]">
                  {PAYMENT_METHODS.map((method) => <option key={method}>{method}</option>)}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-[12px] text-[#555]">
                <span>Recurring?</span>
                <select value={expenseForm.recurring} onChange={(event) => handleChange("recurring", event.target.value)} className="h-[38px] rounded-[4px] border border-[#d3d3d3] bg-white px-3 text-[14px] text-[#333] outline-none focus:border-[#f08a45]">
                  {RECURRING_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
            </div>

            <label className="flex flex-col gap-1 text-[12px] text-[#555]">
              <span>Description:</span>
              <textarea value={expenseForm.description} onChange={(event) => handleChange("description", event.target.value)} rows={4} className="resize-none rounded-[4px] border border-[#d3d3d3] bg-white px-3 py-2 text-[14px] text-[#333] outline-none focus:border-[#f08a45]" />
            </label>

            <div className="flex flex-wrap gap-3 pt-2">
              <button type="button" onClick={handleSaveExpense} disabled={saving} className="rounded-[4px] bg-[#1f2d5b] px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-white disabled:opacity-60">{saving ? "Saving" : "Save"}</button>
              <button type="button" onClick={handleClearExpense} className="rounded-[4px] bg-[#1f2d5b] px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-white">Clear</button>
              {selectedExpenseId && <button type="button" onClick={handleDeleteExpense} disabled={saving} className="rounded-[4px] bg-red-700 px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-white disabled:opacity-60">Delete</button>}
            </div>
          </div>
        </div>

        <div className="rounded-[10px] border border-[#d9d9d9] bg-[#f5f5f5] p-4 shadow-sm">
          <div className="mb-4 text-[18px] font-medium text-[#2d2d2d]">Expense log</div>

          <div className="space-y-3 text-[13px] text-[#555]">
            {[
              ["Vendor/Company:", selectedExpense?.vendor || expenseForm.vendor || "-"],
              ["Date paid:", selectedExpense ? toDisplayDate(selectedExpense.date) : expenseForm.date || "-"],
              ["Amount:", selectedExpense ? selectedExpense.amountDisplay : expenseForm.amount ? formatCurrency(expenseForm.amount) : "-"],
              ["Who paid?", selectedExpense?.paidBy || expenseForm.paidBy || "-"],
              ["Payment method:", selectedExpense?.paymentMethod || expenseForm.paymentMethod || "-"],
              ["Recurring?", selectedExpense?.recurring || expenseForm.recurring || "-"],
              ["Description:", selectedExpense?.description || expenseForm.description || "-"],
              ["Created by:", selectedExpense?.createdByEmail || "-"],
            ].map(([label, value]) => (
              <div key={label} className="border-b border-[#d5d5d5] pb-2">
                <div className="text-[#7a7a7a]">{label}</div>
                <div className="mt-1 text-[#2d2d2d]">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
