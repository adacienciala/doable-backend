import { IParty, Party } from "../../models/party";
import { IReward, Reward } from "../../models/reward";
import { IUser, User } from "../../models/user";
import { getRewardProgress, isRewardAchieved } from "../rewards";

export const getSingleUser = async (req, res) => {
  const userId = req.params.userId;
  const dbUser = await User.findOne({
    doableId: userId,
  }).select({ sessions: 0, password: 0 });
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

  const rewards = await Reward.find({});
  if (!rewards) {
    return res.status(404).json({ msg: "Couldn't find rewards" });
  }

  let rewardsWithProgress: IReward[] = [];

  // updare rewards progress (itself and user's)

  for (let rId = 0; rId < rewards.length; rId += 1) {
    const progress = isRewardAchieved(rewards[rId], dbUser)
      ? 1
      : getRewardProgress(rewards[rId], sortedMembers, dbUser);
    rewardsWithProgress.push(rewards[rId].toObject());
    rewardsWithProgress[rId].progress = Math.floor(progress * 100);
    await rewards[rId].save();
  }
  await dbUser.save();

  return res.status(200).json({ user: dbUser, rewards: rewardsWithProgress });
};
