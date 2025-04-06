"use client"

import { createContext, useState, useEffect, useContext } from "react"
import axios from "axios"
import { API_URL } from "../config"

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token")
        if (token) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
          const response = await axios.get(`${API_URL}/auth/verify`)
          if (response.data.user) {
            setCurrentUser(response.data.user)
          }
        }
      } catch (err) {
        console.error("Auth verification error:", err)
        localStorage.removeItem("token")
        delete axios.defaults.headers.common["Authorization"]
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Login function
  const login = async (email, password, role) => {
    try {
      setError("")
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
        role,
      })

      if (response.data.token) {
        localStorage.setItem("token", response.data.token)
        axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`
        setCurrentUser(response.data.user)
        return { success: true, user: response.data.user }
      } else {
        throw new Error("Invalid credentials")
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed")
      return { success: false, error: err.response?.data?.message || "Login failed" }
    }
  }

  // Google login
  const loginWithGoogle = async (role) => {
    try {
      setError("")
      // In a real application, this would redirect to Google OAuth
      // For this example, we'll simulate it with a direct API call
      const response = await axios.post(`${API_URL}/auth/google-login`, { role })

      if (response.data.token) {
        localStorage.setItem("token", response.data.token)
        axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`
        setCurrentUser(response.data.user)
        return { success: true, user: response.data.user }
      } else {
        throw new Error("Google login failed")
      }
    } catch (err) {
      setError(err.response?.data?.message || "Google login failed")
      return { success: false, error: err.response?.data?.message || "Google login failed" }
    }
  }

  // Signup function
  const signup = async (userData, role) => {
    try {
      setError("")
      const response = await axios.post(`${API_URL}/auth/register`, {
        ...userData,
        role,
      })

      if (response.data.success) {
        return { success: true }
      } else {
        throw new Error("Registration failed")
      }
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed")
      return { success: false, error: err.response?.data?.message || "Signup failed" }
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem("token")
    delete axios.defaults.headers.common["Authorization"]
    setCurrentUser(null)
  }

  const value = {
    currentUser,
    login,
    loginWithGoogle,
    signup,
    logout,
    error,
    loading,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}

