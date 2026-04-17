import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children }) => {

  const token = localStorage.getItem("authToken");

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
};