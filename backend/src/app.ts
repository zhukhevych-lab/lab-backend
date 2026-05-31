import express from "express";
import cors from "cors";

import userRoutes from "./routes/user.routes";
import accessRequestRoutes from "./routes/accessRequest.routes";
import approvalRoutes from "./routes/approval.routes";

import logger from "./middlewares/logger.middleware";
import errorHandler from "./middlewares/error.middleware";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("CORS: origin is not allowed"), false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.options("/{*path}", cors());

app.use(express.json());
app.use(logger);

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/access-requests", accessRequestRoutes);
app.use("/api/v1/approvals", approvalRoutes);

app.use(errorHandler);

export default app;