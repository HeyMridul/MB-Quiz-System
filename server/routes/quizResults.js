const express = require("express")
const { ObjectId } = require("mongodb")
const { verifyToken, isAdmin } = require("../middleware/auth")

const router = express.Router()

// Submit a quiz result
router.post("/", verifyToken, async (req, res) => {
  try {
    const db = req.app.locals.db
    const { quizId, answers, timeTaken } = req.body

    // Get the quiz
    const quiz = await db.collection("quizzes").findOne({ _id: new ObjectId(quizId) })
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" })
    }

    // Calculate score
    let score = 0

    answers.forEach((answer) => {
      const question = quiz.questions.find((q) => q._id.toString() === answer.questionId)
      if (!question) return

      const correctOption = question.options.find((opt) => opt.isCorrect)
      if (correctOption && correctOption._id.toString() === answer.answer) {
        score++
      }
    })

    // Create new result
    const quizResult = {
      student: new ObjectId(req.user.id),
      quiz: new ObjectId(quizId),
      answers,
      score,
      totalQuestions: quiz.questions.length,
      timeTaken,
      completedAt: new Date(),
    }

    const result = await db.collection("quizResults").insertOne(quizResult)

    res.status(201).json({
      success: true,
      resultId: result.insertedId,
      score,
      totalQuestions: quiz.questions.length,
      percentage: Math.round((score / quiz.questions.length) * 100),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// Get all results (admin only)
router.get("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const db = req.app.locals.db

    const results = await db
      .collection("quizResults")
      .aggregate([
        {
          $lookup: {
            from: "quizzes",
            localField: "quiz",
            foreignField: "_id",
            as: "quizData",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "student",
            foreignField: "_id",
            as: "studentData",
          },
        },
        {
          $unwind: "$quizData",
        },
        {
          $unwind: "$studentData",
        },
        {
          $project: {
            _id: 1,
            studentId: "$student",
            studentName: { $concat: ["$studentData.firstName", " ", "$studentData.lastName"] },
            quizId: "$quiz",
            quizTitle: "$quizData.title",
            score: 1,
            totalQuestions: 1,
            completedAt: 1,
            timeTaken: 1,
          },
        },
        {
          $sort: { completedAt: -1 },
        },
      ])
      .toArray()

    res.json(results)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// Get results for current student
router.get("/student", verifyToken, async (req, res) => {
  try {
    const db = req.app.locals.db

    const results = await db
      .collection("quizResults")
      .aggregate([
        {
          $match: { student: new ObjectId(req.user.id) },
        },
        {
          $lookup: {
            from: "quizzes",
            localField: "quiz",
            foreignField: "_id",
            as: "quizData",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "student",
            foreignField: "_id",
            as: "studentData",
          },
        },
        {
          $unwind: "$quizData",
        },
        {
          $unwind: "$studentData",
        },
        {
          $project: {
            _id: 1,
            studentId: "$student",
            studentName: { $concat: ["$studentData.firstName", " ", "$studentData.lastName"] },
            quizId: "$quiz",
            quizTitle: "$quizData.title",
            score: 1,
            totalQuestions: 1,
            completedAt: 1,
            timeTaken: 1,
          },
        },
        {
          $sort: { completedAt: -1 },
        },
      ])
      .toArray()

    res.json(results)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// Get leaderboard
router.get("/leaderboard", async (req, res) => {
  try {
    const db = req.app.locals.db

    const results = await db
      .collection("quizResults")
      .aggregate([
        {
          $lookup: {
            from: "quizzes",
            localField: "quiz",
            foreignField: "_id",
            as: "quizData",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "student",
            foreignField: "_id",
            as: "studentData",
          },
        },
        {
          $unwind: "$quizData",
        },
        {
          $unwind: "$studentData",
        },
        {
          $project: {
            _id: 1,
            studentId: "$student",
            studentName: { $concat: ["$studentData.firstName", " ", "$studentData.lastName"] },
            quizId: "$quiz",
            quizTitle: "$quizData.title",
            score: 1,
            totalQuestions: 1,
            completedAt: 1,
          },
        },
        {
          $sort: { score: -1 },
        },
        {
          $limit: 20,
        },
      ])
      .toArray()

    res.json(results)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// Get results for a specific quiz (admin only)
router.get("/quiz/:quizId", verifyToken, isAdmin, async (req, res) => {
  try {
    const db = req.app.locals.db
    const quizId = new ObjectId(req.params.quizId)

    const results = await db
      .collection("quizResults")
      .aggregate([
        {
          $match: { quiz: quizId },
        },
        {
          $lookup: {
            from: "users",
            localField: "student",
            foreignField: "_id",
            as: "studentData",
          },
        },
        {
          $unwind: "$studentData",
        },
        {
          $project: {
            _id: 1,
            studentId: "$student",
            studentName: { $concat: ["$studentData.firstName", " ", "$studentData.lastName"] },
            email: "$studentData.email",
            quizId: "$quiz",
            score: 1,
            totalQuestions: 1,
            percentage: { $multiply: [{ $divide: ["$score", "$totalQuestions"] }, 100] },
            completedAt: 1,
            timeTaken: 1,
          },
        },
        {
          $sort: { completedAt: -1 },
        },
      ])
      .toArray()

    res.json(results)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// Get a specific result
router.get("/:resultId", verifyToken, async (req, res) => {
  try {
    const db = req.app.locals.db
    const resultId = new ObjectId(req.params.resultId)

    const result = await db
      .collection("quizResults")
      .aggregate([
        {
          $match: { _id: resultId },
        },
        {
          $lookup: {
            from: "quizzes",
            localField: "quiz",
            foreignField: "_id",
            as: "quizData",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "student",
            foreignField: "_id",
            as: "studentData",
          },
        },
        {
          $unwind: "$quizData",
        },
        {
          $unwind: "$studentData",
        },
        {
          $project: {
            _id: 1,
            studentName: { $concat: ["$studentData.firstName", " ", "$studentData.lastName"] },
            quizTitle: "$quizData.title",
            score: 1,
            totalQuestions: 1,
            answers: 1,
            completedAt: 1,
            timeTaken: 1,
          },
        },
      ])
      .next()

    if (!result) {
      return res.status(404).json({ message: "Result not found" })
    }

    // Check if user is authorized to view this result
    if (req.user.role !== "admin" && result.student.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to view this result" })
    }

    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router

