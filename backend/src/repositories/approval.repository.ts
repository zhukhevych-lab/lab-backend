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

export const getAll = async (filters?: {
  decision?: string;
  accessRequestId?: number;
  sortBy?: string;
  order?: string;
  page?: number;
  pageSize?: number;
}): Promise<Approval[]> => {
  let where = "WHERE 1=1";
  if (filters?.decision) {
    where += ` AND decision = '${filters.decision.replace(/'/g, "''")}'`;
  }
  if (filters?.accessRequestId) {
    where += ` AND accessRequestId = ${filters.accessRequestId}`;
  }

  const sortBy = ["id", "decision", "createdAt"].includes(filters?.sortBy ?? "")
    ? filters!.sortBy
    : "id";
  const order = filters?.order === "asc" ? "ASC" : "DESC";
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 10;
  const offset = (page - 1) * pageSize;

  const sql = `
    SELECT id, accessRequestId, approverId, decision, notes, createdAt
    FROM Approvals
    ${where}
    ORDER BY ${sortBy} ${order}
    LIMIT ${pageSize} OFFSET ${offset};
  `;
  logSql(sql);
  return all<Approval>(sql);
};

export const getById = async (id: number): Promise<Approval | undefined> => {
  const sql = `
    SELECT id, accessRequestId, approverId, decision, notes, createdAt
    FROM Approvals WHERE id = ${id};
  `;
  logSql(sql);
  return get<Approval>(sql);
};

export const create = async (data: CreateInput): Promise<Approval> => {
  const now = new Date().toISOString();
  const notes = data.notes.replace(/'/g, "''");
  const sql = `
    INSERT INTO Approvals (accessRequestId, approverId, decision, notes, createdAt)
    VALUES (${data.accessRequestId}, ${data.approverId}, '${data.decision}', '${notes}', '${now}');
  `;
  logSql(sql);
  const result = await run(sql);
  return (await getById(result.lastID))!;
};

export const update = async (
  id: number,
  data: UpdateInput,
): Promise<Approval | null> => {
  const existing = await getById(id);
  if (!existing) return null;

  const decision = data.decision ?? existing.decision;
  const notes = (data.notes ?? existing.notes).replace(/'/g, "''");

  const sql = `
    UPDATE Approvals
    SET decision = '${decision}', notes = '${notes}'
    WHERE id = ${id};
  `;
  logSql(sql);
  const result = await run(sql);
  if (result.changes === 0) return null;
  return (await getById(id))!;
};

export const remove = async (id: number): Promise<boolean> => {
  const sql = `DELETE FROM Approvals WHERE id = ${id};`;
  logSql(sql);
  const result = await run(sql);
  return result.changes > 0;
};