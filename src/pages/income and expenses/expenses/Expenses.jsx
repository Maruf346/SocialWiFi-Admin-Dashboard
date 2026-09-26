import { useEffect, useMemo, useState } from "react";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const initialExpenseRecords = [
  {
    id: "exp-001",
    vendor: "OpenAI",
    date: "2026-07-05",
    amount: 37.84,
    paidBy: "Brad",
    paymentMethod: "MC Card",
    recurring: "No",
    description: "For ongoing use of OpenAI for app operations.",
  },
  {
    id: "exp-002",
    vendor: "Dropbox",
    date: "2026-07-11",
    amount: 13.2,
    paidBy: "Brad",
    paymentMethod: "MC Card",
    recurring: "Monthly",
    description: "Cloud storage and secure backups for the project team.",
  },
  {
    id: "exp-003",
    vendor: "Google Workspace",
    date: "2026-08-02",
    amount: 42.0,
    paidBy: "Jill",
    paymentMethod: "Visa",
    recurring: "Monthly",
    description: "Team email and productivity suite subscription.",
  },
  {
    id: "exp-004",
    vendor: "SendGrid",
    date: "2026-08-15",
    amount: 29.5,
    paidBy: "Brad",
    paymentMethod: "MC Card",
    recurring: "No",
    description: "Transactional email credits and automation services.",
  },
];

const dailyExpenses = Object.fromEntries(
  initialExpenseRecords.map((entry) => [entry.date, entry]),
);

const buildCalendarDays = (monthDate) => {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const lastDay = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth() + 1,
    0,
  );
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

