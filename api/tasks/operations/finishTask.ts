import { HydratedDocument } from "mongoose";
import { IProject, Project } from "../../../models/project";
import { IRank } from "../../../models/rank";
import { ITask } from "../../../models/task";
import { IUser, User } from "../../../models/user";
import { mapTaskDifficultyToPoints } from "../../../utils/tasks";

export async function handleTaskFinished(
  task: HydratedDocument<ITask>,
  userDoableId: string,
  ranks: IRank[] = []
) {
  const user = await User.findOne({ doableId: userDoableId });
  if (!user) {
    throw new Error("Cannot find user");
  }
  const xpGained = mapTaskDifficultyToPoints(task.difficulty);
  updateUserStatisticsPoints(user, xpGained, ranks);
  if (task.projectId)
    await updateUserStatisticsParty(user, xpGained, task.projectId);
  updateUserStatisticsTasks(user);

  const { acknowledged: acknowledgedOwners } = await User.updateMany(
    { $or: [{ doableId: task.owner }, { partyId: user.partyId }] },
    { $inc: { "statistics.tasks.current": -1 } }
  );
  if (!acknowledgedOwners) {
    throw new Error("Owners statistics not updated");
  }
  await user.save();
}

function updateUserStatisticsPoints(
  user: HydratedDocument<IUser>,
  xpGained: number,
  ranks: IRank[]
) {
  user.statistics.points.xp += xpGained;
  if (user.statistics.points.xp <= user.statistics.points.maxXp) return;
  const newRank =
    ranks.find(
      (rank) =>
        user.statistics.points.xp >= rank.minXp &&
        user.statistics.points.xp <= rank.maxXp
    ) || ranks[ranks.length - 1];
  user.statistics.points.minXp = newRank.minXp;
  user.statistics.points.maxXp = newRank.maxXp;
  user.statistics.points.rank = newRank.name;
}

async function updateUserStatisticsParty(
  user: HydratedDocument<IUser>,
  xpGained: number,
  taskProjectId: string
) {
  const project = await Project.findOne<IProject>({
    projectId: taskProjectId,
  });
  if (!project) {
    throw new Error("Cannot find task's project");
  }
  if (!project.party.includes(user.partyId)) return;
  user.statistics.party.xp += xpGained;
  user.statistics.party.level = Math.ceil(user.statistics.party.xp / 100);
}

function updateUserStatisticsTasks(user: HydratedDocument<IUser>) {
  user.statistics.tasks.current -= 1;
  user.statistics.tasks.finished += 1;
}

export function isTaskFinished(task: HydratedDocument<ITask>, done?: boolean) {
  return done !== undefined && !task.isDone && done;
}
