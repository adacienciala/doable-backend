import { Db, MongoClient } from "mongodb";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { login, signup } from "./api/authentication";

dotenv.config();

async function connectToDb(): Promise<{
  db: Db | undefined;
  err: unknown | undefined;
}> {
  try {
    const client = await MongoClient.connect(
      `mongodb+srv://Lemon:${process.env.MONGO_PASS}@doable.fqkto.mongodb.net/doable?retryWrites=true&w=majority`
    ); // , { useNewUrlParser: true }
    return { db: client.db("doable"), err: undefined };
  } catch (e) {
    return { db: undefined, err: e };
  }
}

(async () => {
  const { err, db } = await connectToDb();

  if (err || !db) throw err;

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.set("db", db);

  app.get("/", (req, res) => {
    res.send("hello there");
  });

  app.post("/login", login);
  app.post("/register", signup);

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`server started at http://localhost:${PORT}`);
  });
})();
