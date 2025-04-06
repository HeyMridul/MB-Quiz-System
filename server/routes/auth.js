const express = require("express")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const { ObjectId } = require("mongodb")
const { verifyToken } = require("../middleware/auth")

const router = express.Router()

// Register new user
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, organization } = req.body
    const db = req.app.locals.db

    // Check if email already exists
    const existingUser = await db.collection("users").findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create new user
    const user = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      organization: organization || "",
      createdAt: new Date(),
    }

    await db.collection("users").insertOne(user)

    res.status(201).json({
      success: true,
      message: "User registered successfully",
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body
    const db = req.app.locals.db

    // Find user
    const user = await db.collection("users").findOne({ email })
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Check if role matches
    if (user.role !== role) {
      return res.status(401).json({
        message: role === "admin" ? "User is not an admin" : "User is not a student",
      })
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Create JWT token
    const token = jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" })

    // Return user data and token
    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// Google login (simplified for demo)
router.post("/google-login", async (req, res) => {
  try {
    const { role } = req.body
    const db = req.app.locals.db

    // In a real implementation, this would verify the Google token
    // For this demo, we'll create or find a user with a fixed Google email based on role
    const email = role === "admin" ? "admin.google@gmail.com" : "student.google@gmail.com"

    let user = await db.collection("users").findOne({ email })

    if (!user) {
      // Create a new user
      user = {
        firstName: role === "admin" ? "Admin" : "Student",
        lastName: "Google",
        email,
        password: await bcrypt.hash("googleauth", await bcrypt.genSalt(10)),
        role,
        googleId: "google-oauth2-id",
        createdAt: new Date(),
      }

      const result = await db.collection("users").insertOne(user)
      user._id = result.insertedId
    }

    // Create token
    const token = jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" })

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// Verify token and get user
router.get("/verify", verifyToken, async (req, res) => {
  try {
    const db = req.app.locals.db
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(req.user.id) }, { projection: { password: 0 } })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router

