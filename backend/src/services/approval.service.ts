import * as repo from "../repositories/approval.repository";
import { Approval, DECISIONS } from "../repositories/approval.repository";
import AppError from "../utils/AppError";

type CreateInput = {
  accessRequestId: number;
  approverId: number;
  decision: string;
  notes: string;
};

type UpdateInput = {
  decision?: string;
  notes?: string;
};

type GetAllQuery = {
  page?: number;
  pageSize?: number;
  decision?: string;
  accessRequestId?: number;
  sortBy?: "id" | "decision" | "createdAt";
  order?: "asc" | "desc";
};

export const getAll = (query?: GetAllQuery) => {
  let records = repo.getAll();

  if (query?.decision) {
    records = records.filter((r) => r.decision === query.decision);
  }

  if (query?.accessRequestId) {
    records = records.filter(
      (r) => r.accessRequestId === query.accessRequestId,
    );
  }

  if (query?.sortBy) {
    const order = query.order === "desc" ? -1 : 1;
    records.sort((a, b) => {
      const aVal = a[query.sortBy as keyof Approval];
      const bVal = b[query.sortBy as keyof Approval];
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

export const getById = (id: number): Approval => {
  if (Number.isNaN(id)) throw new AppError(400, "Invalid id");
  const record = repo.getById(id);
  if (!record) throw new AppError(404, "Approval not found");
  return record;
};

export const create = (data: CreateInput): Approval => {
  const errors: string[] = [];

  if (!data.accessRequestId || Number.isNaN(data.accessRequestId))
    errors.push("accessRequestId is required and must be a number");

  if (!data.approverId || Number.isNaN(data.approverId))
    errors.push("approverId is required and must be a number");

  if (!data.decision || !data.decision.trim())
    errors.push("decision is required");
  else if (!DECISIONS.includes(data.decision))
    errors.push(`decision must be one of: ${DECISIONS.join(", ")}`);

  if (!data.notes || !data.notes.trim()) errors.push("notes is required");
  else if (data.notes.trim().length < 3)
    errors.push("notes must be at least 3 characters");

  if (errors.length) throw new AppError(400, "Validation error", errors);

  return repo.create(data);
};

export const update = (id: number, data: UpdateInput): Approval => {
  if (Number.isNaN(id)) throw new AppError(400, "Invalid id");

  const errors: string[] = [];

  if (data.decision !== undefined && !DECISIONS.includes(data.decision))
    errors.push(`decision must be one of: ${DECISIONS.join(", ")}`);

  if (data.notes !== undefined && data.notes.trim().length < 3)
    errors.push("notes must be at least 3 characters");

  if (errors.length) throw new AppError(400, "Validation error", errors);

  const updated = repo.update(id, data);
  if (!updated) throw new AppError(404, "Approval not found");
  return updated;
};

export const remove = (id: number): void => {
  if (Number.isNaN(id)) throw new AppError(400, "Invalid id");
  const ok = repo.remove(id);
  if (!ok) throw new AppError(404, "Approval not found");
};