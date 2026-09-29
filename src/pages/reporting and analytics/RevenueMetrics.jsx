import { useEffect, useMemo, useState } from "react";
import { analyticsApi } from "../../api/analyticsApi";

const METRIC_LABELS = {
  active_paying_accounts: "Active Paying Accounts",
  mrr: "MRR",
  arr: "ARR",
  arpa: "ARPA",
  new_mrr: "New MRR",
  churned_mrr: "Churned MRR",
  total_revenue: "Total Revenue",
};

const MONEY_KEYS = new Set(["mrr", "arr", "arpa", "new_mrr", "churned_mrr", "total_revenue"]);
const COLORS = ["#8B75FF", "#22C55E", "#F59E0B", "#0EA5E9", "#EF4444", "#64748B"];

const formatMoney = (value) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: amount >= 1000 ? 0 : 2,
  }).format(amount);
};

const formatNumber = (value) => new Intl.NumberFormat("en-US").format(Number(value || 0));

const formatPercent = (value) => `${Number(value || 0).toFixed(1)}%`;

const toDateInput = (date) => date.toISOString().slice(0, 10);

const makeDefaultRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 29);
  return {
    start_date: toDateInput(start),
    end_date: toDateInput(end),
  };
};

const buildMetricCards = (metrics = {}) => {
  const orderedKeys = ["active_paying_accounts", "mrr", "arr", "arpa", "new_mrr", "churned_mrr", "total_revenue"];

  return orderedKeys
    .filter((key) => Object.prototype.hasOwnProperty.call(metrics, key))
    .map((key) => ({
      key,
      label: METRIC_LABELS[key] || key.replaceAll("_", " "),
      value: MONEY_KEYS.has(key) ? formatMoney(metrics[key]) : formatNumber(metrics[key]),
      rawValue: Number(metrics[key] || 0),
    }));
};

const normalizeOptions = (items, fallback) => {
  if (!Array.isArray(items) || items.length === 0) return fallback;
  return items.map((item) => String(item));
};

