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
