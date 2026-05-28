import express from "express";
import * as controller from "../controllers/accessRequest.controller";

const router = express.Router();

router.get("/stats", controller.getStats);
router.get("/search", controller.search);
router.get("/", controller.getAll);
router.get("/:id/with-user", controller.getWithUser);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

export default router;