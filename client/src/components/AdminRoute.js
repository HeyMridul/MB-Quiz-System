"use client"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

function AdminRoute({ children }) {
  const { currentUser } = useAuth()
  const location = useLocation()

  if (!currentUser) {
    // Redirect to login page
    return <Navigate to="/auth/admin/login" state={{ from: location }} replace />
  }

  // If the user is not an admin, redirect to student dashboard
  if (currentUser.role !== "admin") {
    return <Navigate to="/student" replace />
  }

  return children
}

export default AdminRoute

