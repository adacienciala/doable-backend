import { Task } from "../../models/task";

export const getTasks = async (req, res) => {
  const userDoableId = req.userDoableId;
  const tasks = await Task.find({ owner: userDoableId });
  if (!tasks) {
    return res.status(500).json({
      msg: "could not find tasks",
    });
  }

  return res.json(tasks);
};
