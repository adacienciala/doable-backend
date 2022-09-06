import { NextFunction, Request, Response } from "express";
export async function loggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log(`${req.method} ${req.path}`);
  console.log(JSON.stringify(req.body) + "\n");
  next();
}
