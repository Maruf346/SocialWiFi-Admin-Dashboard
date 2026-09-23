import { Construction, Sparkles, ShieldCheck, Users, Truck } from "lucide-react";

const FleetUser = () => {
  return (
    <div className="min-h-full bg-white px-2 py-3 text-[13px] text-[#555] md:px-5 md:py-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-2 text-xl font-normal text-[#999]">Manage fleet users</h1>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#ff823d]">
          <span className="flex h-2 w-2 rounded-full bg-[#ff823d] animate-pulse"></span>
          <span>Module Under Active Development</span>
        </div>
      </div>

      {/* Main Page Area */}
      <div className="py-8 md:py-14">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded bg-[#fff3eb] px-3.5 py-1.5 text-xs font-semibold text-[#ff823d]">
            {/* <Sparkles size={15} /> */}
            <span>Coming Soon</span>
          </div>

          <h2 className="mb-3 text-2xl md:text-3xl font-bold text-[#1d2464]">
            Fleet Management System
          </h2>

          <p className="mb-8 text-sm md:text-base leading-relaxed text-[#666]">
            The dedicated Fleet Management module is currently under development. This section will empower administrators to oversee enterprise-tier fleet accounts, configure multi-vehicle dispatching, manage bulk driver licensing, and monitor route compliance in real-time.
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-2">
            <div className="rounded bg-[#f9f9f9] p-4 text-left">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded bg-white text-[#ff823d] shadow-xs">
                <Truck size={20} />
              </div>
              <h3 className="mb-1 text-xs font-bold text-[#222]">Enterprise Fleets</h3>
              <p className="text-xs text-[#777]">
                Unified tracking for multi-truck fleets with custom route navigation configurations.
              </p>
            </div>

            <div className="rounded bg-[#f9f9f9] p-4 text-left">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded bg-white text-[#ff823d] shadow-xs">
                <Users size={20} />
              </div>
              <h3 className="mb-1 text-xs font-bold text-[#222]">Bulk Driver Provisioning</h3>
              <p className="text-xs text-[#777]">
                Easily allocate licenses and provision driver rosters with bulk CSV imports and SSO.
              </p>
            </div>

            <div className="rounded bg-[#f9f9f9] p-4 text-left">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded bg-white text-[#ff823d] shadow-xs">
                <ShieldCheck size={20} />
              </div>
              <h3 className="mb-1 text-xs font-bold text-[#222]">Compliance & Telematics</h3>
              <p className="text-xs text-[#777]">
                Comprehensive oversized load permit compliance reports and history tracking.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FleetUser;
