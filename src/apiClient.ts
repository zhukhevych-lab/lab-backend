import { API_BASE_URL, REQUEST_TIMEOUT_MS } from "./config";
import type {
  AccessRequest,
  ApiListResponse,
  ApiError,
  CreateAccessRequestDto,
  UpdateAccessRequestDto,
} from "./dtos/index";

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;

  try {
    response = await fetch(url, { ...options, signal: controller.signal });
  } catch (e: unknown) {
    clearTimeout(timeoutId);
    const isAbort = e instanceof DOMException && e.name === "AbortError";
    const err: ApiError = {
      status: 0,
      message: isAbort
        ? "Запит перевищив ліміт часу (10 с)"
        : "Помилка мережі або CORS. Перевірте що бекенд запущений.",
      details: e instanceof Error ? e.message : String(e),
    };
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (response.status === 204) return null as unknown as T;

  const rawText = await response.text();

  if (response.ok) {
    if (!rawText) return null as unknown as T;
    try {
      return JSON.parse(rawText) as T;
    } catch {
      return rawText as unknown as T;
    }
  }

  let payload: Record<string, unknown> | null = null;
  try {
    payload = rawText ? JSON.parse(rawText) : null;
  } catch { /* ok */ }

  const err: ApiError = {
    status: response.status,
    message:
      (payload?.error as Record<string, unknown>)?.message as string ??
      (payload?.message as string) ??
      "HTTP помилка",
    details:
      ((payload?.error as Record<string, unknown>)?.details as string[]) ??
      rawText ??
      `HTTP ${response.status}`,
  };
  throw err;
}

// --- Users ---
export interface User {
  id: number;
  name: string;
  email: string;
  createdAt?: string;
}

export async function getUsers(): Promise<{ items: User[]; total: number }> {
  return request<{ items: User[]; total: number }>("/users");
}

export async function createUser(data: { name: string; email: string }): Promise<User> {
  return request<User>("/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function updateUser(id: number, data: { name?: string; email?: string }): Promise<User> {
  return request<User>(`/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deleteUser(id: number): Promise<void> {
  return request<void>(`/users/${id}`, { method: "DELETE" });
}

// --- AccessRequests ---
export async function getAccessRequests(params?: {
  status?: string;
  sortBy?: string;
  order?: string;
  page?: number;
  pageSize?: number;
}): Promise<ApiListResponse<AccessRequest>> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.sortBy) query.set("sortBy", params.sortBy);
  if (params?.order) query.set("order", params.order);
  if (params?.page) query.set("page", String(params.page));
  if (params?.pageSize) query.set("pageSize", String(params.pageSize));
  const qs = query.toString();
  return request<ApiListResponse<AccessRequest>>(
    `/access-requests${qs ? `?${qs}` : ""}`,
  );
}

export async function createAccessRequest(dto: CreateAccessRequestDto): Promise<AccessRequest> {
  return request<AccessRequest>("/access-requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
}

export async function updateAccessRequest(id: number, dto: UpdateAccessRequestDto): Promise<AccessRequest> {
  return request<AccessRequest>(`/access-requests/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
}

export async function deleteAccessRequest(id: number): Promise<void> {
  return request<void>(`/access-requests/${id}`, { method: "DELETE" });
}

// --- Approvals ---
export interface Approval {
  id: number;
  accessRequestId: number;
  approverId: number;
  decision: string;
  notes: string;
  createdAt: string;
}

export async function getApprovals(params?: {
  decision?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ items: Approval[]; page: number; pageSize: number }> {
  const query = new URLSearchParams();
  if (params?.decision) query.set("decision", params.decision);
  if (params?.page) query.set("page", String(params.page));
  if (params?.pageSize) query.set("pageSize", String(params.pageSize));
  const qs = query.toString();
  return request<{ items: Approval[]; page: number; pageSize: number }>(
    `/approvals${qs ? `?${qs}` : ""}`,
  );
}

export async function createApproval(data: {
  accessRequestId: number;
  approverId: number;
  decision: string;
  notes: string;
}): Promise<Approval> {
  return request<Approval>("/approvals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deleteApproval(id: number): Promise<void> {
  return request<void>(`/approvals/${id}`, { method: "DELETE" });
}