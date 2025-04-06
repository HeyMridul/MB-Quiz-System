const express = require("express")
const { ObjectId } = require("mongodb")
const { verifyToken, isAdmin } = require("../middleware/auth")

const router = express.Router()

// Get dashboard statistics for admin
router.get("/dashboard-stats", verifyToken, isAdmin, async (req, res) => {
  try {
    const db = req.app.locals.db

    // Get basic counts
    const totalQuizzes = await db.collection("quizzes").countDocuments()
    const totalStudents = await db.collection("users").countDocuments({ role: "student" })
    const quizzesTaken = await db.collection("quizResults").countDocuments()

    // Calculate average score
    const scoreResults = await db
      .collection("quizResults")
      .aggregate([
        {
          $group: {
            _id: null,
            totalScore: {
              $sum: {
                $multiply: [{ $divide: ["$score", "$totalQuestions"] }, 100],
              },
            },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray()

    const averageScore = scoreResults.length > 0 ? Math.round(scoreResults[0].totalScore / scoreResults[0].count) : 0

    // Get recent submissions
    const recentSubmissions = await db
      .collection("quizResults")
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "student",
            foreignField: "_id",
            as: "studentData",
          },
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
          $unwind: "$studentData",
        },
        {
          $unwind: "$quizData",
        },
        {
          $project: {
            _id: 1,
            studentName: { $concat: ["$studentData.firstName", " ", "$studentData.lastName"] },
            quizTitle: "$quizData.title",
            score: 1,
            totalQuestions: 1,
            completedAt: 1,
          },
        },
        {
          $sort: { completedAt: -1 },
        },
        {
          $limit: 5,
        },
      ])
      .toArray()

    // Get quiz performance
    const quizzes = await db.collection("quizzes").find().toArray()

    const quizPerformancePromises = quizzes.map(async (quiz) => {
      const results = await db.collection("quizResults").find({ quiz: quiz._id }).toArray()

      if (results.length === 0) {
        return {
          id: quiz._id,
          title: quiz.title,
          attemptCount: 0,
          averageScore: 0,
          passRate: 0,
        }
      }

      const attemptCount = results.length
      const totalPercentage = results.reduce((sum, result) => sum + (result.score / result.totalQuestions) * 100, 0)
      const averageScore = Math.round(totalPercentage / attemptCount)

      const passCount = results.filter((result) => result.score / result.totalQuestions >= 0.6).length
      const passRate = Math.round((passCount / attemptCount) * 100)

      return {
        id: quiz._id,
        title: quiz.title,
        attemptCount,
        averageScore,
        passRate,
      }
    })

    const quizPerformance = await Promise.all(quizPerformancePromises)

    res.json({
      totalQuizzes,
      totalStudents,
      quizzesTaken,
      averageScore,
      recentSubmissions,
      quizPerformance,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router

