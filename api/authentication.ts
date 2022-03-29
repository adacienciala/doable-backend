import * as bcrypt from "bcrypt";
import * as emailValidator from "email-validator";
import { Db } from "mongodb";
import { v4 as uuidv4 } from "uuid";
import { generateUniqueId, updateToken } from "../utils/authentication";

export const login = async (req, res) => {
  const db = req.app.get("db") as Db;
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({
      msg: "missing data",
    });
  }
  if (!emailValidator.validate(req.body.email)) {
    return res.status(400).json({
      msg: "invalid email address",
    });
  }
  const user = await db
    .collection("accounts")
    .findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).json({
      msg: "incorrect email",
    });
  }
  const passwordMatch = await bcrypt.compare(req.body.password, user.password);
  if (!passwordMatch) {
    return res.status(400).json({
      msg: "incorrect password",
    });
  }
  let token = uuidv4();
  let tokenSelector = uuidv4();
  const success = await updateToken(db, user._id, token, tokenSelector);
  if (!success) {
    return res.status(400).json({ msg: "token not available" });
  }

  res.json({ token: token, selector: tokenSelector });
};

export const signup = async (req, res) => {
  const db = req.app.get("db") as Db;
  const requiredFields = ["email", "password", "name", "surname"];
  for (const field of requiredFields) {
    if (!req.body[field]) {
      return res.status(400).json({
        msg: `missing ${field} data`,
      });
    }
  }
  if (!emailValidator.validate(req.body.email)) {
    return res.status(400).json({
      msg: "invalid email address",
    });
  }
  if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(req.body.password)) {
    return res.status(400).json({
      msg: "incorrect password (min 6 characters including 1 number)",
    });
  }
  const emailTaken = await db
    .collection("accounts")
    .findOne({ email: req.body.email });
  if (emailTaken) {
    return res.status(400).json({
      msg: "email already in use",
    });
  }
  const token = uuidv4();
  const tokenSelector = uuidv4();
  const hashedToken = await bcrypt.hash(token, 10);
  const hashedPassoword = await bcrypt.hash(req.body.password, 10);
  const doableId = await generateUniqueId(db);
  const newUser = {
    doableId: doableId,
    email: req.body.email,
    password: hashedPassoword,
    name: req.body.name,
    surname: req.body.surname,
    token: hashedToken,
    tokenSelector: tokenSelector,
    tokenTimestamp: Date.now(),
  };

  const { acknowledged } = await db.collection("accounts").insertOne(newUser);
  if (!acknowledged) {
    return res.status(400).json({
      msg: "user not created",
    });
  }

  res.json({ token, tokenSelector });
};
