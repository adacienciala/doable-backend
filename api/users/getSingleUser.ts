import { User } from "../../models/user";

export const getSingleUser = async (req, res) => {
  const userId = req.params.userId;
  const dbUser = await User.findOne({
    doableId: userId,
  });
  if (!dbUser) {
    return res.status(404).json({ msg: "User not found" });
  }
  return res.status(200).json(dbUser);
};
