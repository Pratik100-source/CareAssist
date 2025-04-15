import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";

const ProtectedRoute = ({ allowedRole }) => {
  const user = useSelector((state) => state.user);
  console.log("ProtectedRoute - user:", user, "allowedRole:", allowedRole);
  if (!user.userType) {
    console.log("Redirecting to / - no user");
    return <Navigate to="/" replace />;
  }
  const userType = user?.userType?.toLowerCase() || "";

  if(allowedRole)
  if (userType && userType !== allowedRole) {
    
    if(userType==="admin"){
      return <Navigate to={`/${userType}dashboard`} replace />;
    }
    else{
      return <Navigate to={`/${userType}Home`} replace />;
    }
   
  }
  console.log("Rendering Outlet for:", allowedRole);
  return <Outlet />;
};

ProtectedRoute.propTypes = {
  allowedRole: PropTypes.string.isRequired,
};

export default ProtectedRoute;