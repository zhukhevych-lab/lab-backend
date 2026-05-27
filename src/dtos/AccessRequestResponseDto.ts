type AccessRequestModel = {
  id: number;
  userId: number;
  date: string;
  accessType: string;
  comments: string;
  status: string;
};

class AccessRequestResponseDto {
  public id: number;
  public userId: number;
  public date: string;
  public accessType: string;
  public comments: string;
  public status: string;

  constructor(model: AccessRequestModel) {
    this.id = model.id;
    this.userId = model.userId;
    this.date = model.date;
    this.accessType = model.accessType;
    this.comments = model.comments;
    this.status = model.status;
  }
}

export default AccessRequestResponseDto;