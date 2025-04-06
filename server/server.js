const express = require("express")
const { MongoClient, ObjectId } = require("mongodb")
const cors = require("cors")
const dotenv = require("dotenv")
const path = require("path")

// Load environment variables
dotenv.config()

// Import routes
const authRoutes = require("./routes/auth")
const quizRoutes = require("./routes/quizzes")
const quizResultRoutes = require("./routes/quizResults")
const adminRoutes = require("./routes/admin")

// Create Express app
const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// MongoDB Connection
const mongoClient = new MongoClient(process.env.MONGODB_URI)
let db

async function connectToDatabase() {
  try {
    await mongoClient.connect()
    console.log("Connected to MongoDB")
    db = mongoClient.db("mb-quiz")

    // Make db available to the routes
    app.locals.db = db

    // Start server after DB connection
    const PORT = process.env.PORT || 5000
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  } catch (err) {
    console.error("MongoDB connection error:", err)
    process.exit(1)
  }
}

// API Routes
app.use("/api/auth", authRoutes)
app.use("/api/quizzes", quizRoutes)
app.use("/api/quiz-results", quizResultRoutes)
app.use("/api/admin", adminRoutes)

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")))

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build/index.html"))
  })
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: "Something went wrong!" })
})

// Connect to MongoDB and start server
connectToDatabase().catch(console.error)

// Handle application shutdown
process.on("SIGINT", async () => {
  await mongoClient.close()
  console.log("MongoDB connection closed")
  process.exit(0)
})

