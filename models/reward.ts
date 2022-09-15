import mongoose from "mongoose";

export interface IReward {
  rewardId: string;
  title: string;
  description: string;
  type: string;
  value: number;
  progress: number;
  difficulty: string;
  popularity: number;
}

const RewardSchema = new mongoose.Schema<IReward>({
  rewardId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true },
  value: { type: Number, required: true },
  progress: Number,
  difficulty: { type: String, required: true },
  popularity: Number,
});

export const Reward = mongoose.model<IReward>(
  "Reward",
  RewardSchema,
  "rewards"
);
