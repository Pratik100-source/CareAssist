import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { authService } from "./services/authService";

const ProtectedRoute = ({ allowedRole }) => {
  const user = useSelector((state) => state.user);
  
  // Check if user is authenticated
  if (!user.userType || !authService.isAuthenticated()) {
    console.log("Redirecting to / - not authenticated");
    return <Navigate to="/" replace />;
  }
  
  const userType = user?.userType?.toLowerCase() || "";

  if(allowedRole) {
    if (userType && userType !== allowedRole) {
      if(userType==="admin"){
        return <Navigate to={`/${userType}dashboard`} replace />;
      }
      else{
        return <Navigate to={`/${userType}Home`} replace />;
      }
    }
  }
  
  return <Outlet />;
};

ProtectedRoute.propTypes = {
  allowedRole: PropTypes.string.isRequired,
};

export default ProtectedRoute;