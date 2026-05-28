import { all, get, run, logSql } from "../db/dbClient";

export type AccessRequest = {
  id: number;
  userId: number;
  date: string;
  accessType: string;
  comments: string;
  status: string;
  createdAt: string;
};

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

export const ACCESS_TYPES = ["Read", "Write", "Admin"];
export const STATUSES = ["Pending", "Approved", "Rejected"];

export const getAll = async (filters?: {
  status?: string;
  accessType?: string;
  sortBy?: string;
  order?: string;
  page?: number;
  pageSize?: number;
}): Promise<AccessRequest[]> => {
  let where = "WHERE 1=1";
  if (filters?.status) {
    where += ` AND status = '${filters.status.replace(/'/g, "''")}'`;
  }
  if (filters?.accessType) {
    where += ` AND accessType = '${filters.accessType.replace(/'/g, "''")}'`;
  }

  const sortBy = ["id", "date", "status", "createdAt"].includes(
    filters?.sortBy ?? "",
  )
    ? filters!.sortBy
    : "id";
  const order = filters?.order === "asc" ? "ASC" : "DESC";
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 10;
  const offset = (page - 1) * pageSize;

  const sql = `
    SELECT id, userId, date, accessType, comments, status, createdAt
    FROM AccessRequests
    ${where}
    ORDER BY ${sortBy} ${order}
    LIMIT ${pageSize} OFFSET ${offset};
  `;
  logSql(sql);
  return all<AccessRequest>(sql);
};

export const getById = async (
  id: number,
): Promise<AccessRequest | undefined> => {
  const sql = `
    SELECT id, userId, date, accessType, comments, status, createdAt
    FROM AccessRequests WHERE id = ${id};
  `;
  logSql(sql);
  return get<AccessRequest>(sql);
};

export const getWithUser = async (id: number): Promise<unknown> => {
  const sql = `
    SELECT
      ar.id, ar.date, ar.accessType, ar.comments, ar.status, ar.createdAt,
      u.id AS userId, u.name AS userName, u.email AS userEmail
    FROM AccessRequests ar
    JOIN Users u ON u.id = ar.userId
    WHERE ar.id = ${id};
  `;
  logSql(sql);
  return get(sql);
};

export const create = async (data: CreateInput): Promise<AccessRequest> => {
  const now = new Date().toISOString();
  const comments = data.comments.replace(/'/g, "''");
  const sql = `
    INSERT INTO AccessRequests (userId, date, accessType, comments, status, createdAt)
    VALUES (${data.userId}, '${data.date}', '${data.accessType}', '${comments}', 'Pending', '${now}');
  `;
  logSql(sql);
  const result = await run(sql);
  return (await getById(result.lastID))!;
};

export const update = async (
  id: number,
  data: UpdateInput,
): Promise<AccessRequest | null> => {
  const existing = await getById(id);
  if (!existing) return null;

  const date = data.date ?? existing.date;
  const accessType = data.accessType ?? existing.accessType;
  const comments = (data.comments ?? existing.comments).replace(/'/g, "''");
  const status = data.status ?? existing.status;

  const sql = `
    UPDATE AccessRequests
    SET date = '${date}', accessType = '${accessType}',
        comments = '${comments}', status = '${status}'
    WHERE id = ${id};
  `;
  logSql(sql);
  const result = await run(sql);
  if (result.changes === 0) return null;
  return (await getById(id))!;
};

export const remove = async (id: number): Promise<boolean> => {
  const sql = `DELETE FROM AccessRequests WHERE id = ${id};`;
  logSql(sql);
  const result = await run(sql);
  return result.changes > 0;
};

export const searchByComments = async (q: string): Promise<AccessRequest[]> => {
  const sql = `
    SELECT id, userId, date, accessType, comments, status, createdAt
    FROM AccessRequests
    WHERE comments LIKE '%${q}%'
    ORDER BY id DESC;
  `;
  logSql(sql);
  return all<AccessRequest>(sql);
};

export const getStats = async (): Promise<unknown> => {
  const sql = `
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) AS approved,
      SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) AS rejected
    FROM AccessRequests;
  `;
  logSql(sql);
  return get(sql);
};