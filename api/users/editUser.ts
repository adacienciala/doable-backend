import * as bcrypt from "bcrypt";
import * as emailValidator from "email-validator";
import mongoose from "mongoose";
import { IUser, User } from "../../models/user";

interface UpdateUserBody extends Partial<IUser> {}

const readOnlyFields = ["sessions", "statistics"];

export const updateUser = async (req, res) => {
  const userData: UpdateUserBody = req.body;
  const userId = req.params.userId;
  const userDoableId = req.userDoableId;
  if (userId !== userDoableId) {
    return res.status(403).json({ msg: "Cannot edit other users" });
  }
  const dbUser = await User.findOne({
    doableId: userDoableId,
  });
  if (!dbUser) {
    return res.status(404).json({ msg: "User not found" });
  }

  Object.keys(userData).forEach((field) => {
    if (userData[field] === "" || readOnlyFields.includes(field)) {
      delete userData[field];
    }
  });

  if (userData.email && !emailValidator.validate(userData.email)) {
    return res.status(400).json({
      msg: "invalid email address",
    });
  }

  if (userData.password) {
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(userData.password)) {
      return res.status(400).json({
        msg: "incorrect password (min 6 characters including 1 number)",
      });
    }
    userData.password = await bcrypt.hash(req.body.password, 10);
  }

  Object.keys(userData).forEach((field) => (dbUser[field] = userData[field]));

  try {
    const savedUser = await dbUser.save();
    return res.status(200).json({ user: savedUser });
  } catch (e) {
    if (e instanceof mongoose.Error.DocumentNotFoundError) {
      return res.status(400).json({ msg: "User has been deleted" });
    }
    return res.status(500).json({ msg: "User couldn't be saved" });
  }
};
