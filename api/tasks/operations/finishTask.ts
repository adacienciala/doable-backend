import { HydratedDocument } from "mongoose";
import { IRank } from "../../../models/rank";
import { ITask } from "../../../models/task";
import { IUser, User } from "../../../models/user";

export async function handleTaskFinished(
  task: HydratedDocument<ITask>,
  userDoableId: string,
  ranks: IRank[] = []
): Promise<boolean> {
  const user = await User.findOne({ doableId: userDoableId });
  if (!user) {
    throw new Error("Cannot find user");
  }
  updateStatistics(user, task.xp, ranks);
  await user.save();
  return true;
}

function updateStatistics(
  user: HydratedDocument<IUser>,
  xpGained: number,
  ranks: IRank[]
) {
  user.statistics.xp += xpGained;
  if (user.statistics.xp <= user.statistics.maxXp) return;
  const newRank =
    ranks.find(
      (rank) =>
        user.statistics.xp >= rank.minXp && user.statistics.xp <= rank.maxXp
    ) || ranks[ranks.length - 1];
  user.statistics.maxXp = newRank.maxXp;
  user.statistics.rank = newRank.name;
}

export function isTaskFinished(
  task: HydratedDocument<ITask>,
  done: boolean | undefined
) {
  return done != undefined && !task.isDone && done;
}
