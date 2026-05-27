export type User = {
  id: number;
  name: string;
  email: string;
};

type CreateUserInput = {
  name: string;
  email: string;
};

type UpdateUserInput = {
  name?: string;
  email?: string;
};

const users: User[] = [];
let nextId = 1;

export const getAll = (): User[] => [...users];

export const getById = (id: number): User | undefined =>
  users.find((u) => u.id === id);

export const create = (data: CreateUserInput): User => {
  const user: User = { id: nextId++, ...data };
  users.push(user);
  return user;
};

export const update = (id: number, data: UpdateUserInput): User | null => {
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return null;
  users[index] = { ...users[index], ...data };
  return users[index];
};

export const remove = (id: number): boolean => {
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return false;
  users.splice(index, 1);
  return true;
};