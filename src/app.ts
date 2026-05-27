import express from "express";

import userRoutes from "./routes/user.routes";
import accessRequestRoutes from "./routes/accessRequest.routes";
import approvalRoutes from "./routes/approval.routes";

import logger from "./middlewares/logger.middleware";
import errorHandler from "./middlewares/error.middleware";

const app = express();

app.use(express.json());
app.use(logger);

app.use("/api/users", userRoutes);
app.use("/api/access-requests", accessRequestRoutes);
app.use("/api/approvals", approvalRoutes);

app.use(errorHandler);

export default app;