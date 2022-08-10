import { Task } from "../../models/task";

export const getTasks = async (req, res) => {
  const userId = req.userId;
  const tasks = await Task.find({ owner: { $in: [userId] } });
  if (!tasks) {
    return res.status(500).json({
      msg: "could not find tasks",
    });
  }

  return res.json(tasks);
};
