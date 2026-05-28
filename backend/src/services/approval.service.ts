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
  sortBy?: string;
  order?: string;
};

export const getAll = async (query?: GetAllQuery) => {
  const items = await repo.getAll(query);
  return { items, page: query?.page ?? 1, pageSize: query?.pageSize ?? 10 };
};

export const getById = async (id: number): Promise<Approval> => {
  if (Number.isNaN(id)) throw new AppError(400, "Invalid id");
  const record = await repo.getById(id);
  if (!record) throw new AppError(404, "Approval not found");
  return record;
};

export const create = async (data: CreateInput): Promise<Approval> => {
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

export const update = async (
  id: number,
  data: UpdateInput,
): Promise<Approval> => {
  if (Number.isNaN(id)) throw new AppError(400, "Invalid id");

  const errors: string[] = [];

  if (data.decision !== undefined && !DECISIONS.includes(data.decision))
    errors.push(`decision must be one of: ${DECISIONS.join(", ")}`);

  if (data.notes !== undefined && data.notes.trim().length < 3)
    errors.push("notes must be at least 3 characters");

  if (errors.length) throw new AppError(400, "Validation error", errors);

  const updated = await repo.update(id, data);
  if (!updated) throw new AppError(404, "Approval not found");
  return updated;
};

export const remove = async (id: number): Promise<void> => {
  if (Number.isNaN(id)) throw new AppError(400, "Invalid id");
  const ok = await repo.remove(id);
  if (!ok) throw new AppError(404, "Approval not found");
};