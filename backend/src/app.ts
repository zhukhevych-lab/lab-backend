import express from "express";
import cors from "cors";

import userRoutes from "./routes/user.routes";
import accessRequestRoutes from "./routes/accessRequest.routes";
import approvalRoutes from "./routes/approval.routes";

import logger from "./middlewares/logger.middleware";
import errorHandler from "./middlewares/error.middleware";
import { securityHeaders } from "./middlewares/securityHeaders.middleware";

const app = express();

// ЛР5 — Сценарій Г: CORS обмежений конкретними origins фронтенду
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
];

app.use(
  cors({
    origin: (origin, cb) => {
      // дозволяємо запити без origin (curl, Postman) — для навчальних потреб
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("CORS: origin is not allowed"), false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Demo-UserId"],
  }),
);

app.options("/{*path}", cors());

// ЛР5 — Сценарій Г: базові безпечні заголовки
app.use(securityHeaders);

app.use(express.json());
app.use(logger);

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/access-requests", accessRequestRoutes);
app.use("/api/v1/approvals", approvalRoutes);

// ЛР5 — централізована обробка помилок (без stack trace у production)
app.use(errorHandler);

export default app;
