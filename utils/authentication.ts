import * as bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import { HydratedDocument } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { IUser, User } from "../models/user";

export async function generateUniqueUserId() {
  while (true) {
    const id = uuidv4();
    const user = await User.findOne({ doableId: id });
    if (!user) {
      return id;
    }
  }
}

const MILISECOND = 1;
const SECOND = 1000 * MILISECOND;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

export async function updateSession(
  user: HydratedDocument<IUser>,
  token: string,
  tokenSelector: string
): Promise<IUser> {
  user.sessions = user.sessions.filter((session) => {
    return (Date.now() - session.tokenTimestamp) / HOUR < 2;
  });
  const hashedToken = await bcrypt.hash(token, 10);
  user.sessions.push({
    token: hashedToken,
    tokenTimestamp: Date.now(),
    tokenSelector: tokenSelector,
  });
  return user.save();
}

export async function authCheckMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const nonTokenPaths = ["/login", "/register"];
  if (nonTokenPaths.includes(req.path)) return next();

  const bearer = req.header("Authorization");
  if (!bearer) {
    return res.status(403).json({
      msg: "no authorization header",
    });
  }
  if (!bearer.startsWith("Bearer ")) {
    return res.status(403).json({
      msg: "invalid authorization header",
    });
  }

  const [token, tokenSelector] = bearer.replace("Bearer ", "").split(".");
  const user = await User.findOne({
    "sessions.tokenSelector": tokenSelector,
  }).select({ doableId: 1, sessions: { $elemMatch: { tokenSelector } } });
  if (!user) {
    return res.status(403).json({
      msg: "incorrect credentials",
    });
  }
  const tokenMatch = await bcrypt.compare(token, user.sessions[0].token);
  if (!tokenMatch) {
    return res.status(403).json({
      msg: "incorrect credentials",
    });
  }

  req.userDoableId = user.doableId;

  next();
}
