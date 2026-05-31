export const API_BASE_URL = "http://localhost:3000/api/v1";

export const ACCESS_TYPES = ["Read", "Write", "Admin"] as const;
export const STATUSES = ["Pending", "Approved", "Rejected"] as const;

export const REQUEST_TIMEOUT_MS = 10000;