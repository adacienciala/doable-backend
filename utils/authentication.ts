import * as bcrypt from "bcrypt";
import { HydratedDocument } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { IUser, User } from "../models/user";

export async function generateUniqueId() {
  while (true) {
    const id = uuidv4();
    const user = await User.findOne({ doableId: id });
    if (!user) {
      return id;
    }
  }
}

const MILISECONDS = 1000;
const SECONDS = 60;
const MINUTES = 60;

export async function updateSession(
  user: HydratedDocument<IUser>,
  token: string,
  tokenSelector: string
): Promise<IUser> {
  user.sessions.filter((session) => {
    return (
      (Date.now() - session.tokenTimestamp) / MILISECONDS / SECONDS / MINUTES <
      2
    );
  });
  const hashedToken = await bcrypt.hash(token, 10);
  user.sessions.push({
    token: hashedToken,
    tokenTimestamp: Date.now(),
    tokenSelector: tokenSelector,
  });
  return user.save();
}
