import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Users,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Plus,
  Truck,
  ShieldCheck,
} from "lucide-react";

const initialDriverRoster = [
  { id: "DRV-101", name: "Marcus Vance", phone: "(555) 301-4421", email: "mvance@mercerfreight.com", status: "Active", vehicle: "Semi-Truck #104", currentRoute: "Route 94 North (Fargo - Minneapolis)", completedRoutes: 142 },
  { id: "DRV-102", name: "David Kross", phone: "(555) 301-8890", email: "dkross@mercerfreight.com", status: "En Route", vehicle: "Freightliner #202", currentRoute: "Interstate 35 (Duluth - Des Moines)", completedRoutes: 98 },
  { id: "DRV-103", name: "Sarah Lin", phone: "(555) 301-6543", email: "slin@mercerfreight.com", status: "Active", vehicle: "Volvo VNL #308", currentRoute: "Regional Route 12", completedRoutes: 175 },
  { id: "DRV-104", name: "Robert Hayes", phone: "(555) 301-9922", email: "rhayes@mercerfreight.com", status: "Off Duty", vehicle: "Kenworth #115", currentRoute: "Standby", completedRoutes: 64 },
  { id: "DRV-105", name: "James Wilson", phone: "(555) 301-1104", email: "jwilson@mercerfreight.com", status: "En Route", vehicle: "Peterbilt #404", currentRoute: "US Hwy 10 Westbound", completedRoutes: 210 },
  { id: "DRV-106", name: "Elena Rostova", phone: "(555) 301-7733", email: "erostova@mercerfreight.com", status: "Active", vehicle: "Mack Anthem #501", currentRoute: "Metro Delivery Hub A", completedRoutes: 89 },
  { id: "DRV-107", name: "Tyler Jenkins", phone: "(555) 301-5512", email: "tjenkins@mercerfreight.com", status: "Active", vehicle: "Freightliner #207", currentRoute: "Route 52 Southbound", completedRoutes: 112 },
  { id: "DRV-108", name: "Carlos Mendez", phone: "(555) 301-2287", email: "cmendez@mercerfreight.com", status: "En Route", vehicle: "Volvo VNL #314", currentRoute: "I-90 Express Freight", completedRoutes: 154 },
];

