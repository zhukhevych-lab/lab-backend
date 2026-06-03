import { Request, Response, NextFunction } from "express";
import * as service from "../services/accessRequest.service";
import AppError from "../utils/AppError";

type IdParams = { id: string };
type Query = Record<string, string | undefined>;
type AuthRequest = Request & { user: { id: number } };

export const getAll = (
  req: Request<IdParams, unknown, unknown, Query>,
  res: Response,
  next: NextFunction,
) => {
  service
    .getAll({
      page: Number(req.query.page) || 1,
      pageSize: Number(req.query.pageSize) || 10,
      status: req.query.status,
      accessType: req.query.accessType,
      sortBy: req.query.sortBy,
      order: req.query.order,
    })
    .then((data) => res.json({ items: data.items, page: data.page, pageSize: data.pageSize }))
    .catch(next);
};

export const getById = (req: Request<IdParams>, res: Response, next: NextFunction) => {
  service
    .getById(Number(req.params.id))
    .then((record) => res.json(record))
    .catch(next);
};

export const getWithUser = (req: Request<IdParams>, res: Response, next: NextFunction) => {
  service
    .getWithUser(Number(req.params.id))
    .then((record) => res.json({ data: record }))
    .catch(next);
};

export const getStats = (_req: Request, res: Response, next: NextFunction) => {
  service
    .getStats()
    .then((stats) => res.json({ data: stats }))
    .catch(next);
};

/**
 * ЛР5 — Сценарій А (demo): вразливий пошук — тільки для демонстрації PoC
 * GET /api/v1/access-requests/search-vuln?q=...
 */
export const searchVulnerable = (
  req: Request<IdParams, unknown, unknown, Query>,
  res: Response,
  next: NextFunction,
) => {
  const q = req.query.q ?? "";
  service
    .searchVulnerable(q)
    .then((items) =>
      res.json({
        data: items,
        warning: "⚠️ VULNERABLE endpoint — SQL is built via string concatenation. PoC only.",
      }),
    )
    .catch(next);
};

/**
 * ЛР5 — Сценарій А (fix): безпечний пошук через параметризований запит
 * GET /api/v1/access-requests/search?q=...
 */
export const searchSafe = (
  req: Request<IdParams, unknown, unknown, Query>,
  res: Response,
  next: NextFunction,
) => {
  const q = req.query.q ?? "";
  service
    .searchSafe(q)
    .then((items) => res.json({ data: items }))
    .catch(next);
};

/**
 * ЛР5 — Сценарій В: IDOR — дозволяємо читати тільки власну заявку
 * GET /api/v1/access-requests/:id/my
 * Потребує X-Demo-UserId
 */
export const getMyById = (req: Request<IdParams>, res: Response, next: NextFunction) => {
  const ownerUserId = (req as AuthRequest).user.id;
  service
    .getByIdForOwner(Number(req.params.id), ownerUserId)
    .then((record) => res.json(record))
    .catch(next);
};

/**
 * ЛР5 — Сценарій В: створення заявки — ownerUserId береться з req.user, не з body
 */
export const create = (req: Request, res: Response, next: NextFunction) => {
  const ownerUserId = (req as AuthRequest).user.id;
  const { userId, date, accessType, comments } = req.body as {
    userId: number;
    date: string;
    accessType: string;
    comments: string;
  };

  service
    .create({ userId: userId ?? ownerUserId, ownerUserId, date, accessType, comments })
    .then((record) => res.status(201).json(record))
    .catch(next);
};

/**
 * ЛР5 — Сценарій В: оновлення — тільки власної заявки
 */
export const update = (req: Request<IdParams>, res: Response, next: NextFunction) => {
  const ownerUserId = (req as AuthRequest).user.id;
  const { date, accessType, comments, status } = req.body as {
    date?: string;
    accessType?: string;
    comments?: string;
    status?: string;
  };

  service
    .update(Number(req.params.id), ownerUserId, { date, accessType, comments, status })
    .then((record) => res.json(record))
    .catch(next);
};

/**
 * ЛР5 — Сценарій В: видалення — тільки власної заявки
 */
export const remove = (req: Request<IdParams>, res: Response, next: NextFunction) => {
  const ownerUserId = (req as AuthRequest).user.id;
  service
    .remove(Number(req.params.id), ownerUserId)
    .then(() => res.status(204).send())
    .catch(next);
};

/**
 * ЛР5 — IDOR PoC: вразливий endpoint без перевірки власника
 * GET /api/v1/access-requests/:id/vuln
 * Повертає будь-яку заявку за id — незалежно від того, хто запитує
 */
export const getByIdVulnerable = (req: Request<IdParams>, res: Response, next: NextFunction) => {
  service
    .getById(Number(req.params.id))
    .then((record) =>
      res.json({
        data: record,
        warning: "⚠️ VULNERABLE: no owner check. Any authenticated user can read any request.",
      }),
    )
    .catch(next);
};
