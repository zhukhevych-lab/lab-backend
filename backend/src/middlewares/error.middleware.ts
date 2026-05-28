import { Request, Response, NextFunction, ErrorRequestHandler } from "express";

type AppError = Error & {
  status?: number;
  details?: unknown[];
};

const errorMiddleware: ErrorRequestHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const msg = String(err?.message ?? err);

  if (msg.includes("UNIQUE constraint failed")) {
    return res.status(409).json({
      error: {
        code: "CONFLICT",
        message: "Unique constraint violation",
        details: [msg],
      },
    });
  }

  if (
    msg.includes("NOT NULL constraint failed") ||
    msg.includes("CHECK constraint failed")
  ) {
    return res.status(400).json({
      error: {
        code: "INVALID_DATA",
        message: "Invalid data",
        details: [msg],
      },
    });
  }

  console.error(err);

  return res.status(err.status ?? 500).json({
    error: {
      code: "ERROR",
      message: err.message ?? "Internal Server Error",
      details: err.details ?? [],
    },
  });
};

export default errorMiddleware;