import mongoose from "mongoose";
import { Party } from "../../models/party";
import { Project } from "../../models/project";
import { Task } from "../../models/task";
import { User } from "../../models/user";

export const deleteUser = async (req, res) => {
  const userId = req.params.userId;
  const userDoableId = req.userDoableId;
  const userPartyId = req.userPartyId;
  if (userId !== userDoableId) {
    return res.status(403).json({ msg: "Cannot delete other users" });
  }

  // delete user

  const { acknowledged: acknowledgedDeleted } = await User.deleteOne({
    doableId: userDoableId,
  });
  if (!acknowledgedDeleted) {
    return res.status(404).json({ msg: "User not found" });
  }

  // unlink user from party

  const { acknowledged } = await Party.updateOne(
    {
      partyId: userPartyId,
    },
    {
      $pull: {
        members: userDoableId,
      },
    }
  );
  if (!acknowledged) {
    return res.status(400).json({
      msg: "could not unlink user from party",
    });
  }

  // unlink / delete user's projects (with tasks)

  const projects = await Project.find({
    owner: userDoableId,
  });
  try {
    projects.forEach(async (project) => {
      const filteredOwners = project.owner.filter((o) => o != userDoableId);
      if (filteredOwners.length + project.party.length === 0) {
        await project.delete();
        const { acknowledged } = await Task.deleteMany({
          projectId: project.projectId,
        });
        if (!acknowledged) {
          return res.status(400).json({
            msg: "could not delete tasks linked with project",
          });
        }
      } else {
        project.owner = filteredOwners;
        await project.save();
      }
    });
  } catch (e) {
    if (e instanceof mongoose.Error.DocumentNotFoundError) {
      return res
        .status(400)
        .json({ msg: "Not all projects have been updated" });
    }
    return res.status(500).json({ msg: "Projects couldn't be updated" });
  }

  // unlink / delete user's tasks

  const tasks = await Task.find({
    owner: userDoableId,
  });
  try {
    tasks.forEach(async (task) => {
      const filteredOwners = task.owner.filter((o) => o != userDoableId);
      if (filteredOwners.length === 0) {
        await task.delete();
      } else {
        task.owner = filteredOwners;
        await task.save();
      }
    });
  } catch (e) {
    if (e instanceof mongoose.Error.DocumentNotFoundError) {
      return res.status(400).json({ msg: "Not all tasks have been updated" });
    }
    return res.status(500).json({ msg: "Tasks couldn't be updated" });
  }

  return res.sendStatus(204);
};
