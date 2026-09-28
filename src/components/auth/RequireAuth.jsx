import { Navigate, useLocation } from "react-router";
import { authStorage } from "../../utils/authStorage";

const RequireAuth = ({ children }) => {
  const location = useLocation();

  if (!authStorage.isAuthenticated()) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
};

export default RequireAuth;
