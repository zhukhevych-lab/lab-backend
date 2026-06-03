import { all, get, run, logSql } from "../db/dbClient";

export type AccessRequest = {
  id: number;
  userId: number;
  ownerUserId: number; // ЛР5: власник заявки для IDOR-перевірки
  date: string;
  accessType: string;
  comments: string;
  status: string;
  createdAt: string;
};

type CreateInput = {
  userId: number;
  ownerUserId: number;
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

// ─── Allowlist для сортування ───────────────────────────────────────────────
// ЛР5 — Сценарій А: параметри ORDER BY не можна параметризувати → allowlist
const SORT_ALLOWLIST = new Set(["id", "date", "status", "createdAt"]);

export const getAll = async (filters?: {
  status?: string;
  accessType?: string;
  sortBy?: string;
  order?: string;
  page?: number;
  pageSize?: number;
}): Promise<AccessRequest[]> => {
  // ЛР5 — виправлення SQLi: значення фільтрів — через параметри ?
  const params: (string | number)[] = [];
  const conditions: string[] = ["1=1"];

  if (filters?.status) {
    conditions.push("status = ?");
    params.push(filters.status);
  }
  if (filters?.accessType) {
    conditions.push("accessType = ?");
    params.push(filters.accessType);
  }

  // ORDER BY через allowlist (параметризація тут не підходить)
  const sortBy = SORT_ALLOWLIST.has(filters?.sortBy ?? "") ? filters!.sortBy! : "id";
  const order = filters?.order === "asc" ? "ASC" : "DESC";

  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 10;
  const offset = (page - 1) * pageSize;

  const sql = `
    SELECT id, userId, ownerUserId, date, accessType, comments, status, createdAt
    FROM AccessRequests
    WHERE ${conditions.join(" AND ")}
    ORDER BY ${sortBy} ${order}
    LIMIT ? OFFSET ?;
  `;
  params.push(pageSize, offset);
  logSql(sql);
  return all<AccessRequest>(sql, params);
};

export const getById = async (id: number): Promise<AccessRequest | undefined> => {
  // ЛР5 — параметризований запит
  const sql = `
    SELECT id, userId, ownerUserId, date, accessType, comments, status, createdAt
    FROM AccessRequests WHERE id = ?;
  `;
  logSql(sql);
  return get<AccessRequest>(sql, [id]);
};

/**
 * ЛР5 — Сценарій В: IDOR-захист
 * Повертає заявку тільки якщо ownerUserId збігається з поточним користувачем.
 * Одна операція до БД — немає другого запиту.
 */
export const getByIdForOwner = async (
  id: number,
  ownerUserId: number,
): Promise<AccessRequest | undefined> => {
  const sql = `
    SELECT id, userId, ownerUserId, date, accessType, comments, status, createdAt
    FROM AccessRequests WHERE id = ? AND ownerUserId = ?;
  `;
  logSql(sql);
  return get<AccessRequest>(sql, [id, ownerUserId]);
};

export const getWithUser = async (id: number): Promise<unknown> => {
  const sql = `
    SELECT
      ar.id, ar.date, ar.accessType, ar.comments, ar.status, ar.createdAt,
      u.id AS userId, u.name AS userName, u.email AS userEmail
    FROM AccessRequests ar
    JOIN Users u ON u.id = ar.userId
    WHERE ar.id = ?;
  `;
  logSql(sql);
  return get(sql, [id]);
};

export const create = async (data: CreateInput): Promise<AccessRequest> => {
  const now = new Date().toISOString();
  // ЛР5 — параметризований INSERT
  const sql = `
    INSERT INTO AccessRequests (userId, ownerUserId, date, accessType, comments, status, createdAt)
    VALUES (?, ?, ?, ?, ?, 'Pending', ?);
  `;
  logSql(sql);
  const result = await run(sql, [
    data.userId,
    data.ownerUserId,
    data.date,
    data.accessType,
    data.comments,
    now,
  ]);
  return (await getById(result.lastID))!;
};

export const update = async (id: number, data: UpdateInput): Promise<AccessRequest | null> => {
  const existing = await getById(id);
  if (!existing) return null;

  const date = data.date ?? existing.date;
  const accessType = data.accessType ?? existing.accessType;
  const comments = data.comments ?? existing.comments;
  const status = data.status ?? existing.status;

  // ЛР5 — параметризований UPDATE
  const sql = `
    UPDATE AccessRequests
    SET date = ?, accessType = ?, comments = ?, status = ?
    WHERE id = ?;
  `;
  logSql(sql);
  const result = await run(sql, [date, accessType, comments, status, id]);
  if (result.changes === 0) return null;
  return (await getById(id))!;
};

/**
 * ЛР5 — IDOR-захист: оновлення тільки свого ресурсу
 */
export const updateForOwner = async (
  id: number,
  ownerUserId: number,
  data: UpdateInput,
): Promise<AccessRequest | null> => {
  const existing = await getByIdForOwner(id, ownerUserId);
  if (!existing) return null;
  return update(id, data);
};

export const remove = async (id: number): Promise<boolean> => {
  const sql = `DELETE FROM AccessRequests WHERE id = ?;`;
  logSql(sql);
  const result = await run(sql, [id]);
  return result.changes > 0;
};

/**
 * ЛР5 — IDOR-захист: видалення тільки свого ресурсу
 */
export const removeForOwner = async (id: number, ownerUserId: number): Promise<boolean> => {
  const sql = `DELETE FROM AccessRequests WHERE id = ? AND ownerUserId = ?;`;
  logSql(sql);
  const result = await run(sql, [id, ownerUserId]);
  return result.changes > 0;
};

/**
 * ЛР5 — Сценарій А: демонстрація вразливого пошуку (ЗАЛИШЕНО НАВМИСНО для PoC)
 * Endpoint /api/v1/access-requests/search?q=...
 * Після демонстрації → виправлений варіант searchByCommentsSafe
 */
export const searchByCommentsVulnerable = async (q: string): Promise<AccessRequest[]> => {
  // НАВМИСНО вразливий — конкатенація рядка в SQL
  const sql = `
    SELECT id, userId, ownerUserId, date, accessType, comments, status, createdAt
    FROM AccessRequests
    WHERE comments LIKE '%${q}%'
    ORDER BY id DESC;
  `;
  logSql(sql);
  return all<AccessRequest>(sql);
};

/**
 * ЛР5 — Сценарій А: ВИПРАВЛЕНИЙ пошук через параметризований запит
 */
export const searchByCommentsSafe = async (q: string): Promise<AccessRequest[]> => {
  const sql = `
    SELECT id, userId, ownerUserId, date, accessType, comments, status, createdAt
    FROM AccessRequests
    WHERE comments LIKE ?
    ORDER BY id DESC;
  `;
  logSql(sql);
  return all<AccessRequest>(sql, [`%${q}%`]);
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
