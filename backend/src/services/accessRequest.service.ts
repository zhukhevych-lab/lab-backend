import * as repo from "../repositories/accessRequest.repository";
import { AccessRequest, ACCESS_TYPES, STATUSES } from "../repositories/accessRequest.repository";
import AppError from "../utils/AppError";

type CreateInput = {
  userId: number;
  ownerUserId: number; // ЛР5: береться з req.user.id — не з тіла запиту
  date: string;
  accessType: string;
  comments: string;
};

type UpdateInput = {
  date?: string;
  accessType?: string;
  comments?: string;
  status?: string;
};

type GetAllQuery = {
  page?: number;
  pageSize?: number;
  status?: string;
  accessType?: string;
  sortBy?: string;
  order?: string;
};

export const getAll = async (query?: GetAllQuery) => {
  const items = await repo.getAll(query);
  return { items, page: query?.page ?? 1, pageSize: query?.pageSize ?? 10 };
};

export const getById = async (id: number): Promise<AccessRequest> => {
  if (Number.isNaN(id)) throw new AppError(400, "Invalid id");
  const record = await repo.getById(id);
  if (!record) throw new AppError(404, "Access request not found");
  return record;
};

/**
 * ЛР5 — Сценарій В: IDOR-захист
 * Повертає 404 (а не 403) — не розкриваємо факт існування чужого ресурсу
 */
export const getByIdForOwner = async (id: number, ownerUserId: number): Promise<AccessRequest> => {
  if (Number.isNaN(id)) throw new AppError(400, "Invalid id");
  const record = await repo.getByIdForOwner(id, ownerUserId);
  if (!record) throw new AppError(404, "Access request not found");
  return record;
};

export const getWithUser = async (id: number) => {
  if (Number.isNaN(id)) throw new AppError(400, "Invalid id");
  const record = await repo.getWithUser(id);
  if (!record) throw new AppError(404, "Access request not found");
  return record;
};

export const getStats = async () => repo.getStats();

/**
 * ЛР5 — Сценарій А (demo): вразливий пошук — лише для PoC-демонстрації
 */
export const searchVulnerable = async (q: string) =>
  repo.searchByCommentsVulnerable(q);

/**
 * ЛР5 — Сценарій А (fix): безпечний пошук
 */
export const searchSafe = async (q: string) =>
  repo.searchByCommentsSafe(q);

export const create = async (data: CreateInput): Promise<AccessRequest> => {
  const errors: string[] = [];

  if (!data.userId || Number.isNaN(data.userId))
    errors.push("userId is required and must be a number");
  if (!data.date?.trim()) errors.push("date is required");
  else if (isNaN(Date.parse(data.date))) errors.push("date must be a valid ISO string");
  if (!data.accessType?.trim()) errors.push("accessType is required");
  else if (!ACCESS_TYPES.includes(data.accessType))
    errors.push(`accessType must be one of: ${ACCESS_TYPES.join(", ")}`);
  if (!data.comments?.trim()) errors.push("comments is required");
  else if (data.comments.trim().length < 3)
    errors.push("comments must be at least 3 characters");

  if (errors.length) throw new AppError(400, "Validation error", errors);
  return repo.create(data);
};

export const update = async (
  id: number,
  ownerUserId: number,
  data: UpdateInput,
): Promise<AccessRequest> => {
  if (Number.isNaN(id)) throw new AppError(400, "Invalid id");

  const errors: string[] = [];
  if (data.date !== undefined && isNaN(Date.parse(data.date)))
    errors.push("date must be a valid ISO string");
  if (data.accessType !== undefined && !ACCESS_TYPES.includes(data.accessType))
    errors.push(`accessType must be one of: ${ACCESS_TYPES.join(", ")}`);
  if (data.status !== undefined && !STATUSES.includes(data.status))
    errors.push(`status must be one of: ${STATUSES.join(", ")}`);
  if (data.comments !== undefined && data.comments.trim().length < 3)
    errors.push("comments must be at least 3 characters");
  if (errors.length) throw new AppError(400, "Validation error", errors);

  // ЛР5: оновлення тільки власного ресурсу
  const updated = await repo.updateForOwner(id, ownerUserId, data);
  if (!updated) throw new AppError(404, "Access request not found");
  return updated;
};

export const remove = async (id: number, ownerUserId: number): Promise<void> => {
  if (Number.isNaN(id)) throw new AppError(400, "Invalid id");
  // ЛР5: видалення тільки власного ресурсу
  const ok = await repo.removeForOwner(id, ownerUserId);
  if (!ok) throw new AppError(404, "Access request not found");
};