import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { login, signup } from "./api/authentication";
import {
  addParty,
  deleteParty,
  getParties,
  getSingleParty,
  updateParty,
} from "./api/parties";
import {
  addProject,
  deleteProject,
  getProjects,
  getSingleProject,
  updateProject,
} from "./api/projects";
import { getRanks } from "./api/ranks";
import { addReward, getRewards } from "./api/rewards";
import {
  addTask,
  deleteTask,
  getSingleTask,
  getTasks,
  updateTask,
} from "./api/tasks";
import { deleteUser, getSingleUser, getUsers, updateUser } from "./api/users";
import { authCheckMiddleware } from "./utils/authentication";
import { loggerMiddleware } from "./utils/logger";
import { getAllRanks } from "./utils/ranks";

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
  app.use(loggerMiddleware);
  app.set("ranks", await getAllRanks());

  app.get("/", (req, res) => {
    res.send("hello there");
  });

  app.post("/login", login);
  app.post("/register", signup);

  app.get("/tasks", getTasks);
  app.post("/tasks", addTask);
  app.delete("/tasks/:taskId", deleteTask);
  app.get("/tasks/:taskId", getSingleTask);
  app.put("/tasks/:taskId", updateTask);

  app.get("/projects", getProjects);
  app.post("/projects", addProject);
  app.delete("/projects/:projectId", deleteProject);
  app.get("/projects/:projectId", getSingleProject);
  app.put("/projects/:projectId", updateProject);

  app.get("/parties", getParties);
  app.post("/parties", addParty);
  app.delete("/parties/:partyId", deleteParty);
  app.get("/parties/:partyId", getSingleParty);
  app.put("/parties/:partyId", updateParty);

  app.get("/users", getUsers);
  app.get("/users/:userId", getSingleUser);
  app.put("/users/:userId", updateUser);
  app.delete("/users/:userId", deleteUser);
  app.get("/users/:userId/rewards", getRewards);

  app.get("/ranks", getRanks);

  app.post("/rewards", addReward);

  app.get("*", (_, res) => {
    return res.status(404).json({
      msg: "route not found",
    });
  });

  app.get("*", (_, res) => {
    return res.status(404).json({
      msg: "route not found",
    });
  });

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`server started at http://localhost:${PORT}`);
    console.log(
      app._router.stack
        .filter((l) => l.route)
        .map(
          (l) =>
            `path: ${l.route.path}, methods: ${JSON.stringify(l.route.methods)}`
        )
    );
  });
})();
