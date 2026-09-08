import React, { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router'
import Sidebar from '../components/sidebar/Sidebar'
import Header from '../components/header/Header'

const breadcrumbMap = {
  '/dashboard': ['Home'],
  '/dashboard/admin-user-list': ['Home', 'Admin Users & Permissions', 'ADMIN USER LIST'],
  '/dashboard/add-user': ['Home', 'Admin Users & Permissions', 'ADD USER'],
  '/dashboard/audit-log': ['Home', 'Security, Logging & Compliance', 'AUDIT LOGS'],
  '/dashboard/data-protection': ['Home', 'Security, Logging & Compliance', 'DATA PROTECTION'],
  '/dashboard/user-resources': ['Home', 'Support Tools', 'USER RESOURCES'],
  '/dashboard/staff-resources': ['Home', 'Support Tools', 'STAFF RESOURCES'],
  '/dashboard/support-tickets': ['Home', 'Support Tools', 'SUPPORT TICKETS'],
  '/dashboard/create-ticket': ['Home', 'Support Tools', 'CREATE TICKET'],
  '/dashboard/revenue-metrics': ['Home', 'Reporting & Analytics', 'REVENUE METRICS'],
  '/dashboard/team-users': ['Home', 'User Account Management', 'TEAM USERS'],
  '/dashboard/single-user': ['Home', 'User Account Management', 'SINGLE USER'],
  '/dashboard/fleet-user': ['Home', 'User Account Management', 'FLEET USERS'],
  '/dashboard/subscription-payment': ['Home', 'Income & Expenses', 'SUBSCRIPTION PAYMENTS'],
  '/dashboard/fleet-payments': ['Home', 'Income & Expenses', 'FLEET PAYMENTS'],
  '/dashboard/expenses': ['Home', 'Income & Expenses', 'EXPENSES'],
};

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const breadcrumb = location.pathname.startsWith('/dashboard/edit-user/')
    ? ['Home', 'Admin Users & Permissions', 'ADMIN USER EDIT']
    : breadcrumbMap[location.pathname] || ['Home'];

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Full-width header row */}
      <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center bg-[#0b0d2d] md:h-[72px]">
          <Header onMenuClick={handleMenuClick} />
      </header>

      <div className="fixed inset-x-0 top-16 z-40 flex h-9 items-center bg-[#ff823d] px-9  text-white md:top-[72px]">
        {breadcrumb.map((item, index) => (
          <React.Fragment key={item}>
            {index > 0 && <span className="mx-2">&gt;</span>}
            {index === 0 ? (
              <Link to="/dashboard" className="text-white hover:underline">
                {item}
              </Link>
            ) : (
              <span className={index === breadcrumb.length - 1 ? 'text-black' : ''}>
                {item}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Sidebar and page content row */}
      <div className="min-h-screen pt-[100px] md:pl-60 md:pt-[108px]">
        {sidebarOpen && (
          <div
            className="fixed inset-0 top-[100px] z-30 bg-black/40 md:hidden"
            onClick={handleCloseSidebar}
          />
        )}

        <aside
          className={`fixed top-[100px] bottom-0 left-0 z-40 w-60 transform overflow-y-auto border-r border-gray-200 bg-white px-4 py-5 transition-transform duration-300 ease-in-out md:top-[108px] md:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />
        </aside>

        <main className="min-h-[calc(100vh-100px)] min-w-0 overflow-x-hidden p-4 md:min-h-[calc(100vh-108px)] md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout