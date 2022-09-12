import { IReward, Reward } from "../../models/reward";
import { generateUniqueRewardId } from "../../utils/rewards";

interface AddRewardBody extends IReward {}

export const addReward = async (req, res) => {
  const rewardData: AddRewardBody = req.body;

  const newReward = {
    rewardId: await generateUniqueRewardId(),
    title: rewardData.title,
    description: rewardData.description,
    type: rewardData.type,
    value: rewardData.value,
    progress: 0,
    rarity: rewardData.rarity,
    popularity: 0,
  };
  const dbReward = await Reward.create<IReward>(newReward);

  return res.status(201).json(dbReward);
};
