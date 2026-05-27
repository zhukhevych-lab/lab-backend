import * as repo from "../repositories/accessRequest.repository";
import { AccessRequest, ACCESS_TYPES, STATUSES } from "../repositories/accessRequest.repository";
import AppError from "../utils/AppError";

type CreateInput = {
  userId: number;
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
  sortBy?: "id" | "date" | "status";
  order?: "asc" | "desc";
};

export const getAll = (query?: GetAllQuery) => {
  let records = repo.getAll();

  if (query?.status) {
    records = records.filter((r) => r.status === query.status);
  }

  if (query?.accessType) {
    records = records.filter((r) => r.accessType === query.accessType);
  }

  if (query?.sortBy) {
    const order = query.order === "desc" ? -1 : 1;
    records.sort((a, b) => {
      const aVal = a[query.sortBy as keyof AccessRequest];
      const bVal = b[query.sortBy as keyof AccessRequest];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return aVal.localeCompare(bVal) * order;
      }
      return (aVal < bVal ? -1 : aVal > bVal ? 1 : 0) * order;
    });
  }

  const page = Number(query?.page || 1);
  const pageSize = Number(query?.pageSize || 10);
  const start = (page - 1) * pageSize;
  const items = records.slice(start, start + pageSize);

  return {
    items,
    total: records.length,
    page,
    pageSize,
    totalPages: Math.ceil(records.length / pageSize),
  };
};

export const getById = (id: number): AccessRequest => {
  if (Number.isNaN(id)) throw new AppError(400, "Invalid id");
  const record = repo.getById(id);
  if (!record) throw new AppError(404, "Access request not found");
  return record;
};

export const create = (data: CreateInput): AccessRequest => {
  const errors: string[] = [];

  if (!data.userId || Number.isNaN(data.userId))
    errors.push("userId is required and must be a number");

  if (!data.date || !data.date.trim()) errors.push("date is required");
  else if (isNaN(Date.parse(data.date))) errors.push("date must be a valid ISO string");

  if (!data.accessType || !data.accessType.trim())
    errors.push("accessType is required");
  else if (!ACCESS_TYPES.includes(data.accessType))
    errors.push(`accessType must be one of: ${ACCESS_TYPES.join(", ")}`);

  if (!data.comments || !data.comments.trim())
    errors.push("comments is required");
  else if (data.comments.trim().length < 3)
    errors.push("comments must be at least 3 characters");

  if (errors.length) throw new AppError(400, "Validation error", errors);

  return repo.create(data);
};

export const update = (id: number, data: UpdateInput): AccessRequest => {
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

  const updated = repo.update(id, data);
  if (!updated) throw new AppError(404, "Access request not found");
  return updated;
};

export const remove = (id: number): void => {
  if (Number.isNaN(id)) throw new AppError(400, "Invalid id");
  const ok = repo.remove(id);
  if (!ok) throw new AppError(404, "Access request not found");
};