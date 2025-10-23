import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from './config/db.js'
import authRouter from './routes/authRoutes.js'
import userRouter from "./routes/userRoutes.js";

const app = express()
const port = process.env.PORT || 4000
connectDB();

app.use(cors({
  origin: ['https://auth-mern-frontend-hw7f.onrender.com'], // Your frontend deployed URL
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// API Endpoints
app.get("/", (req, res) => res.send("API Working"))
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)

app.listen(port, () => console.log(`Server started on PORT:${port}`))
