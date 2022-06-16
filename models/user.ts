import mongoose from "mongoose";

export interface IUser {
  doableId: string;
  name: string;
  email: string;
  password: string;
  surname: string;
  token: string;
  tokenSelector: string;
  tokenTimestamp: number;
  settings: IUserSettings;
  statistics: IUserStatistics;
}

export interface IUserSettings {
  avatarSeed: string;
}

const UserSettingsSchema = new mongoose.Schema<IUserSettings>({
  avatarSeed: String,
});

export interface IUserStatistics {
  xp: number;
  maxXp: number;
  rank: string;
}

const UserStatisticsSchema = new mongoose.Schema<IUserStatistics>({
  xp: { type: Number, required: true },
  maxXp: { type: Number, required: true },
  rank: { type: String, required: true },
});

const UserSchema = new mongoose.Schema<IUser>({
  doableId: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  surname: { type: String, required: true },
  token: { type: String, required: true },
  tokenSelector: { type: String, required: true },
  tokenTimestamp: Number,
  settings: UserSettingsSchema,
  statistics: UserStatisticsSchema,
});

export const User = mongoose.model<IUser>("User", UserSchema, "accounts");
