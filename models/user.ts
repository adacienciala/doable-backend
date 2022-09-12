import mongoose from "mongoose";

export interface IUser {
  doableId: string;
  name: string;
  email: string;
  password: string;
  surname: string;
  partyId: string;
  sessions: IUserSession[];
  settings: IUserSettings;
  statistics: IUserStatistics;
}

export interface IUserSession {
  token: string;
  tokenSelector: string;
  tokenTimestamp: number;
}

export interface IUserSettings {
  avatarSeed: string;
}

export interface IUserStatisticsParty {
  xp: number;
  level: number;
}

export interface IUserStatisticsPoints {
  xp: number;
  minXp: number;
  maxXp: number;
  rank: string;
}

export interface IUserStatisticsTasks {
  current: number;
  finished: number;
  created: number;
  deleted: number;
}

export interface IUserStatistics {
  points: IUserStatisticsPoints;
  party: IUserStatisticsParty;
  tasks: IUserStatisticsTasks;
}

const UserSessionSchema = new mongoose.Schema<IUserSession>({
  token: { type: String, required: true },
  tokenSelector: { type: String, required: true },
  tokenTimestamp: { type: Number, required: true },
});

const UserSettingsSchema = new mongoose.Schema<IUserSettings>({
  avatarSeed: String,
});

const IUserStatisticsPartySchema = new mongoose.Schema<IUserStatisticsParty>({
  xp: { type: Number, required: true },
  level: { type: Number, required: true },
});

const IUserStatisticsPointsSchema = new mongoose.Schema<IUserStatisticsPoints>({
  xp: { type: Number, required: true },
  minXp: { type: Number, required: true },
  maxXp: { type: Number, required: true },
  rank: { type: String, required: true },
});

const IUserStatisticsTasksSchema = new mongoose.Schema<IUserStatisticsTasks>({
  current: { type: Number, required: true },
  finished: { type: Number, required: true },
  created: { type: Number, required: true },
  deleted: { type: Number, required: true },
});

const UserStatisticsSchema = new mongoose.Schema<IUserStatistics>({
  points: { type: IUserStatisticsPointsSchema, required: true },
  party: { type: IUserStatisticsPartySchema, required: true },
  tasks: { type: IUserStatisticsTasksSchema, required: true },
});

const UserSchema = new mongoose.Schema<IUser>({
  doableId: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  surname: { type: String, required: true },
  partyId: String,
  sessions: { type: [UserSessionSchema], required: true },
  settings: UserSettingsSchema,
  statistics: UserStatisticsSchema,
});

export const User = mongoose.model<IUser>("User", UserSchema, "accounts");
