import express from "express";
import * as controller from "../controllers/accessRequest.controller";
import { demoAuth } from "../middlewares/demoAuth.middleware";

const router = express.Router();

// Публічні (без автентифікації)
router.get("/stats", controller.getStats);
router.get("/", controller.getAll);
router.get("/:id/with-user", controller.getById);

// ЛР5 — Сценарій А: демонстраційні endpoints (вразливий vs безпечний пошук)
router.get("/search-vuln", controller.searchVulnerable);  // PoC — вразливий
router.get("/search", controller.searchSafe);             // виправлений

// ЛР5 — Сценарій В: IDOR-захищені маршрути (потребують X-Demo-UserId)
router.get("/:id/vuln", demoAuth, controller.getByIdVulnerable); // PoC — без перевірки власника
router.get("/:id/my", demoAuth, controller.getMyById);            // виправлений — тільки свій
router.post("/", demoAuth, controller.create);
router.put("/:id", demoAuth, controller.update);
router.delete("/:id", demoAuth, controller.remove);

// Публічне читання окремої заявки (без IDOR-захисту — демо для порівняння)
router.get("/:id", controller.getById);

export default router;