const TeamManagerDashboard = () => {
  const { userEmail } = useParams();
  const navigate = useNavigate();
  const decodedEmail = decodeURIComponent(userEmail || "team@example.com");

  const [drivers, setDrivers] = useState(initialDriverRoster);
  const [activeTab, setActiveTab] = useState("drivers"); // 'drivers' | 'routes' | 'settings'
  const [toastMessage, setToastMessage] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newDriver, setNewDriver] = useState({ name: "", email: "", phone: "", vehicle: "" });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2500);
  };

  const handleAddDriver = (e) => {
    e.preventDefault();
    if (!newDriver.name.trim() || !newDriver.email.trim()) {
      showToast("Driver Name and Email are required");
      return;
    }
    const created = {
      id: `DRV-${Math.floor(100 + Math.random() * 900)}`,
      name: newDriver.name.trim(),
      email: newDriver.email.trim(),
      phone: newDriver.phone.trim() || "(555) 000-0000",
      status: "Active",
      vehicle: newDriver.vehicle.trim() || "Unassigned",
      currentRoute: "Standby",
      completedRoutes: 0,
    };
    setDrivers((prev) => [created, ...prev]);
    setNewDriver({ name: "", email: "", phone: "", vehicle: "" });
    setAddModalOpen(false);
    showToast(`Driver ${created.name} added to team roster`);
  };

  const handleRemoveDriver = (id, name) => {
    setDrivers((prev) => prev.filter((d) => d.id !== id));
    showToast(`Driver ${name} removed from team`);
  };

  return (
    <div className="min-h-full bg-white px-2 py-3 text-[#555] md:px-8 md:py-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 rounded bg-[#151d56] px-4 py-2 text-sm text-white shadow-lg transition-all">
          {toastMessage}
        </div>
      )}

      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate("/dashboard/team-users")}
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#ff823d] hover:underline cursor-pointer"
      >
        <ArrowLeft size={14} /> BACK TO MANAGE TEAMS
      </button>

      {/* Header Info */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#eee] pb-4">
        <div>
          <h1 className="text-xl font-normal text-[#999] md:text-2xl">
            Team Manager Dashboard
          </h1>
          <p className="mt-1 text-xs text-[#666]">
            Manager Account: <strong className="text-[#222]">{decodedEmail}</strong> &bull; Access Level: <span className="inline-flex items-center gap-1 font-semibold text-green-700"><ShieldCheck size={13} /> Full Administrator Access</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-[#ff823d] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#e06d2c] cursor-pointer"
          >
            <Plus size={14} />
            <span>ADD TEAM DRIVER</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded border border-[#e5e5e5] bg-[#fafafa] p-3 text-xs">
          <span className="text-[#888]">Active Drivers</span>
          <p className="mt-1 text-xl font-bold text-[#18205c]">{drivers.length} / 25</p>
          <span className="text-[11px] text-[#4f8c62]">Plan Allowance: 25 Drivers</span>
        </div>

        <div className="rounded border border-[#e5e5e5] bg-[#fafafa] p-3 text-xs">
          <span className="text-[#888]">Drivers En Route</span>
          <p className="mt-1 text-xl font-bold text-[#ff823d]">
            {drivers.filter((d) => d.status === "En Route").length}
          </p>
          <span className="text-[11px] text-[#666]">Live GPS Tracking Active</span>
        </div>

        <div className="rounded border border-[#e5e5e5] bg-[#fafafa] p-3 text-xs">
          <span className="text-[#888]">Completed Routes (Month)</span>
          <p className="mt-1 text-xl font-bold text-[#333]">1,042</p>
          <span className="text-[11px] text-[#4f8c62]">&uarr; 14% vs last month</span>
        </div>

        <div className="rounded border border-[#e5e5e5] bg-[#fafafa] p-3 text-xs">
          <span className="text-[#888]">Subscription Tier</span>
          <p className="mt-1 text-xl font-bold text-[#333]">Team Pro</p>
          <span className="text-[11px] text-[#666]">$149.00 / month</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex border-b border-[#ddd] text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("drivers")}
          className={`flex items-center gap-1.5 border-b-2 px-4 py-2 font-semibold cursor-pointer ${
            activeTab === "drivers"
              ? "border-[#ff823d] text-[#ff823d]"
              : "border-transparent text-[#666] hover:text-[#222]"
          }`}
        >
          <Users size={14} /> DRIVER ROSTER ({drivers.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("routes")}
          className={`flex items-center gap-1.5 border-b-2 px-4 py-2 font-semibold cursor-pointer ${
            activeTab === "routes"
              ? "border-[#ff823d] text-[#ff823d]"
              : "border-transparent text-[#666] hover:text-[#222]"
          }`}
        >
          <Navigation size={14} /> LIVE ROUTE DISPATCH
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "drivers" && (
        <section className="overflow-x-auto border border-[#eee]">
          <table className="w-full min-w-[700px] border-collapse text-left text-xs">
            <thead>
              <tr className="h-8 border-b border-[#eee] bg-[#f3f3f3] uppercase text-[#888] font-normal">
                <th className="px-3 py-1 font-semibold">DRIVER ID</th>
                <th className="px-3 py-1 font-semibold">NAME</th>
                <th className="px-3 py-1 font-semibold">EMAIL</th>
                <th className="px-3 py-1 font-semibold">PHONE</th>
                <th className="px-3 py-1 font-semibold">ASSIGNED VEHICLE</th>
                <th className="px-3 py-1 font-semibold">STATUS</th>
                <th className="px-3 py-1 font-semibold">CURRENT ROUTE</th>
                <th className="px-3 py-1 text-center font-semibold">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver) => (
                <tr key={driver.id} className="h-9 border-b border-[#f0f0f0] even:bg-[#fafafa] hover:bg-[#f5f5f5]">
                  <td className="px-3 py-1 font-medium text-[#18205c]">{driver.id}</td>
                  <td className="px-3 py-1 font-semibold text-[#333]">{driver.name}</td>
                  <td className="px-3 py-1 text-[#666]">{driver.email}</td>
                  <td className="px-3 py-1 text-[#666]">{driver.phone}</td>
                  <td className="px-3 py-1 text-[#555] flex items-center gap-1">
                    <Truck size={12} className="text-[#888]" /> {driver.vehicle}
                  </td>
                  <td className="px-3 py-1">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[11px] font-semibold ${
                        driver.status === "En Route"
                          ? "bg-amber-100 text-amber-800"
                          : driver.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {driver.status}
                    </span>
                  </td>
                  <td className="px-3 py-1 text-[#666]">{driver.currentRoute}</td>
                  <td className="px-3 py-1 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveDriver(driver.id, driver.name)}
                      className="text-xs text-red-600 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {activeTab === "routes" && (
        <section className="space-y-3 text-xs">
          <div className="rounded border border-[#e5e5e5] bg-[#fafafa] p-4">
            <h3 className="mb-2 text-sm font-semibold text-[#333]">Live Team Dispatch Overview</h3>
            <p className="text-[#666]">
              All assigned drivers are syncing GPS waypoint data in real-time. Team Manager permits and route restrictions are broadcasted directly to drivers mobile units.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {drivers.filter((d) => d.status === "En Route").map((d) => (
              <div key={d.id} className="rounded border border-[#e0e0e0] bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#f0f0f0] pb-2">
                  <span className="font-bold text-[#333]">{d.name} ({d.id})</span>
                  <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">EN ROUTE</span>
                </div>
                <div className="mt-2 space-y-1 text-[#666]">
                  <p><strong>Assigned Vehicle:</strong> {d.vehicle}</p>
                  <p><strong>Active Route:</strong> {d.currentRoute}</p>
                  <p><strong>GPS Sync Status:</strong> <span className="text-green-600 font-semibold">Live (0.4s ago)</span></p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Add Driver Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded bg-white p-5 shadow-xl">
            <h2 className="mb-2 text-base font-bold text-[#222]">Add Team Driver</h2>
            <form onSubmit={handleAddDriver} className="space-y-3 text-xs">
              <div>
                <label className="mb-1 block font-semibold text-[#444]">Driver Full Name *</label>
                <input
                  type="text"
                  required
                  value={newDriver.name}
                  onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                  placeholder="e.g. Samuel Green"
                  className="h-8 w-full rounded border border-[#ccc] px-2 outline-none focus:border-[#ff823d]"
                />
              </div>
              <div>
                <label className="mb-1 block font-semibold text-[#444]">Driver Email *</label>
                <input
                  type="email"
                  required
                  value={newDriver.email}
                  onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })}
                  placeholder="e.g. sgreen@mercerfreight.com"
                  className="h-8 w-full rounded border border-[#ccc] px-2 outline-none focus:border-[#ff823d]"
                />
              </div>
              <div>
                <label className="mb-1 block font-semibold text-[#444]">Phone</label>
                <input
                  type="text"
                  value={newDriver.phone}
                  onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                  placeholder="(555) 000-0000"
                  className="h-8 w-full rounded border border-[#ccc] px-2 outline-none focus:border-[#ff823d]"
                />
              </div>
              <div>
                <label className="mb-1 block font-semibold text-[#444]">Assigned Vehicle / Unit</label>
                <input
                  type="text"
                  value={newDriver.vehicle}
                  onChange={(e) => setNewDriver({ ...newDriver, vehicle: e.target.value })}
                  placeholder="e.g. Semi-Truck #109"
                  className="h-8 w-full rounded border border-[#ccc] px-2 outline-none focus:border-[#ff823d]"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="rounded border border-[#ccc] px-3 py-1.5 text-xs text-[#666] hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-[#ff823d] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#e06d2c] cursor-pointer"
                >
                  Add Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagerDashboard;
