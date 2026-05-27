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

const records: Approval[] = [];
let nextId = 1;

export const getAll = (): Approval[] => [...records];

export const getById = (id: number): Approval | undefined =>
  records.find((r) => r.id === id);

export const getByAccessRequestId = (accessRequestId: number): Approval[] =>
  records.filter((r) => r.accessRequestId === accessRequestId);

export const create = (data: CreateInput): Approval => {
  const record: Approval = {
    id: nextId++,
    createdAt: new Date().toISOString(),
    ...data,
  };
  records.push(record);
  return record;
};

export const update = (id: number, data: UpdateInput): Approval | null => {
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