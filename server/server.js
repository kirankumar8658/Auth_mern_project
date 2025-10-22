
import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";

const app = express();
const port = process.env.PORT|| 3000;
connectDB()
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => console.log(err));
  const allowedOrigins=['http://localhost:5173']

app.use(express.json());
app.use(cors({ origin:allowedOrigins,credentials: true }));
app.use(cookieParser());
app.get("/", (req, res) => {
    res.send("api working...");
});

app.use("/api/auth", authRouter);
app.use('/api/user',userRouter)


app.listen(port, () => {
  console.log(`server started on port ${port}`);
});