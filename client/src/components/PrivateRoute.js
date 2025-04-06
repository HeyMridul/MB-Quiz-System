"use client"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

function PrivateRoute({ children }) {
  const { currentUser } = useAuth()
  const location = useLocation()

  if (!currentUser) {
    // Redirect to login page
    return <Navigate to="/auth/student/login" state={{ from: location }} replace />
  }

  // If the user is an admin trying to access student routes, redirect to admin dashboard
  if (currentUser.role === "admin") {
    return <Navigate to="/admin" replace />
  }

  return children
}

export default PrivateRoute

