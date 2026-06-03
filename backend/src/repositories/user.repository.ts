import { all, get, run, logSql } from "../db/dbClient";

export type User = {
  id: number;
  name: string;
  email: string;
  createdAt: string;
};

type CreateUserInput = {
  name: string;
  email: string;
};

type UpdateUserInput = {
  name?: string;
  email?: string;
};

export const getAll = async (): Promise<User[]> => {
  const sql = "SELECT id, name, email, createdAt FROM Users ORDER BY id DESC;";
  logSql(sql);
  return all<User>(sql);
};

export const getById = async (id: number): Promise<User | undefined> => {
  // ЛР5 — параметризований запит
  const sql = `SELECT id, name, email, createdAt FROM Users WHERE id = ?;`;
  logSql(sql);
  return get<User>(sql, [id]);
};

export const create = async (data: CreateUserInput): Promise<User> => {
  const now = new Date().toISOString();
  // ЛР5 — параметризований INSERT
  const sql = `INSERT INTO Users (name, email, createdAt) VALUES (?, ?, ?);`;
  logSql(sql);
  const result = await run(sql, [data.name, data.email, now]);
  return (await getById(result.lastID))!;
};

export const update = async (id: number, data: UpdateUserInput): Promise<User | null> => {
  const existing = await getById(id);
  if (!existing) return null;

  const name = data.name ?? existing.name;
  const email = data.email ?? existing.email;

  // ЛР5 — параметризований UPDATE
  const sql = `UPDATE Users SET name = ?, email = ? WHERE id = ?;`;
  logSql(sql);
  const result = await run(sql, [name, email, id]);
  if (result.changes === 0) return null;
  return (await getById(id))!;
};

export const remove = async (id: number): Promise<boolean> => {
  const sql = `DELETE FROM Users WHERE id = ?;`;
  logSql(sql);
  const result = await run(sql, [id]);
  return result.changes > 0;
};
