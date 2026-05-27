type CreateAccessRequestInput = {
  userId?: unknown;
  date?: unknown;
  accessType?: unknown;
  comments?: unknown;
};

class CreateAccessRequestDto {
  public userId: number;
  public date: string;
  public accessType: string;
  public comments: string;

  constructor(data: CreateAccessRequestInput) {
    this.userId = typeof data.userId === "number" ? data.userId : 0;
    this.date = typeof data.date === "string" ? data.date.trim() : "";
    this.accessType =
      typeof data.accessType === "string" ? data.accessType.trim() : "";
    this.comments =
      typeof data.comments === "string" ? data.comments.trim() : "";
  }
}

export default CreateAccessRequestDto;