import { User } from "../../models/user";

export const getUsers = async (req, res) => {
  const users = await User.find({})
    .select({
      doableId: 1,
      "settings.avatarSeed": 1,
      name: 1,
      surname: 1,
      "statistics.points.xp": 1,
    })
    .lean();
  if (!users) {
    return res.status(404).json({ msg: "Users not found" });
  }
  return res.status(200).json(users);
};
