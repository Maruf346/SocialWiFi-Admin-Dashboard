import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router";
import { authApi } from "../../api/authApi";
import { authStorage } from "../../utils/authStorage";

const RequireAuth = ({ children }) => {
  const location = useLocation();
  const [isCheckingProfile, setIsCheckingProfile] = useState(() => authStorage.isAuthenticated());
  const [isAuthenticated, setIsAuthenticated] = useState(() => authStorage.isAuthenticated());

  useEffect(() => {
    if (!authStorage.isAuthenticated()) {
      setIsAuthenticated(false);
      setIsCheckingProfile(false);
      return;
    }

    let isActive = true;

    const refreshProfile = async () => {
      try {
        await authApi.getCurrentUser();
        if (isActive) setIsAuthenticated(true);
      } catch (error) {
        if (error.status === 401 || error.status === 403) {
          authStorage.clearSession();
          if (isActive) setIsAuthenticated(false);
        } else if (isActive) {
          setIsAuthenticated(authStorage.isAuthenticated());
        }
      } finally {
        if (isActive) setIsCheckingProfile(false);
      }
    };

    refreshProfile();

    return () => {
      isActive = false;
    };
  }, []);

  if (isCheckingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-[#777]">
        Loading dashboard...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
};

export default RequireAuth;