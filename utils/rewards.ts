import { v4 as uuidv4 } from "uuid";
import { Reward } from "../models/reward";

export async function generateUniqueRewardId() {
  while (true) {
    const id = uuidv4();
    const reward = await Reward.findOne({ rewardId: id });
    if (!reward) {
      return id;
    }
  }
}
