import axios from "axios"
import { API_URL } from "../config"

// Create an axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
})

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Quiz related API calls
export const quizApi = {
  getAvailableQuizzes: () => api.get("/quizzes/available"),
  getAllQuizzes: () => api.get("/quizzes"),
  getQuizById: (id) => api.get(`/quizzes/${id}`),
  createQuiz: (quizData) => api.post("/quizzes", quizData),
  updateQuiz: (id, quizData) => api.put(`/quizzes/${id}`, quizData),
  deleteQuiz: (id) => api.delete(`/quizzes/${id}`),
  submitQuiz: (quizData) => api.post("/quiz-results", quizData),
}

// Results related API calls
export const resultsApi = {
  getStudentResults: (email) => api.get("/quiz-results/student", { params: { email } }),
  getAllResults: () => api.get("/quiz-results"),
  getLeaderboard: () => api.get("/quiz-results/leaderboard"),
  getStudentResultsByQuiz: (quizId) => api.get(`/quiz-results/quiz/${quizId}`),
  getResultById: (resultId) => api.get(`/quiz-results/${resultId}`),
}

// Admin analytics API calls
export const adminApi = {
  getDashboardStats: () => api.get("/admin/dashboard-stats"),
}

export default api