export default function RevenueMetrics() {
  const [activeRange, setActiveRange] = useState("30d");
  const [selectedQuarter, setSelectedQuarter] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [customRange, setCustomRange] = useState(makeDefaultRange);
  const [periods, setPeriods] = useState({ quarters: [], years: [] });
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadPeriods = async () => {
      try {
        const response = await analyticsApi.getRevenueTimePeriods();
        if (!isMounted) return;

        const quarters = normalizeOptions(response?.quarters, []);
        const years = normalizeOptions(response?.years, [String(new Date().getFullYear())]);

        setPeriods({ quarters, years });
        setSelectedQuarter((current) => current || quarters[0] || "");
        setSelectedYear((current) => current || years[0] || String(new Date().getFullYear()));
      } catch (err) {
        if (!isMounted) return;
        setPeriods({ quarters: [], years: [String(new Date().getFullYear())] });
        setSelectedYear((current) => current || String(new Date().getFullYear()));
      }
    };

    loadPeriods();

    return () => {
      isMounted = false;
    };
  }, []);

  const query = useMemo(() => {
    if (activeRange === "qtd") {
      return { tab: "qtd", quarter: selectedQuarter };
    }

    if (activeRange === "ytd") {
      return { tab: "ytd", year: selectedYear };
    }

    if (activeRange === "custom") {
      return {
        tab: "custom",
        start_date: customRange.start_date,
        end_date: customRange.end_date,
      };
    }

    return { tab: "last_30_days" };
  }, [activeRange, customRange.end_date, customRange.start_date, selectedQuarter, selectedYear]);

  useEffect(() => {
    if (activeRange === "qtd" && !selectedQuarter) return;
    if (activeRange === "ytd" && !selectedYear) return;

    let isMounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await analyticsApi.getRevenueDashboard(query);
        if (!isMounted) return;
        setDashboard(response);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || "Failed to load revenue metrics.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [activeRange, query, selectedQuarter, selectedYear]);

  const metricCards = buildMetricCards(dashboard?.metrics);
  const revenueMix = Array.isArray(dashboard?.revenue_mix?.items) ? dashboard.revenue_mix.items : [];
  const revenueByPlan = Array.isArray(dashboard?.revenue_by_plan) ? dashboard.revenue_by_plan : [];
  const performanceRows = Array.isArray(dashboard?.plan_performance?.rows) ? dashboard.plan_performance.rows : [];
  const performanceTotal = dashboard?.plan_performance?.total;

  const donutGradient = useMemo(() => {
    if (!revenueMix.length) return "#EEF2FF";

    let cursor = 0;
    const stops = revenueMix.map((item, index) => {
      const value = Number(item.percentage ?? item.percent ?? 0);
      const start = cursor;
      const end = cursor + Math.max(value, 0);
      cursor = end;
      return `${COLORS[index % COLORS.length]} ${start}% ${end}%`;
    });

    return `conic-gradient(${stops.join(", ")})`;
  }, [revenueMix]);

  const handleCustomRangeChange = (key, value) => {
    setCustomRange((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Revenue Metrics</h1>
          <p className="text-sm text-slate-500">Live revenue analytics from the admin API.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveRange("30d")}
            className={`rounded-md px-3 py-2 text-sm font-medium ${activeRange === "30d" ? "bg-[#6C5DD3] text-white" : "bg-slate-100 text-slate-700"}`}
          >
            Last 30 days
          </button>
          <button
            type="button"
            onClick={() => setActiveRange("qtd")}
            className={`rounded-md px-3 py-2 text-sm font-medium ${activeRange === "qtd" ? "bg-[#6C5DD3] text-white" : "bg-slate-100 text-slate-700"}`}
          >
            QTD
          </button>
          <button
            type="button"
            onClick={() => setActiveRange("ytd")}
            className={`rounded-md px-3 py-2 text-sm font-medium ${activeRange === "ytd" ? "bg-[#6C5DD3] text-white" : "bg-slate-100 text-slate-700"}`}
          >
            YTD
          </button>
          <button
            type="button"
            onClick={() => setActiveRange("custom")}
            className={`rounded-md px-3 py-2 text-sm font-medium ${activeRange === "custom" ? "bg-[#6C5DD3] text-white" : "bg-slate-100 text-slate-700"}`}
          >
            Custom
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        {activeRange === "qtd" && (
          <select
            value={selectedQuarter}
            onChange={(event) => setSelectedQuarter(event.target.value)}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#6C5DD3]"
          >
            {periods.quarters.map((quarter) => (
              <option key={quarter} value={quarter}>
                {quarter}
              </option>
            ))}
          </select>
        )}

        {activeRange === "ytd" && (
          <select
            value={selectedYear}
            onChange={(event) => setSelectedYear(event.target.value)}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#6C5DD3]"
          >
            {periods.years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        )}

        {activeRange === "custom" && (
          <>
            <input
              type="date"
              value={customRange.start_date}
              onChange={(event) => handleCustomRangeChange("start_date", event.target.value)}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#6C5DD3]"
            />
            <input
              type="date"
              value={customRange.end_date}
              onChange={(event) => handleCustomRangeChange("end_date", event.target.value)}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#6C5DD3]"
            />
          </>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          Loading revenue metrics...
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metricCards.map((metric) => (
              <div key={metric.key} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-medium text-slate-500">{metric.label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{metric.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">Revenue Mix</h2>
              <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row">
                <div
                  className="h-44 w-44 rounded-full"
                  style={{ background: donutGradient }}
                  aria-label="Revenue mix chart"
                />
                <div className="w-full space-y-3">
                  {revenueMix.length ? (
                    revenueMix.map((item, index) => (
                      <div key={`${item.label}-${index}`} className="flex items-center justify-between gap-3 text-sm">
                        <span className="flex items-center gap-2 text-slate-600">
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-sm"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          {item.label || item.name || "Unknown"}
                        </span>
                        <span className="font-semibold text-slate-900">{formatPercent(item.percentage ?? item.percent)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No revenue mix data returned yet.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">Revenue by Plan</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="py-3 pr-4 font-semibold">Plan</th>
                      <th className="py-3 pr-4 font-semibold">Accounts</th>
                      <th className="py-3 pr-4 font-semibold">Revenue</th>
                      <th className="py-3 pr-4 font-semibold">Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {revenueByPlan.length ? (
                      revenueByPlan.map((plan, index) => (
                        <tr key={`${plan.plan || plan.name}-${index}`}>
                          <td className="py-3 pr-4 font-medium text-slate-900">{plan.plan || plan.name || "Unknown"}</td>
                          <td className="py-3 pr-4 text-slate-600">{formatNumber(plan.accounts ?? plan.count)}</td>
                          <td className="py-3 pr-4 text-slate-600">{formatMoney(plan.revenue)}</td>
                          <td className="py-3 pr-4 text-slate-600">{formatPercent(plan.percentage ?? plan.share)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-6 text-center text-slate-500">
                          No plan revenue data returned yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Plan Performance</h2>
                <p className="text-sm text-slate-500">Subscribers, MRR, ARPA, and churn by plan.</p>
              </div>
              {performanceTotal && (
                <div className="text-sm text-slate-600">
                  Total MRR: <span className="font-semibold text-slate-900">{formatMoney(performanceTotal.mrr)}</span>
                </div>
              )}
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-3 pr-4 font-semibold">Plan</th>
                    <th className="py-3 pr-4 font-semibold">Subscribers</th>
                    <th className="py-3 pr-4 font-semibold">MRR</th>
                    <th className="py-3 pr-4 font-semibold">ARPA</th>
                    <th className="py-3 pr-4 font-semibold">Churn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {performanceRows.length ? (
                    performanceRows.map((row, index) => (
                      <tr key={`${row.plan || row.name}-${index}`}>
                        <td className="py-3 pr-4 font-medium text-slate-900">{row.plan || row.name || "Unknown"}</td>
                        <td className="py-3 pr-4 text-slate-600">{formatNumber(row.subscribers ?? row.accounts)}</td>
                        <td className="py-3 pr-4 text-slate-600">{formatMoney(row.mrr)}</td>
                        <td className="py-3 pr-4 text-slate-600">{formatMoney(row.arpa)}</td>
                        <td className="py-3 pr-4 text-slate-600">{formatPercent(row.churn_rate ?? row.churn)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-6 text-center text-slate-500">
                        No performance data returned yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
