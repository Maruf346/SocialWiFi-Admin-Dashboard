import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { routeHistoryApi } from "../../api/routeHistoryApi";

const PAGE_SIZE = 10;

const formatValue = (value, fallback = "-") => {
  if (value === undefined || value === null || value === "") return fallback;
  return value;
};

const formatDistance = (value) => {
  if (value === undefined || value === null || value === "") return "-";
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return String(value);
  return `${numeric.toFixed(2)} km`;
};

const formatStatus = (value) => {
  const statusValue = formatValue(value);
  if (statusValue === "-") return statusValue;
  return String(statusValue)
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const normalizeListResponse = (response) => {
  const results = response?.results || [];
  return {
    results: Array.isArray(results) ? results : [],
    count: response?.count ?? results.length,
    next: response?.next || null,
    previous: response?.previous || null,
  };
};

const statusOptions = ["", "DRAFT", "ON_GOING", "START", "STOP", "COMPLETED", "CANCELLED"];

const AdminRouteHistoryPage = ({ accountType, backLabel }) => {
  const navigate = useNavigate();
  const { userEmail = "" } = useParams();
  const decodedEmail = useMemo(() => decodeURIComponent(userEmail), [userEmail]);

  const [routes, setRoutes] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [ordering, setOrdering] = useState("-created_at");
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [routeDetail, setRouteDetail] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = totalCount ? (safeCurrentPage - 1) * PAGE_SIZE + 1 : 0;
  const pageEnd = Math.min(safeCurrentPage * PAGE_SIZE, totalCount);

  useEffect(() => {
    let isActive = true;

    const loadRoutes = async () => {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const response = await routeHistoryApi.list({
          account_type: accountType,
          user_email: decodedEmail,
          search,
          status,
          date_from: dateFrom,
          date_to: dateTo,
          ordering,
          page: safeCurrentPage,
          page_size: PAGE_SIZE,
        });
        if (!isActive) return;
        const normalized = normalizeListResponse(response);
        setRoutes(normalized.results);
        setTotalCount(normalized.count);
        if (
          selectedRouteId &&
          !normalized.results.some((route) => route.id === selectedRouteId)
        ) {
          setSelectedRouteId(null);
          setRouteDetail(null);
          setWaypoints([]);
        }
      } catch (error) {
        if (!isActive) return;
        setRoutes([]);
        setTotalCount(0);
        setErrorMessage(error.message || "Unable to load route history.");
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadRoutes();

    return () => {
      isActive = false;
    };
  }, [accountType, decodedEmail, search, status, dateFrom, dateTo, ordering, safeCurrentPage, selectedRouteId]);

  useEffect(() => {
    if (!selectedRouteId) return;
    let isActive = true;

    const loadDetail = async () => {
      setIsDetailLoading(true);
      setErrorMessage("");
      try {
        const [detail, waypointList] = await Promise.all([
          routeHistoryApi.retrieve(selectedRouteId),
          routeHistoryApi.listWaypoints(selectedRouteId),
        ]);
        if (!isActive) return;
        setRouteDetail(detail);
        setWaypoints(Array.isArray(waypointList) ? waypointList : []);
      } catch (error) {
        if (!isActive) return;
        setRouteDetail(null);
        setWaypoints([]);
        setErrorMessage(error.message || "Unable to load route details.");
      } finally {
        if (isActive) setIsDetailLoading(false);
      }
    };

    loadDetail();

    return () => {
      isActive = false;
    };
  }, [selectedRouteId]);

  const applySearch = () => {
    setSearch(searchInput.trim());
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatus("");
    setDateFrom("");
    setDateTo("");
    setOrdering("-created_at");
    setCurrentPage(1);
  };

  const selectedRoute = routeDetail || routes.find((route) => route.id === selectedRouteId);
  const permits = Array.isArray(routeDetail?.permits) ? routeDetail.permits : [];

  return (
    <main className="min-h-full bg-white px-2 py-3 text-sm text-[#777] md:px-8 md:py-6">
      <button type="button" onClick={() => navigate(-1)} className="mb-5 underline cursor-pointer">
        {backLabel}
      </button>

      <div className="mb-4">
        <h1 className="mb-2 text-xl font-normal text-[#999] md:text-2xl">Route history</h1>
        <p>
          Routes created by <strong className="text-[#444]">{decodedEmail}</strong>
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {errorMessage}
        </div>
      )}

      <section className="mb-4 flex flex-wrap items-end gap-3 text-xs">
        <label className="flex flex-col gap-1 text-[#666]">
          Search
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") applySearch();
              }}
              className="h-7 w-44 rounded border border-[#ccc] bg-white px-2 text-xs outline-none"
            />
            <button
              type="button"
              onClick={applySearch}
              className="h-7 rounded border border-[#ccc] bg-[#efefef] px-2.5 text-xs text-[#333] hover:bg-[#e4e4e4] cursor-pointer"
            >
              Go
            </button>
          </div>
        </label>

        <label className="flex flex-col gap-1 text-[#666]">
          Status
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setCurrentPage(1);
            }}
            className="h-7 rounded border border-[#ccc] bg-white px-2 text-xs outline-none"
          >
            {statusOptions.map((option) => (
              <option key={option || "all"} value={option}>
                {option ? formatStatus(option) : "All statuses"}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-[#666]">
          From
          <input
            type="date"
            value={dateFrom}
            onChange={(event) => {
              setDateFrom(event.target.value);
              setCurrentPage(1);
            }}
            className="h-7 rounded border border-[#ccc] bg-white px-2 text-xs outline-none"
          />
        </label>

        <label className="flex flex-col gap-1 text-[#666]">
          To
          <input
            type="date"
            value={dateTo}
            onChange={(event) => {
              setDateTo(event.target.value);
              setCurrentPage(1);
            }}
            className="h-7 rounded border border-[#ccc] bg-white px-2 text-xs outline-none"
          />
        </label>

        <label className="flex flex-col gap-1 text-[#666]">
          Sort
          <select
            value={ordering}
            onChange={(event) => {
              setOrdering(event.target.value);
              setCurrentPage(1);
            }}
            className="h-7 rounded border border-[#ccc] bg-white px-2 text-xs outline-none"
          >
            <option value="-created_at">Newest first</option>
            <option value="created_at">Oldest first</option>
            <option value="name">Name A-Z</option>
            <option value="-name">Name Z-A</option>
            <option value="-total_distance_km">Distance high-low</option>
            <option value="total_distance_km">Distance low-high</option>
          </select>
        </label>

        <button
          type="button"
          onClick={clearFilters}
          className="h-7 rounded border border-[#ccc] bg-white px-2.5 text-xs text-[#333] hover:bg-[#f5f5f5] cursor-pointer"
        >
          Clear
        </button>
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.45fr_1fr]">
        <section className="min-w-0">
          <div className="overflow-x-auto border border-[#eee]">
            <table className="w-full min-w-[780px] border-collapse text-left text-xs">
              <thead>
                <tr className="h-8 border-b border-[#eee] bg-[#f3f3f3] uppercase text-[#888]">
                  <th className="px-3 py-2 font-normal">Route</th>
                  <th className="px-3 py-2 font-normal">Driver</th>
                  <th className="px-3 py-2 font-normal">Team</th>
                  <th className="px-3 py-2 font-normal">Created</th>
                  <th className="px-3 py-2 font-normal">Status</th>
                  <th className="px-3 py-2 font-normal">Distance</th>
                  <th className="px-3 py-2 font-normal">Waypoints</th>
                  <th className="px-3 py-2 font-normal">Permits</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="8" className="px-3 py-5 text-center text-[#888]">
                      Loading route history...
                    </td>
                  </tr>
                ) : routes.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-3 py-5 text-center text-[#888]">
                      No routes found for this driver.
                    </td>
                  </tr>
                ) : (
                  routes.map((route) => (
                    <tr
                      key={route.id}
                      onClick={() => setSelectedRouteId(route.id)}
                      className={`h-9 cursor-pointer border-b border-[#f2f2f2] hover:bg-[#fafafa] ${
                        selectedRouteId === route.id ? "bg-[#fff7f2]" : ""
                      }`}
                    >
                      <td className="px-3 py-2 text-[#444]">
                        <div className="font-medium">{formatValue(route.name, "Untitled route")}</div>
                        <div className="text-[11px] text-[#999]">{formatValue(route.route_number)}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-[#555]">{formatValue(route.driver_name)}</div>
                        <div className="text-[11px] text-[#999]">{formatValue(route.driver_email)}</div>
                      </td>
                      <td className="px-3 py-2">{formatValue(route.team_name)}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {formatValue(route.created_at_formatted || route.created_at)}
                      </td>
                      <td className="px-3 py-2 capitalize">{formatStatus(route.status)}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{formatDistance(route.total_distance_km)}</td>
                      <td className="px-3 py-2">{formatValue(route.total_waypoints, 0)}</td>
                      <td className="px-3 py-2">{formatValue(route.permit_count, 0)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between border-b border-[#eee] py-2 text-xs text-[#777]">
            <span>
              {pageStart}-{pageEnd} of {totalCount} routes
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={safeCurrentPage <= 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                className="underline hover:text-black disabled:cursor-not-allowed disabled:text-[#bbb] cursor-pointer"
              >
                Previous
              </button>
              <span className="text-[#555]">
                Page {safeCurrentPage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={safeCurrentPage >= totalPages}
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                className="underline hover:text-black disabled:cursor-not-allowed disabled:text-[#bbb] cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </section>

        <aside className="min-w-0 border border-[#eee] bg-[#fafafa] p-4 text-xs">
          {!selectedRouteId ? (
            <p className="text-[#888]">Select a route to view details.</p>
          ) : isDetailLoading ? (
            <p className="text-[#888]">Loading route details...</p>
          ) : (
            <div className="space-y-4">
              <div>
                <h2 className="mb-1 text-base font-normal text-[#555]">
                  {formatValue(selectedRoute?.name, "Untitled route")}
                </h2>
                <p className="text-[#999]">{formatValue(selectedRoute?.route_number)}</p>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[#666]">
                <span>Status</span>
                <strong className="font-normal text-[#333] capitalize">
                  {formatStatus(selectedRoute?.status)}
                </strong>
                <span>Driver</span>
                <strong className="font-normal text-[#333]">{formatValue(selectedRoute?.driver_name)}</strong>
                <span>Email</span>
                <strong className="font-normal text-[#333] break-all">{formatValue(selectedRoute?.driver_email)}</strong>
                <span>Distance</span>
                <strong className="font-normal text-[#333]">{formatDistance(selectedRoute?.total_distance_km)}</strong>
                <span>Waypoints</span>
                <strong className="font-normal text-[#333]">{formatValue(selectedRoute?.total_waypoints, 0)}</strong>
                <span>Permits</span>
                <strong className="font-normal text-[#333]">{formatValue(selectedRoute?.permit_count, 0)}</strong>
              </div>

              {routeDetail?.description && (
                <div>
                  <h3 className="mb-1 text-sm font-normal text-[#555]">Description</h3>
                  <p className="text-[#666]">{routeDetail.description}</p>
                </div>
              )}

              <div>
                <h3 className="mb-2 text-sm font-normal text-[#555]">Waypoints</h3>
                {waypoints.length === 0 ? (
                  <p className="text-[#888]">No waypoints found.</p>
                ) : (
                  <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                    {waypoints.map((waypoint) => (
                      <div key={waypoint.id} className="border-b border-[#eee] pb-2">
                        <div className="flex items-center justify-between gap-2">
                          <strong className="font-normal text-[#333]">
                            {formatValue(waypoint.name, `Waypoint ${waypoint.index ?? ""}`)}
                          </strong>
                          <span className="text-[#999]">{formatValue(waypoint.waypoint_type)}</span>
                        </div>
                        <p className="text-[#777]">
                          {formatValue(waypoint.latitude)}, {formatValue(waypoint.longitude)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="mb-2 text-sm font-normal text-[#555]">Permits</h3>
                {permits.length === 0 ? (
                  <p className="text-[#888]">No permits found.</p>
                ) : (
                  <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
                    {permits.map((permit) => (
                      <div key={permit.id} className="border-b border-[#eee] pb-2">
                        <strong className="font-normal text-[#333]">
                          {formatValue(permit.name, `Permit ${permit.index ?? ""}`)}
                        </strong>
                        <p className="text-[#777]">
                          {formatValue(permit.start_location)} to {formatValue(permit.end_location)}
                        </p>
                        <p className="text-[#999]">{formatValue(permit.processing_status)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
};

export default AdminRouteHistoryPage;
