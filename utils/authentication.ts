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

export async function updateToken(
  user: HydratedDocument<IUser>,
  token: string,
  tokenSelector: string
): Promise<IUser> {
  const hashedToken = await bcrypt.hash(token, 10);
  user.token = hashedToken;
  user.tokenTimestamp = Date.now();
  user.tokenSelector = tokenSelector;
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
  const user = await User.findOne({ tokenSelector });
  if (!user) {
    return res.status(403).json({
      msg: "incorrect credentials",
    });
  }
  const tokenMatch = await bcrypt.compare(token, user.token);
  if (!tokenMatch) {
    return res.status(403).json({
      msg: "incorrect credentials",
    });
  }

  req.userId = user.id;

  next();
}