const formatCurrency = (value) =>
  `$${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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

const getMonthTotal = (year, monthIndex) => {
  let total = 0;

  Object.entries(dailyExpenses).forEach(([key, value]) => {
    const [entryYear, entryMonth] = key.split("-").map(Number);
    if (entryYear === year && entryMonth - 1 === monthIndex) {
      total += Number(value.amount);
    }
  });

  return total;
};

const getYearTotal = (year) => {
  let total = 0;

  Object.entries(dailyExpenses).forEach(([key, value]) => {
    const [entryYear] = key.split("-").map(Number);
    if (entryYear === year) {
      total += Number(value.amount);
    }
  });

  return total;
};

const createEmptyForm = (date) => ({
  vendor: "",
  date: `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}/${date.getFullYear()}`,
  amount: "",
  paidBy: "",
  paymentMethod: "MC Card",
  recurring: "No",
  description: "",
});

const parseDateInput = (value) => {
  if (!value) return null;

  const [month, day, year] = value.split("/").map(Number);
  if (!month || !day || !year) return null;

  return new Date(year, month - 1, day);
};

const Expenses = () => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [calendarMode, setCalendarMode] = useState("day");
  const [expenseRecords, setExpenseRecords] = useState(initialExpenseRecords);
  const [selectedExpenseId, setSelectedExpenseId] = useState("exp-001");
  const [expenseForm, setExpenseForm] = useState(createEmptyForm(today));

  const calendarDays = useMemo(
    () => buildCalendarDays(visibleMonth),
    [visibleMonth],
  );

  const dateKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
  const monthKey = `${visibleMonth.getFullYear()}-${String(visibleMonth.getMonth() + 1).padStart(2, "0")}`;
  const yearSelected = calendarMode === "year";
  const monthSelected = calendarMode === "month";

  const selectedExpense = useMemo(
    () =>
      expenseRecords.find((entry) => entry.id === selectedExpenseId) ?? null,
    [expenseRecords, selectedExpenseId],
  );

  const selectedExpenseRecord = useMemo(
    () =>
      expenseRecords.find(
        (entry) =>
          entry.date ===
          `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`,
      ) ?? null,
    [expenseRecords, selectedDate],
  );

  const selectedValue = yearSelected
    ? expenseRecords
        .filter(
          (entry) =>
            new Date(entry.date).getFullYear() === visibleMonth.getFullYear(),
        )
        .reduce((sum, entry) => sum + Number(entry.amount), 0)
    : monthSelected
      ? expenseRecords
          .filter((entry) => {
            const entryDate = new Date(entry.date);
            return (
              entryDate.getFullYear() === visibleMonth.getFullYear() &&
              entryDate.getMonth() === visibleMonth.getMonth()
            );
          })
          .reduce((sum, entry) => sum + Number(entry.amount), 0)
      : Number(selectedExpenseRecord?.amount ?? selectedExpense?.amount ?? 0);

  const activeExpenseEntries = useMemo(() => {
    if (yearSelected) {
      return expenseRecords.filter(
        (entry) =>
          new Date(entry.date).getFullYear() === visibleMonth.getFullYear(),
      );
    }

    if (monthSelected) {
      return expenseRecords.filter((entry) => {
        const entryDate = new Date(entry.date);
        return (
          entryDate.getFullYear() === visibleMonth.getFullYear() &&
          entryDate.getMonth() === visibleMonth.getMonth()
        );
      });
    }

    return expenseRecords.filter((entry) => entry.date === dateKey);
  }, [dateKey, expenseRecords, monthSelected, visibleMonth, yearSelected]);

  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(visibleMonth);

  const handlePrevMonth = () => {
    setVisibleMonth(
      new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setVisibleMonth(
      new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1),
    );
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

  const isSelectedDay = (day) => {
    if (!day) return false;
    return (
      selectedDate.getFullYear() === visibleMonth.getFullYear() &&
      selectedDate.getMonth() === visibleMonth.getMonth() &&
      selectedDate.getDate() === day
    );
  };

  const periodLabel = yearSelected
    ? `${visibleMonth.getFullYear()}`
    : monthSelected
      ? `${new Intl.DateTimeFormat("en-US", { month: "long" }).format(visibleMonth)} ${visibleMonth.getFullYear()}`
      : formatDisplayDateWithYear(selectedDate);

  const yearOptions = Array.from(
    { length: 12 },
    (_, index) => visibleMonth.getFullYear() - 5 + index,
  );

  useEffect(() => {
    const current =
      expenseRecords.find((entry) => entry.date === dateKey) ?? null;
    setExpenseForm({
      vendor: current?.vendor ?? "",
      date:
        current?.date ??
        `${String(selectedDate.getMonth() + 1).padStart(2, "0")}/${String(selectedDate.getDate()).padStart(2, "0")}/${selectedDate.getFullYear()}`,
      amount: current?.amount !== undefined ? String(current.amount) : "",
      paidBy: current?.paidBy ?? "",
      paymentMethod: current?.paymentMethod ?? "MC Card",
      recurring: current?.recurring ?? "No",
      description: current?.description ?? "",
    });
  }, [dateKey, expenseRecords, selectedDate]);

  const handleChange = (field, value) => {
    setExpenseForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSaveExpense = () => {
    const trimmedVendor = expenseForm.vendor.trim();
    const parsedDate = parseDateInput(expenseForm.date);
    const amountValue = Number(expenseForm.amount);

    if (!trimmedVendor || !parsedDate || Number.isNaN(amountValue)) {
      return;
    }

    const isoDate = `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, "0")}-${String(parsedDate.getDate()).padStart(2, "0")}`;

    const newEntry = {
      id: `${Date.now()}`,
      vendor: trimmedVendor,
      date: isoDate,
      amount: Number(amountValue),
      paidBy: expenseForm.paidBy.trim() || "Unknown",
      paymentMethod: expenseForm.paymentMethod,
      recurring: expenseForm.recurring,
      description: expenseForm.description.trim(),
    };

    setExpenseRecords((previous) => [newEntry, ...previous]);
    setSelectedDate(parsedDate);
    setVisibleMonth(
      new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1),
    );
    setCalendarMode("day");
    setExpenseForm(createEmptyForm(parsedDate));
  };

  const handleClearExpense = () => {
    setExpenseForm(createEmptyForm(selectedDate));
  };

  const handleSelectExpense = (entry) => {
    setSelectedExpenseId(entry.id);
    setSelectedDate(new Date(entry.date));
    setVisibleMonth(new Date(entry.date));
  };

  const handleEditSelectedExpense = () => {
    if (!selectedExpense) return;

    setExpenseForm({
      vendor: selectedExpense.vendor,
      date: `${String(new Date(selectedExpense.date).getMonth() + 1).padStart(2, "0")}/${String(new Date(selectedExpense.date).getDate()).padStart(2, "0")}/${new Date(selectedExpense.date).getFullYear()}`,
      amount: String(selectedExpense.amount),
      paidBy: selectedExpense.paidBy,
      paymentMethod: selectedExpense.paymentMethod,
      recurring: selectedExpense.recurring,
      description: selectedExpense.description,
    });
  };

  const handleDownloadExpenses = () => {
    const rows =
      activeExpenseEntries.length > 0
        ? activeExpenseEntries
        : selectedExpense
          ? [selectedExpense]
          : [];
    const headers = [
      "Vendor/Company",
      "Date paid",
      "Amount",
      "Who paid",
      "Payment method",
      "Recurring",
      "Description",
    ];

    const csvRows = [
      headers,
      ...rows.map((entry) => [
        entry.vendor,
        `${String(new Date(entry.date).getMonth() + 1).padStart(2, "0")}/${String(new Date(entry.date).getDate()).padStart(2, "0")}/${new Date(entry.date).getFullYear()}`,
        Number(entry.amount).toFixed(2),
        entry.paidBy,
        entry.paymentMethod,
        entry.recurring,
        entry.description,
      ]),
    ].map((row) =>
      row
        .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
        .join(","),
    );

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const filename = `expenses-${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}.csv`;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-full bg-white px-2 py-3 text-[#666] md:px-8 md:py-6">
      <div className="mb-8">
        <h1 className="text-xl font-normal text-[#999] md:text-2xl">Expenses</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[440px_minmax(0,1fr)]">
        <div className="w-full max-w-[440px] rounded-[10px] border border-[#d9d9d9] bg-[#f3f3f3] p-0 shadow-sm">
          <div className="mb-1 flex items-center justify-between bg-[#ececec] px-4 py-3 text-[#4a4a4a]">
            <span className="text-[18px] font-medium leading-none">
              {formatDisplayDate(selectedDate)}
            </span>
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
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    aria-label="Previous month"
                    className="text-[16px] leading-none"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    aria-label="Next month"
                    className="text-[16px] leading-none"
                  >
                    ▼
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
                      onClick={() =>
                        day &&
                        setSelectedDate(
                          new Date(
                            visibleMonth.getFullYear(),
                            visibleMonth.getMonth(),
                            day,
                          ),
                        )
                      }
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
                  <button
                    type="button"
                    onClick={() => handleYearChange(-1)}
                    aria-label="Previous year"
                    className="text-[16px] leading-none"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => handleYearChange(1)}
                    aria-label="Next year"
                    className="text-[16px] leading-none"
                  >
                    ▼
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
                        isSelected
                          ? "bg-[#f28d4d] text-white"
                          : "text-[#444] hover:bg-[#e8e8e8]"
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
                <span className="text-[18px] font-medium text-[#333]">
                  {visibleMonth.getFullYear()}
                </span>
                <div className="flex items-center gap-2 text-[#666]">
                  <button
                    type="button"
                    onClick={() => handleYearChange(-1)}
                    aria-label="Previous year"
                    className="text-[16px] leading-none"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => handleYearChange(1)}
                    aria-label="Next year"
                    className="text-[16px] leading-none"
                  >
                    ▼
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
                        isSelected
                          ? "bg-[#f28d4d] text-white"
                          : "text-[#444] hover:bg-[#e8e8e8]"
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

        <div className="flex w-full flex-col gap-5 pt-1">
          <div className="w-full rounded-[8px] bg-[#f39f5f] px-4 py-3 text-[14px] font-medium text-white shadow-sm">
            {periodLabel}: {formatCurrency(selectedValue)}
          </div>

          <div className="overflow-hidden rounded-[8px] border border-[#d9d9d9] bg-[#f1f1f1] shadow-sm">
            <div className="border-b border-[#d9d9d9] bg-[#f3f3f3] px-4 py-3 text-[16px] font-semibold uppercase tracking-[0.06em] text-[#333]">
              Expenses
            </div>

            <div className="max-h-[320px] overflow-y-auto">
              {activeExpenseEntries.length > 0 ? (
                activeExpenseEntries.map((entry, index) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => handleSelectExpense(entry)}
                    className={`flex w-full items-center justify-between border-b border-[#d9d9d9] px-4 py-3 text-left text-[14px] text-[#333] underline decoration-1 underline-offset-2 transition hover:text-[#1b1b1b] last:border-b-0 ${
                      index % 2 === 0 ? "bg-[#f8f8f8]" : "bg-[#f3f3f3]"
                    } ${selectedExpenseId === entry.id ? "bg-[#f7ded0]" : ""}`}
                  >
                    <span className="cursor-pointer">{entry.vendor}</span>
                  </button>
                ))
              ) : (
                <div className="border-b border-[#d9d9d9] bg-[#f8f8f8] px-4 py-3 text-[14px] text-[#888]">
                  No expense recorded
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-[#d9d9d9] bg-[#f3f3f3] px-4 py-3 text-[12px] text-[#666]">
              <span>{`1–${activeExpenseEntries.length} of ${activeExpenseEntries.length} entries`}</span>
              <div className="flex items-center gap-2">
                <button type="button" className="text-[#555]">
                  Previous
                </button>
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

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded-[10px] border border-[#d9d9d9] bg-[#f5f5f5] p-4 shadow-sm">
          <div className="mb-4 text-[18px] font-medium text-[#2d2d2d]">
            Add New Expense / Edit Expense
          </div>

          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
              <label className="flex flex-col gap-1 text-[12px] text-[#555]">
                <span>Vendor/Company:</span>
                <input
                  value={expenseForm.vendor}
                  onChange={(event) =>
                    handleChange("vendor", event.target.value)
                  }
                  className="h-[38px] rounded-[4px] border border-[#d3d3d3] bg-white px-3 text-[14px] text-[#333] outline-none focus:border-[#f08a45]"
                />
              </label>

              <label className="flex flex-col gap-1 text-[12px] text-[#555]">
                <span>Date paid:</span>
                <input
                  type="date"
                  value={
                    expenseForm.date && expenseForm.date.includes("/")
                      ? (() => {
                          const [month, day, year] =
                            expenseForm.date.split("/");
                          if (!month || !day || !year) return "";
                          return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                        })()
                      : expenseForm.date
                  }
                  onChange={(event) => {
                    const selected = event.target.value;
                    if (!selected) {
                      handleChange("date", "");
                      return;
                    }

                    const [year, month, day] = selected.split("-");
                    handleChange("date", `${month}/${day}/${year}`);
                  }}
                  className="h-[38px] rounded-[4px] border border-[#d3d3d3] bg-white px-3 text-[14px] text-[#333] outline-none focus:border-[#f08a45]"
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
              <label className="flex flex-col gap-1 text-[12px] text-[#555]">
                <span>Amount:</span>
                <input
                  value={expenseForm.amount}
                  onChange={(event) =>
                    handleChange("amount", event.target.value)
                  }
                  className="h-[38px] rounded-[4px] border border-[#d3d3d3] bg-white px-3 text-[14px] text-[#333] outline-none focus:border-[#f08a45]"
                />
              </label>

              <label className="flex flex-col gap-1 text-[12px] text-[#555]">
                <span>Who paid?</span>
                <input
                  value={expenseForm.paidBy}
                  onChange={(event) =>
                    handleChange("paidBy", event.target.value)
                  }
                  className="h-[38px] rounded-[4px] border border-[#d3d3d3] bg-white px-3 text-[14px] text-[#333] outline-none focus:border-[#f08a45]"
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
              <label className="flex flex-col gap-1 text-[12px] text-[#555]">
                <span>Payment method:</span>
                <div className="flex h-[38px] items-center gap-2 rounded-[4px] border border-[#d3d3d3] bg-white px-3 text-[14px] text-[#333]">
                  <select
                    value={expenseForm.paymentMethod}
                    onChange={(event) =>
                      handleChange("paymentMethod", event.target.value)
                    }
                    className="w-full bg-transparent outline-none"
                  >
                    <option>MC Card</option>
                    <option>Visa</option>
                    <option>ACH</option>
                    <option>Wire</option>
                  </select>
                </div>
              </label>

              <label className="flex flex-col gap-1 text-[12px] text-[#555]">
                <span>Recurring?</span>
                <div className="flex h-[38px] items-center gap-2 rounded-[4px] border border-[#d3d3d3] bg-white px-3 text-[14px] text-[#333]">
                  <select
                    value={expenseForm.recurring}
                    onChange={(event) =>
                      handleChange("recurring", event.target.value)
                    }
                    className="w-full bg-transparent outline-none"
                  >
                    <option>No</option>
                    <option>Yes</option>
                    <option>Monthly</option>
                    <option>Yearly</option>
                  </select>
                </div>
              </label>
            </div>

            <label className="flex flex-col gap-1 text-[12px] text-[#555]">
              <span>Description:</span>
              <textarea
                value={expenseForm.description}
                onChange={(event) =>
                  handleChange("description", event.target.value)
                }
                rows={4}
                className="resize-none rounded-[4px] border border-[#d3d3d3] bg-white px-3 py-2 text-[14px] text-[#333] outline-none focus:border-[#f08a45]"
              />
            </label>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveExpense}
                className="rounded-[4px] bg-[#1f2d5b] px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-white cursor-pointer"
              >
                Save
              </button>
              <button
                type="button"
                onClick={handleClearExpense}
                className="rounded-[4px] bg-[#1f2d5b] px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-white cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-[10px] border border-[#d9d9d9] bg-[#f5f5f5] p-4 shadow-sm">
          <div className="mb-4 text-[18px] font-medium text-[#2d2d2d]">
            Expense log
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <div className="border-b border-[#d5d5d5] pb-2 text-[13px] text-[#555]">
                <div className="text-[#7a7a7a]">Vendor/Company:</div>
                <div className="mt-1 text-[#2d2d2d]">
                  {selectedExpense?.vendor || expenseForm.vendor || "OpenAI"}
                </div>
              </div>

              <div className="border-b border-[#d5d5d5] pb-2 text-[13px] text-[#555]">
                <div className="text-[#7a7a7a]">Date paid:</div>
                <div className="mt-1 text-[#2d2d2d]">
                  {selectedExpense
                    ? `${String(new Date(selectedExpense.date).getMonth() + 1).padStart(2, "0")}/${String(new Date(selectedExpense.date).getDate()).padStart(2, "0")}/${new Date(selectedExpense.date).getFullYear()}`
                    : expenseForm.date || "07/05/2026"}
                </div>
              </div>

              <div className="border-b border-[#d5d5d5] pb-2 text-[13px] text-[#555]">
                <div className="text-[#7a7a7a]">Amount:</div>
                <div className="mt-1 text-[#2d2d2d]">
                  {selectedExpense
                    ? formatCurrency(selectedExpense.amount)
                    : expenseForm.amount
                      ? formatCurrency(expenseForm.amount)
                      : formatCurrency(37.84)}
                </div>
              </div>

              <div className="border-b border-[#d5d5d5] pb-2 text-[13px] text-[#555]">
                <div className="text-[#7a7a7a]">Who paid?</div>
                <div className="mt-1 text-[#2d2d2d]">
                  {selectedExpense?.paidBy || expenseForm.paidBy || "Brad"}
                </div>
              </div>

              <div className="border-b border-[#d5d5d5] pb-2 text-[13px] text-[#555]">
                <div className="text-[#7a7a7a]">Payment method:</div>
                <div className="mt-1 text-[#2d2d2d]">
                  {selectedExpense?.paymentMethod ||
                    expenseForm.paymentMethod ||
                    "MC Card"}
                </div>
              </div>

              <div className="border-b border-[#d5d5d5] pb-2 text-[13px] text-[#555]">
                <div className="text-[#7a7a7a]">Recurring?</div>
                <div className="mt-1 text-[#2d2d2d]">
                  {selectedExpense?.recurring || expenseForm.recurring || "No"}
                </div>
              </div>

              <div className="border-b border-[#d5d5d5] pb-2 text-[13px] text-[#555]">
                <div className="text-[#7a7a7a]">Description:</div>
                <div className="mt-1 text-[#2d2d2d]">
                  {selectedExpense?.description ||
                    expenseForm.description ||
                    "For ongoing use of OpenAI for app operations."}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleEditSelectedExpense}
                className="rounded-[4px] bg-[#1f2d5b] px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-white cursor-pointer"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={handleDownloadExpenses}
                className="rounded-[4px] bg-[#1f2d5b] px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-white cursor-pointer"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
