"use server"

import { createQuizInDb, submitQuizToDb, deleteQuiz } from "./quiz-service"

// This file contains server actions for handling form submissions

export async function submitQuiz(data) {
  try {
    // Get user email from the session or localStorage
    // In a real app, this would come from the session
    const userEmail = data.userEmail || "student@example.com"

    // Submit the quiz and calculate score
    const result = await submitQuizToDb({
      quizId: data.quizId,
      answers: data.answers,
      userEmail: userEmail,
      timeTaken: data.timeTaken,
    })

    return result
  } catch (error) {
    console.error("Failed to submit quiz:", error)
    throw error
  }
}

export async function createQuiz(data) {
  try {
    // Create the quiz in the database
    const result = await createQuizInDb(data)

    return result
  } catch (error) {
    console.error("Failed to create quiz:", error)
    throw error
  }
}

export async function deleteQuizAction(quizId) {
  try {
    // Delete the quiz from the database
    const result = await deleteQuiz(quizId)

    return result
  } catch (error) {
    console.error("Failed to delete quiz:", error)
    throw error
  }
}

