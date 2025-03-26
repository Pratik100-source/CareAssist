import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";

const ProtectedRoute = ({ allowedRole }) => {
  const user = useSelector((state) => state.user);
  console.log("ProtectedRoute - user:", user, "allowedRole:", allowedRole);
  if (!user) {
    console.log("Redirecting to / - no user");
    return <Navigate to="/" replace />;
  }
  const userType = user?.userType?.toLowerCase() || "";
  if (userType && userType !== allowedRole) {
    console.log(`Redirecting to /${userType}Home - mismatch: ${userType} !== ${allowedRole}`);
    return <Navigate to={`/${userType}Home`} replace />;
  }
  console.log("Rendering Outlet for:", allowedRole);
  return <Outlet />;
};

ProtectedRoute.propTypes = {
  allowedRole: PropTypes.string.isRequired,
};

export default ProtectedRoute;
