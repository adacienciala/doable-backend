import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { login, signup } from "./api/authentication";
import { getTasks } from "./api/tasks";
import { authCheckMiddleware } from "./utils/authentication";

dotenv.config();

async function connectToDb(): Promise<null | Error> {
  try {
    await mongoose.connect(
      `mongodb+srv://Lemon:${process.env.MONGO_PASS}@doable.fqkto.mongodb.net/doable?retryWrites=true&w=majority`
    ); // , { useNewUrlParser: true }
    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "MongoDB connection error:"));
    return null;
  } catch (e) {
    return e;
  }
}

(async () => {
  const err = await connectToDb();
  if (err) throw err;

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(authCheckMiddleware);

  app.get("/", (req, res) => {
    res.send("hello there");
  });

  app.post("/login", login);
  app.post("/register", signup);
  app.get("/tasks", getTasks);

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`server started at http://localhost:${PORT}`);
  });
})();
