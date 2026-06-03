import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";

const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  console.error("[ERROR]", err);

  const isDev = process.env.NODE_ENV !== "production";

  if (err instanceof AppError) {
    res.status(err.status).json({
      error: {
        message: err.message,
        ...(err.details?.length ? { details: err.details } : {}),
      },
    });
    return;
  }

  res.status(500).json({
    error: {
      message: "Internal Server Error",
      ...(isDev && err instanceof Error ? { details: err.message } : {}),
    },
  });
};

export default errorHandler;