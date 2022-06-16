import mongoose from "mongoose";

export interface IRank {
  minXp: number;
  maxXp: number;
  name: string;
}

const RankScheme = new mongoose.Schema<IRank>({
  minXp: { type: Number, required: true },
  maxXp: { type: Number, required: true },
  name: { type: String, required: true },
});

export const Rank = mongoose.model<IRank>("Rank", RankScheme, "ranks");
