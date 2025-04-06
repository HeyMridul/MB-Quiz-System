const express = require("express")
const { ObjectId } = require("mongodb")
const { verifyToken, isAdmin } = require("../middleware/auth")

const router = express.Router()

// Get all quizzes (admin only)
router.get("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const db = req.app.locals.db
    const quizzes = await db.collection("quizzes").find().project({ questions: 0 }).toArray()

    res.json(quizzes)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// Get available quizzes for students
router.get("/available", verifyToken, async (req, res) => {
  try {
    const db = req.app.locals.db
    const quizzes = await db.collection("quizzes").find({ isActive: true }).project({ questions: 0 }).toArray()

    res.json(quizzes)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// Get quiz by ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const db = req.app.locals.db
    const quiz = await db.collection("quizzes").findOne({ _id: new ObjectId(req.params.id) })

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" })
    }

    // If student, check if quiz is active
    if (req.user.role === "student" && !quiz.isActive) {
      return res.status(403).json({ message: "Quiz is not active" })
    }

    res.json(quiz)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// Create quiz (admin only)
router.post("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const db = req.app.locals.db
    const { title, description, timeLimit, isActive, questions } = req.body

    const quiz = {
      title,
      description,
      timeLimit,
      isActive,
      questions,
      createdBy: new ObjectId(req.user.id),
      createdAt: new Date(),
    }

    const result = await db.collection("quizzes").insertOne(quiz)

    res.status(201).json({
      success: true,
      quizId: result.insertedId,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// Update quiz (admin only)
router.put("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const db = req.app.locals.db
    const quizId = new ObjectId(req.params.id)

    const quiz = await db.collection("quizzes").findOne({ _id: quizId })

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" })
    }

    const { title, description, timeLimit, isActive, questions } = req.body

    // Update fields
    const updateData = {
      $set: {
        title: title || quiz.title,
        description: description || quiz.description,
        timeLimit: timeLimit || quiz.timeLimit,
        isActive: isActive !== undefined ? isActive : quiz.isActive,
        questions: questions || quiz.questions,
      },
    }

    await db.collection("quizzes").updateOne({ _id: quizId }, updateData)

    const updatedQuiz = await db.collection("quizzes").findOne({ _id: quizId })

    res.json({
      success: true,
      quiz: updatedQuiz,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete quiz (admin only)
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const db = req.app.locals.db
    const quizId = new ObjectId(req.params.id)

    const quiz = await db.collection("quizzes").findOne({ _id: quizId })

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" })
    }

    await db.collection("quizzes").deleteOne({ _id: quizId })

    res.json({
      success: true,
      message: "Quiz deleted",
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router

