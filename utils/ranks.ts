import { IRank, Rank } from "../models/rank";

export async function getRanks(): Promise<IRank[] | Error> {
  const ranks = await Rank.find({}).sort({ minXp: 1 });
  if (!ranks) {
    return new Error("Couldn't fetch ranks");
  }
  return ranks;
}
