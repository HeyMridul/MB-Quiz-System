// This is a mock service that would be replaced with actual database calls
// in a production environment

// Mock data - using localStorage to persist data between sessions
const getStoredData = (key, defaultValue) => {
  if (typeof window !== "undefined") {
    const storedData = localStorage.getItem(key)
    return storedData ? JSON.parse(storedData) : defaultValue
  }
  return defaultValue
}

const setStoredData = (key, data) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(data))
  }
}

// Initialize with default data if not already in localStorage
const defaultQuizzes = [
  {
    id: "1",
    title: "Introduction to React",
    description: "Test your knowledge of React fundamentals",
    timeLimit: 30,
    isActive: true,
    questionCount: 3,
    questions: [
      {
        id: "q1",
        text: "What is React?",
        image: "",
        options: [
          { id: "o1", text: "A JavaScript library for building user interfaces", isCorrect: true },
          { id: "o2", text: "A programming language", isCorrect: false },
          { id: "o3", text: "A database management system", isCorrect: false },
          { id: "o4", text: "A server-side framework", isCorrect: false },
        ],
      },
      {
        id: "q2",
        text: "Which of the following is used to pass data to a component from outside?",
        image: "",
        options: [
          { id: "o5", text: "setState", isCorrect: false },
          { id: "o6", text: "render with arguments", isCorrect: false },
          { id: "o7", text: "props", isCorrect: true },
          { id: "o8", text: "PropTypes", isCorrect: false },
        ],
      },
      {
        id: "q3",
        text: "What is JSX?",
        image: "",
        options: [
          { id: "o9", text: "A JavaScript extension that allows writing HTML in React", isCorrect: true },
          { id: "o10", text: "A JavaScript library", isCorrect: false },
          { id: "o11", text: "A JavaScript framework", isCorrect: false },
          { id: "o12", text: "A JavaScript compiler", isCorrect: false },
        ],
      },
    ],
  },
  {
    id: "2",
    title: "JavaScript Basics",
    description: "Test your knowledge of JavaScript fundamentals",
    timeLimit: 20,
    isActive: true,
    questionCount: 3,
    questions: [
      {
        id: "q4",
        text: "Which of the following is not a JavaScript data type?",
        image: "",
        options: [
          { id: "o13", text: "String", isCorrect: false },
          { id: "o14", text: "Number", isCorrect: false },
          { id: "o15", text: "Boolean", isCorrect: false },
          { id: "o16", text: "Character", isCorrect: true },
        ],
      },
      {
        id: "q5",
        text: "What does the '===' operator do?",
        image: "",
        options: [
          { id: "o17", text: "Checks for equality of value only", isCorrect: false },
          { id: "o18", text: "Checks for equality of value and type", isCorrect: true },
          { id: "o19", text: "Assigns a value to a variable", isCorrect: false },
          { id: "o20", text: "Checks if a variable exists", isCorrect: false },
        ],
      },
      {
        id: "q6",
        text: "Which method is used to add an element at the end of an array?",
        image: "",
        options: [
          { id: "o21", text: "push()", isCorrect: true },
          { id: "o22", text: "pop()", isCorrect: false },
          { id: "o23", text: "unshift()", isCorrect: false },
          { id: "o24", text: "shift()", isCorrect: false },
        ],
      },
    ],
  },
]

const defaultStudents = [
  { id: "s1", name: "John Doe", email: "student@example.com" },
  { id: "s2", name: "Jane Smith", email: "test@example.com" },
  { id: "s3", name: "Student User", email: "student.google@gmail.com" },
]

const defaultResults = [
  {
    id: "r1",
    studentId: "s1",
    studentName: "John Doe",
    quizId: "1",
    quizTitle: "Introduction to React",
    score: 8,
    totalQuestions: 10,
    completedAt: "2023-06-15T10:30:00Z",
    timeTaken: 25,
  },
  {
    id: "r2",
    studentId: "s2",
    studentName: "Jane Smith",
    quizId: "2",
    quizTitle: "JavaScript Basics",
    score: 7,
    totalQuestions: 8,
    completedAt: "2023-06-16T14:20:00Z",
    timeTaken: 18,
  },
]

