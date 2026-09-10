import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./src/config/db.js";
import router from "./src/routes/notesRoutes.js";
import rateLimiter from "./src/config/rateLimit.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5001;

app.use(express.json());
if (process.env.NODE_ENV !== "production") {
  app.use(
    cors({
      origin: "http://localhost:5173",
    }),
  );
}
app.use(rateLimiter);
app.use("/api/notes", router);
app.get("/", (req, res) => {
  res.send("Backend server is running!");
});
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server started on PORT:${PORT}`);
  });
});
