type CreateApprovalInput = {
  accessRequestId?: unknown;
  approverId?: unknown;
  decision?: unknown;
  notes?: unknown;
};

class CreateApprovalDto {
  public accessRequestId: number;
  public approverId: number;
  public decision: string;
  public notes: string;

  constructor(data: CreateApprovalInput) {
    this.accessRequestId =
      typeof data.accessRequestId === "number" ? data.accessRequestId : 0;
    this.approverId =
      typeof data.approverId === "number" ? data.approverId : 0;
    this.decision =
      typeof data.decision === "string" ? data.decision.trim() : "";
    this.notes = typeof data.notes === "string" ? data.notes.trim() : "";
  }
}

export default CreateApprovalDto;