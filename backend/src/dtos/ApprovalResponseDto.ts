type ApprovalModel = {
  id: number;
  accessRequestId: number;
  approverId: number;
  decision: string;
  notes: string;
  createdAt: string;
};

class ApprovalResponseDto {
  public id: number;
  public accessRequestId: number;
  public approverId: number;
  public decision: string;
  public notes: string;
  public createdAt: string;

  constructor(model: ApprovalModel) {
    this.id = model.id;
    this.accessRequestId = model.accessRequestId;
    this.approverId = model.approverId;
    this.decision = model.decision;
    this.notes = model.notes;
    this.createdAt = model.createdAt;
  }
}

export default ApprovalResponseDto;