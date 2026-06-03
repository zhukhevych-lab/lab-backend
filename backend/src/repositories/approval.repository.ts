import { all, get, run, logSql } from "../db/dbClient";

export type Approval = {
  id: number;
  accessRequestId: number;
  approverId: number;
  decision: string;
  notes: string;
  createdAt: string;
};

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

export const DECISIONS = ["Approved", "Rejected"];

const SORT_ALLOWLIST = new Set(["id", "decision", "createdAt"]);

export const getAll = async (filters?: {
  decision?: string;
  accessRequestId?: number;
  sortBy?: string;
  order?: string;
  page?: number;
  pageSize?: number;
}): Promise<Approval[]> => {
  const params: (string | number)[] = [];
  const conditions: string[] = ["1=1"];

  if (filters?.decision) {
    conditions.push("decision = ?");
    params.push(filters.decision);
  }
  if (filters?.accessRequestId) {
    conditions.push("accessRequestId = ?");
    params.push(filters.accessRequestId);
  }

  const sortBy = SORT_ALLOWLIST.has(filters?.sortBy ?? "") ? filters!.sortBy! : "id";
  const order = filters?.order === "asc" ? "ASC" : "DESC";
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 10;
  const offset = (page - 1) * pageSize;

  const sql = `
    SELECT id, accessRequestId, approverId, decision, notes, createdAt
    FROM Approvals
    WHERE ${conditions.join(" AND ")}
    ORDER BY ${sortBy} ${order}
    LIMIT ? OFFSET ?;
  `;
  params.push(pageSize, offset);
  logSql(sql);
  return all<Approval>(sql, params);
};

export const getById = async (id: number): Promise<Approval | undefined> => {
  const sql = `SELECT id, accessRequestId, approverId, decision, notes, createdAt FROM Approvals WHERE id = ?;`;
  logSql(sql);
  return get<Approval>(sql, [id]);
};

export const create = async (data: CreateInput): Promise<Approval> => {
  const now = new Date().toISOString();
  const sql = `
    INSERT INTO Approvals (accessRequestId, approverId, decision, notes, createdAt)
    VALUES (?, ?, ?, ?, ?);
  `;
  logSql(sql);
  const result = await run(sql, [
    data.accessRequestId,
    data.approverId,
    data.decision,
    data.notes,
    now,
  ]);
  return (await getById(result.lastID))!;
};

export const update = async (id: number, data: UpdateInput): Promise<Approval | null> => {
  const existing = await getById(id);
  if (!existing) return null;

  const decision = data.decision ?? existing.decision;
  const notes = data.notes ?? existing.notes;

  const sql = `UPDATE Approvals SET decision = ?, notes = ? WHERE id = ?;`;
  logSql(sql);
  const result = await run(sql, [decision, notes, id]);
  if (result.changes === 0) return null;
  return (await getById(id))!;
};

export const remove = async (id: number): Promise<boolean> => {
  const sql = `DELETE FROM Approvals WHERE id = ?;`;
  logSql(sql);
  const result = await run(sql, [id]);
  return result.changes > 0;
};
