
// server.js
import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";

const app = express();

// Use Render PORT or fallback
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
const port = process.env.PORT|| 3000;
connectDB()
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.log("❌ MongoDB error:", err));


// CORS middleware
app.use(cors({
  origin: ["http://localhost:5173",
    "https://auth-mern-frontend-hw7f.onrender.com"],
  credentials: true
}));



// Middleware
app.use(express.json());
app.use(cookieParser());

// Test route
app.get("/", (req, res) => res.send("✅ Backend working"));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