// Initialize data from localStorage or use defaults
let quizzes = getStoredData("quizzes", defaultQuizzes)
let students = getStoredData("students", defaultStudents)
let results = getStoredData("results", defaultResults)

// Helper function to get student by email
function getStudentByEmail(email) {
  const student = students.find((s) => s.email === email)
  if (student) return student

  // If student doesn't exist, create a new one
  const newStudent = {
    id: `s${Date.now()}`,
    name: email.split("@")[0],
    email,
  }
  students.push(newStudent)
  setStoredData("students", students)
  return newStudent
}

// Service functions
export async function getAvailableQuizzes() {
  // Ensure we have the latest data
  quizzes = getStoredData("quizzes", defaultQuizzes)

  // Return active quizzes
  return quizzes
    .filter((quiz) => quiz.isActive)
    .map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      timeLimit: quiz.timeLimit,
      questionCount: quiz.questions.length,
    }))
}

export async function getAllQuizzes() {
  // Ensure we have the latest data
  quizzes = getStoredData("quizzes", defaultQuizzes)

  return quizzes.map((quiz) => ({
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    timeLimit: quiz.timeLimit,
    isActive: quiz.isActive,
    questionCount: quiz.questions.length,
  }))
}

export async function getQuizById(id) {
  // Ensure we have the latest data
  quizzes = getStoredData("quizzes", defaultQuizzes)

  const quiz = quizzes.find((quiz) => quiz.id === id)
  if (!quiz) return null

  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    timeLimit: quiz.timeLimit,
    questions: quiz.questions,
  }
}

export async function getStudentResults(quizId, search) {
  // Ensure we have the latest data
  results = getStoredData("results", defaultResults)

  let filteredResults = [...results]

  if (quizId) {
    filteredResults = filteredResults.filter((result) => result.quizId === quizId)
  }

  if (search) {
    const searchLower = search.toLowerCase()
    filteredResults = filteredResults.filter(
      (result) =>
        result.studentName.toLowerCase().includes(searchLower) || result.quizTitle.toLowerCase().includes(searchLower),
    )
  }

  return filteredResults
}

export async function getLeaderboard() {
  // Ensure we have the latest data
  results = getStoredData("results", defaultResults)

  // Sort by score percentage in descending order
  return [...results].sort((a, b) => {
    const aPercentage = (a.score / a.totalQuestions) * 100
    const bPercentage = (b.score / b.totalQuestions) * 100
    return bPercentage - aPercentage
  })
}

export async function getAdminDashboardStats() {
  // Ensure we have the latest data
  quizzes = getStoredData("quizzes", defaultQuizzes)
  students = getStoredData("students", defaultStudents)
  results = getStoredData("results", defaultResults)

  // Calculate various statistics for the admin dashboard
  const totalQuizzes = quizzes.length
  const totalStudents = students.length
  const quizzesTaken = results.length

  // Calculate average score
  const totalPercentage = results.reduce((sum, result) => {
    return sum + (result.score / result.totalQuestions) * 100
  }, 0)
  const averageScore = results.length > 0 ? Math.round(totalPercentage / results.length) : 0

  // Recent submissions (last 5)
  const recentSubmissions = [...results]
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, 5)

  // Quiz performance
  const quizPerformance = quizzes.map((quiz) => {
    const quizResults = results.filter((r) => r.quizId === quiz.id)
    const attemptCount = quizResults.length

    if (attemptCount === 0) {
      return {
        id: quiz.id,
        title: quiz.title,
        attemptCount: 0,
        averageScore: 0,
        passRate: 0,
      }
    }

    const totalScore = quizResults.reduce((sum, r) => sum + (r.score / r.totalQuestions) * 100, 0)
    const averageScore = Math.round(totalScore / attemptCount)

    const passCount = quizResults.filter((r) => r.score / r.totalQuestions >= 0.6).length
    const passRate = Math.round((passCount / attemptCount) * 100)

    return {
      id: quiz.id,
      title: quiz.title,
      attemptCount,
      averageScore,
      passRate,
    }
  })

  return {
    totalQuizzes,
    totalStudents,
    quizzesTaken,
    averageScore,
    recentSubmissions,
    quizPerformance,
  }
}

