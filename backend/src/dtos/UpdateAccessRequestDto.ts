type UpdateAccessRequestInput = {
  date?: unknown;
  accessType?: unknown;
  comments?: unknown;
  status?: unknown;
};

class UpdateAccessRequestDto {
  public date?: string;
  public accessType?: string;
  public comments?: string;
  public status?: string;

  constructor(data: UpdateAccessRequestInput = {}) {
    this.date = typeof data.date === "string" ? data.date.trim() : undefined;
    this.accessType =
      typeof data.accessType === "string" ? data.accessType.trim() : undefined;
    this.comments =
      typeof data.comments === "string" ? data.comments.trim() : undefined;
    this.status =
      typeof data.status === "string" ? data.status.trim() : undefined;
  }
}

export default UpdateAccessRequestDto;