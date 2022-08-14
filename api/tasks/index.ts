export * from "./addTasks";
export * from "./getTasks";

export interface TaskData {
  title: string;
  description: string;
  date: Date;
  xp: number;
  projectId: string;
  isChallenge: boolean;
  isDone: boolean;
  repeat: string;
}
