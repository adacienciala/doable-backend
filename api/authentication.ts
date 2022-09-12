import * as bcrypt from "bcrypt";
import * as emailValidator from "email-validator";
import { v4 as uuidv4 } from "uuid";
import { Rank } from "../models/rank";
import { IUser, User } from "../models/user";
import { generateUniqueUserId, updateSession } from "../utils/authentication";

export const login = async (req, res) => {
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
  const user = await User.findOne({ email: req.body.email });
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
  const token = uuidv4();
  const tokenSelector = uuidv4();
  const dbUser = await updateSession(user, token, tokenSelector);
  if (!dbUser) {
    return res.status(400).json({ msg: "token not available" });
  }

  const userData = {
    doableId: dbUser.doableId,
    name: dbUser.name,
    email: dbUser.email,
    surname: dbUser.surname,
    partyId: dbUser.partyId,
    settings: dbUser.settings,
    statistics: dbUser.statistics,
  };

  res.status(200).json({ token, tokenSelector, user: userData });
};

export const signup = async (req, res) => {
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
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.status(400).json({
      msg: "email already in use",
    });
  }
  const token = uuidv4();
  const tokenSelector = uuidv4();
  const hashedToken = await bcrypt.hash(token, 10);
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const doableId = await generateUniqueUserId();
  const allRanks = await Rank.find({}).sort({ maxXp: "asc" });
  if (!allRanks) {
    return res.status(500).json({
      msg: "couldn't find ranks",
    });
  }
  const lowestRank = allRanks[0];
  const newUser: IUser = {
    doableId: doableId,
    email: req.body.email,
    password: hashedPassword,
    name: req.body.name,
    surname: req.body.surname,
    partyId: req.body.partyId,
    sessions: [
      {
        token: hashedToken,
        tokenSelector: tokenSelector,
        tokenTimestamp: Date.now(),
      },
    ],
    settings: {
      avatarSeed: req.body.email,
    },
    statistics: {
      points: {
        xp: 0,
        minXp: lowestRank.minXp,
        maxXp: lowestRank.maxXp,
        rank: lowestRank.name,
      },
      party: {
        xp: 0,
        level: 0,
      },
      tasks: {
        created: 0,
        current: 0,
        deleted: 0,
        finished: 0,
      },
      rewards: [],
    },
  };

  const dbUser = await User.create<IUser>(newUser);

  const userData = {
    doableId: dbUser.doableId,
    name: dbUser.name,
    email: dbUser.email,
    surname: dbUser.surname,
    partyId: dbUser.partyId,
    settings: dbUser.settings,
    statistics: dbUser.statistics,
  };

  res.status(200).json({ token, tokenSelector, user: userData });
};
