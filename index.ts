import * as bcrypt from "bcrypt";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { Server } from "socket.io";
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
import { IMessage, Message } from "./models/message";
import { User } from "./models/user";
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

  const server = app.listen(PORT, () => {
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

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  console.log("[CHAT] server up");

  io.on("connection", (socket) => {
    console.log("[CHAT] user connected");

    const socketTimeout = setTimeout(() => {
      console.log("[CHAT] force disconnect due to inactivity");
      socket.disconnect(true);
    }, 1000 * 10);

    socket.on("disconnect", () => {
      console.log(`[CHAT] user disconnected`);
    });

    socket.on("authenticate", async (data) => {
      if (!data || !data.token || !data.tokenSelector) return;
      const user = await User.findOne({
        "sessions.tokenSelector": data.tokenSelector,
      })
        .select({
          doableId: 1,
          partyId: 1,
          email: 1,
          name: 1,
          surname: 1,
          sessions: { $elemMatch: { tokenSelector: data.tokenSelector } },
        })
        .lean();
      if (!user) {
        return socket.emit("auth denied", "User not found");
      }
      const tokenMatch = await bcrypt.compare(
        data.token,
        user.sessions[0].token
      );
      if (!tokenMatch) {
        return socket.emit("auth denied", "Incorect credentials");
      }
      const authedUser = user;
      clearTimeout(socketTimeout);
      console.log(`[CHAT] ${user.email} authenticated`);
      socket.join(user.partyId);
      const messagesHistory = await Message.find({
        partyId: authedUser.partyId,
      })
        .sort({ date: 1 })
        .lean();

      socket.on("message", async (data) => {
        console.log(">>>", data);
        if (!data.partyId || !data.message || !data.userId) return;
        const newMessage = {
          partyId: data.partyId,
          message: data.message,
          userId: data.userId,
          date: new Date(),
        };
        const dbMessage = await Message.create<IMessage>(newMessage);
        if (!dbMessage) {
          console.error(err);
          return;
        }
        console.log("emitting");
        return io.to(dbMessage.partyId).emit("message", {
          ...dbMessage.toObject(),
          userDisplay: `${authedUser.name} ${authedUser.surname}`,
        });
      });
      return socket.emit("authenticated", messagesHistory);
    });

    return socket.emit("connection");
  });
})();
