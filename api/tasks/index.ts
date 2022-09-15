export * from "./addTask";
export * from "./deleteTask";
export * from "./editTask";
export * from "./getSingleTask";
export * from "./getTasks";

export interface TaskData {
  title: string;
  description: string;
  date: Date;
  difficulty: string;
  projectId: string;
  isChallenge: boolean;
  isDone: boolean;
  repeat: string;
}
