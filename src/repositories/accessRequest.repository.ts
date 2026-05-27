export type AccessRequest = {
  id: number;
  userId: number;
  date: string;
  accessType: string;
  comments: string;
  status: string;
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

const ACCESS_TYPES = ["Read", "Write", "Admin"];
const STATUSES = ["Pending", "Approved", "Rejected"];

export { ACCESS_TYPES, STATUSES };

const records: AccessRequest[] = [];
let nextId = 1;

export const getAll = (): AccessRequest[] => [...records];

export const getById = (id: number): AccessRequest | undefined =>
  records.find((r) => r.id === id);

export const create = (data: CreateInput): AccessRequest => {
  const record: AccessRequest = {
    id: nextId++,
    status: "Pending",
    ...data,
  };
  records.push(record);
  return record;
};

export const update = (id: number, data: UpdateInput): AccessRequest | null => {
  const index = records.findIndex((r) => r.id === id);
  if (index === -1) return null;
  records[index] = { ...records[index], ...data };
  return records[index];
};

export const remove = (id: number): boolean => {
  const index = records.findIndex((r) => r.id === id);
  if (index === -1) return false;
  records.splice(index, 1);
  return true;
};