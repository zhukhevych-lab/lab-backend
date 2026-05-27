import * as repo from "../repositories/user.repository";
import { User } from "../repositories/user.repository";
import AppError from "../utils/AppError";

type CreateUserInput = {
  name: string;
  email: string;
};

type UpdateUserInput = {
  name?: string;
  email?: string;
};

type GetAllQuery = {
  page?: number;
  pageSize?: number;
  sortBy?: "id" | "name" | "email";
  order?: "asc" | "desc";
  name?: string;
};

export const getAll = (query?: GetAllQuery) => {
  let users = repo.getAll();

  if (query?.name) {
    const search = query.name.toLowerCase();
    users = users.filter((u) => u.name.toLowerCase().includes(search));
  }

  if (query?.sortBy) {
    const order = query.order === "desc" ? -1 : 1;
    users.sort((a, b) => {
      const aVal = a[query.sortBy as keyof User];
      const bVal = b[query.sortBy as keyof User];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return aVal.localeCompare(bVal) * order;
      }
      return (aVal < bVal ? -1 : aVal > bVal ? 1 : 0) * order;
    });
  }

  const page = Number(query?.page || 1);
  const pageSize = Number(query?.pageSize || 10);
  const start = (page - 1) * pageSize;
  const items = users.slice(start, start + pageSize);

  return {
    items,
    total: users.length,
    page,
    pageSize,
    totalPages: Math.ceil(users.length / pageSize),
  };
};

export const getById = (id: number): User => {
  if (Number.isNaN(id)) throw new AppError(400, "Invalid id");
  const user = repo.getById(id);
  if (!user) throw new AppError(404, "User not found");
  return user;
};

export const create = (data: CreateUserInput): User => {
  const errors: string[] = [];

  if (!data.name || !data.name.trim()) errors.push("name is required");
  else if (data.name.trim().length < 2)
    errors.push("name must be at least 2 characters");

  if (!data.email || !data.email.trim()) errors.push("email is required");
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.push("email is invalid");

  if (errors.length) throw new AppError(400, "Validation error", errors);

  return repo.create({ name: data.name.trim(), email: data.email.trim() });
};

export const update = (id: number, data: UpdateUserInput): User => {
  if (Number.isNaN(id)) throw new AppError(400, "Invalid id");

  const errors: string[] = [];

  if (data.name !== undefined && !data.name.trim())
    errors.push("name cannot be empty");

  if (data.email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.push("email is invalid");

  if (errors.length) throw new AppError(400, "Validation error", errors);

  const updated = repo.update(id, data);
  if (!updated) throw new AppError(404, "User not found");
  return updated;
};

export const remove = (id: number): void => {
  if (Number.isNaN(id)) throw new AppError(400, "Invalid id");
  const ok = repo.remove(id);
  if (!ok) throw new AppError(404, "User not found");
};