export interface AccessRequest {
  id: number;
  userId: number;
  date: string;
  accessType: string;
  comments: string;
  status: string;
  createdAt: string;
}

export interface CreateAccessRequestDto {
  userId: number;
  date: string;
  accessType: string;
  comments: string;
}

export interface UpdateAccessRequestDto {
  date?: string;
  accessType?: string;
  comments?: string;
  status?: string;
}

export interface ApiListResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
}

export interface ApiError {
  status: number;
  message: string;
  details?: string | string[];
}