// Add a function to create a quiz
export async function createQuizInDb(quizData) {
  // Ensure we have the latest data
  quizzes = getStoredData("quizzes", defaultQuizzes)

  const newId = `q${Date.now()}`

  // Process questions to ensure they have IDs
  const questions = quizData.questions.map((q, qIndex) => {
    return {
      id: `q${newId}-${qIndex}`,
      text: q.text,
      image: q.image || "",
      options: q.options.map((opt, optIndex) => ({
        id: `o${newId}-${qIndex}-${optIndex}`,
        text: opt.text,
        isCorrect: opt.isCorrect,
      })),
    }
  })

  const newQuiz = {
    id: newId,
    title: quizData.title,
    description: quizData.description,
    timeLimit: quizData.timeLimit,
    isActive: quizData.isActive,
    questionCount: questions.length,
    questions: questions,
  }

  quizzes.push(newQuiz)
  setStoredData("quizzes", quizzes)

  return {
    success: true,
    quizId: newId,
  }
}

// Add a function to submit a quiz and calculate score
export async function submitQuizToDb(data) {
  // Ensure we have the latest data
  quizzes = getStoredData("quizzes", defaultQuizzes)
  results = getStoredData("results", defaultResults)

  const { quizId, answers, userEmail, timeTaken } = data

  // Get the quiz
  const quiz = quizzes.find((q) => q.id === quizId)
  if (!quiz) {
    throw new Error("Quiz not found")
  }

  // Calculate score
  let score = 0
  answers.forEach((answer) => {
    const question = quiz.questions.find((q) => q.id === answer.questionId)
    if (!question) return

    const correctOption = question.options.find((opt) => opt.isCorrect)
    if (correctOption && correctOption.id === answer.answer) {
      score++
    }
  })

  // Get student info
  const student = getStudentByEmail(userEmail)

  // Create result
  const newResult = {
    id: `r${Date.now()}`,
    studentId: student.id,
    studentName: student.name,
    quizId: quiz.id,
    quizTitle: quiz.title,
    score: score,
    totalQuestions: quiz.questions.length,
    completedAt: new Date().toISOString(),
    timeTaken: timeTaken || Math.round(quiz.timeLimit / 2), // If not provided, estimate
  }

  // Add to results
  results.push(newResult)
  setStoredData("results", results)

  return {
    success: true,
    resultId: newResult.id,
    score: score,
    totalQuestions: quiz.questions.length,
    percentage: Math.round((score / quiz.questions.length) * 100),
  }
}

// Get a specific result
export async function getResultById(resultId) {
  // Ensure we have the latest data
  results = getStoredData("results", defaultResults)

  return results.find((r) => r.id === resultId)
}

// Get student results by email
export async function getStudentResultsByEmail(email) {
  // Ensure we have the latest data
  results = getStoredData("results", defaultResults)

  const student = getStudentByEmail(email)
  return results.filter((r) => r.studentId === student.id)
}

// Delete a quiz
export async function deleteQuiz(quizId) {
  // Ensure we have the latest data
  quizzes = getStoredData("quizzes", defaultQuizzes)

  const updatedQuizzes = quizzes.filter((quiz) => quiz.id !== quizId)
  setStoredData("quizzes", updatedQuizzes)
  quizzes = updatedQuizzes

  return { success: true }
}

