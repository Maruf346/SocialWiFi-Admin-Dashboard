import { createBrowserRouter } from "react-router";
import AuthLayout from "../layout/AuthLayout";
import ErrorPage from "../pages/ErrorPage";
// authentication 
import Login from "../pages/auth/Login";
import Mfa from "../pages/auth/Mfa";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
// dashboard layout 
import DashboardLayout from "../layout/DashboardLayout";
// home page 
import Dashboard from "../pages/home/Dashboard";
// SECURITY, LOGGING & COMPLIANCE 
import DataProtection from "../pages/data protection/DataProtection";
import AuditLog from "../pages/audit log/AuditLog";
// admin user and permission 
import AdminUserList from "../pages/admin user and permission/amdin user list/AdminUserList";
import AddUser from "../pages/admin user and permission/add user/AddUser";
import EditUser from "../pages/admin user and permission/edit user/EditUser";

// support tools 
import UserResource from "../pages/support tools/user resource/UserResource";
import SupportTicket from "../pages/support tools/support ticket/SupportTicket";
import TicketDetails from "../pages/support tools/support ticket/TicketDetails";
import CreateTicket from "../pages/support tools/support ticket/CreateTicket";
import StaffResource from "../pages/support tools/staff resource/StaffResource";
// REPORTING & ANALYTICS
import RevenueMetrics from "../pages/reporting and analytics/RevenueMetrics";
// USER ACCOUNT MANAGEMENT
import TeamUsers from "../pages/user account manage/team user/TeamUsers";
import TeamUserRouteHistory from "../pages/user account manage/team user/TeamUserRouteHistory";
import SingleUser from "../pages/user account manage/single user/SingleUser";
import SingleUserRouteHistory from "../pages/user account manage/single user/SingleUserRouteHistory";
import FleetUser from "../pages/user account manage/fleet user/FleetUser";
import FleetUserRouteHistory from "../pages/user account manage/fleet user/FleetUserRouteHistory";
// INCOME & EXPENSES
import SubscriptionPayment from "../pages/income and expenses/subscription payment/SubscriptionPayment";
import FleetPayments from "../pages/income and expenses/fleet payments/FleetPayments";
import Expenses from "../pages/income and expenses/expenses/Expenses";
import VerifyOtp from "../pages/auth/VerifyOtp";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Login /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "otp", element: <Mfa /> },
      { path: "verify-otp", element: <VerifyOtp /> },
      { path: "reset-password", element: <ResetPassword /> },
    ],
  },
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      {path: "admin-user-list", element: <AdminUserList />},
        {path: "add-user", element: <AddUser />},
        {path: "edit-user/:userId", element: <EditUser />},
        {path: "audit-log", element: <AuditLog />},
        {path: "user-resources", element: <UserResource />},
        {path: "support-tickets", element: <SupportTicket />},
        {path: "support-tickets/:ticketId", element: <TicketDetails />},
        {path: "create-ticket", element: <CreateTicket />},
        {path: "staff-resources", element: <StaffResource />},
        {path: "revenue-metrics", element: <RevenueMetrics />},
        {path: "team-users", element: <TeamUsers />},
        {path: "team-route-history/:userEmail", element: <TeamUserRouteHistory />},
        {path: "single-user", element: <SingleUser />},
        {path: "single-route-history/:userEmail", element: <SingleUserRouteHistory />},
        {path: "fleet-user", element: <FleetUser />},
        {path: "fleet-route-history/:userEmail", element: <FleetUserRouteHistory />},
        {path: "data-protection", element: <DataProtection />},
        {path: "subscription-payment", element: <SubscriptionPayment />},
        {path: "fleet-payments", element: <FleetPayments />},
        {path: "expenses", element: <Expenses />},

        // Add more dashboard routes here
    ],
  }
]);
