import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";

const ProtectedRoute = ({ allowedRole }) => {
  const user = useSelector((state) => state.user);

  if (!user) return <Navigate to="/" replace />;

  const userType = user?.userType?.toLowerCase() || "";
  if (userType && userType !== allowedRole) {
    return <Navigate to={`/${userType}Home`} replace />;
  }

  return <Outlet />;
};

ProtectedRoute.propTypes = {
  allowedRole: PropTypes.string.isRequired,
};

export default ProtectedRoute;
