import { HydratedDocument } from "mongoose";
import { IParty, Party } from "../../models/party";
import { IReward, Reward } from "../../models/reward";
import { IUser, User } from "../../models/user";

export const getRewards = async (req, res) => {
  const userId = req.userDoableId;

  // get the user info

  const dbUser = await User.findOne({
    doableId: userId,
  });
  if (!dbUser) {
    return res.status(404).json({ msg: "User not found" });
  }

  // get sorted party members

  let sortedMembers;
  if (dbUser.partyId) {
    const dbParty: IParty & { membersDetails: IUser[] } = await Party.findOne({
      partyId: dbUser.partyId,
    })
      .populate("membersDetails")
      .lean();
    if (!dbParty) {
      return res.status(404).json({ msg: "Party not found" });
    }
    sortedMembers = dbParty.membersDetails.sort(
      (m1, m2) => m2.statistics.party.xp - m1.statistics.party.xp
    );
  }

  // get all rewards

  const rewards = await Reward.find({}).lean();
  if (!rewards) {
    return res.status(404).json({ msg: "Couldn't find rewards" });
  }

  // updare all and user's rewards progress

  for (const reward of rewards) {
    const progress = isRewardAchieved(reward, dbUser)
      ? 1
      : getRewardProgress(reward, sortedMembers, dbUser);
    reward.progress = Math.floor(progress * 100);
  }

  await dbUser.save();

  return res.status(200).json(rewards);
};

function isRewardAchieved(reward: IReward, user: HydratedDocument<IUser>) {
  return user.statistics.rewards.some(
    (rAchieved) => reward.rewardId === rAchieved
  );
}

function getRewardProgress(
  reward: IReward,
  sortedMembers: IUser[],
  user: HydratedDocument<IUser>
) {
  let progress = 0;
  if (reward.type === "tasks") {
    if (reward.value < 0) {
      progress = user.statistics.tasks.deleted / (reward.value * -1);
    } else {
      progress = user.statistics.tasks.finished / reward.value;
    }
  } else if (reward.type === "party" && sortedMembers) {
    if (reward.value === 0) {
      progress = 1;
    } else {
      const place =
        sortedMembers.findIndex(
          ({ doableId }: IUser) => doableId === user.doableId
        ) + 1;
      progress = place === reward.value ? 1 : 0;
    }
  }
  if (progress === 1 && !user.statistics.rewards.includes(reward.rewardId)) {
    user.statistics.rewards.push(reward.rewardId);
  }
  return progress;
}
