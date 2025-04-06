import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import PrivateRoute from "./components/PrivateRoute"
import AdminRoute from "./components/AdminRoute"

// Pages
import HomePage from "./pages/HomePage"
import StudentLoginPage from "./pages/auth/StudentLoginPage"
import StudentSignupPage from "./pages/auth/StudentSignupPage"
import AdminLoginPage from "./pages/auth/AdminLoginPage"
import AdminSignupPage from "./pages/auth/AdminSignupPage"
import StudentDashboard from "./pages/student/StudentDashboard"
import StudentQuizPage from "./pages/student/StudentQuizPage"
import StudentResultsPage from "./pages/student/StudentResultsPage"
import StudentLeaderboardPage from "./pages/student/StudentLeaderboardPage"
import StudentAnalytics from "./pages/student/StudentAnalytics"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminQuizzesPage from "./pages/admin/AdminQuizzesPage"
import AdminCreateQuizPage from "./pages/admin/AdminCreateQuizPage"
import AdminStudentsPage from "./pages/admin/AdminStudentsPage"
import AdminAnalytics from "./pages/admin/AdminAnalytics"

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/auth/student/login" element={<StudentLoginPage />} />
          <Route path="/auth/student/signup" element={<StudentSignupPage />} />
          <Route path="/auth/admin/login" element={<AdminLoginPage />} />
          <Route path="/auth/admin/signup" element={<AdminSignupPage />} />

          {/* Protected Student Routes */}
          <Route
            path="/student"
            element={
              <PrivateRoute>
                <StudentDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/student/quiz/:id"
            element={
              <PrivateRoute>
                <StudentQuizPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/student/results"
            element={
              <PrivateRoute>
                <StudentResultsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/student/leaderboard"
            element={
              <PrivateRoute>
                <StudentLeaderboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/student/analytics"
            element={
              <PrivateRoute>
                <StudentAnalytics />
              </PrivateRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/quizzes"
            element={
              <AdminRoute>
                <AdminQuizzesPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/quizzes/create"
            element={
              <AdminRoute>
                <AdminCreateQuizPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/students"
            element={
              <AdminRoute>
                <AdminStudentsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <AdminRoute>
                <AdminAnalytics />
              </AdminRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

