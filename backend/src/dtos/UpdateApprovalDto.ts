type UpdateApprovalInput = {
  decision?: unknown;
  notes?: unknown;
};

class UpdateApprovalDto {
  public decision?: string;
  public notes?: string;

  constructor(data: UpdateApprovalInput = {}) {
    this.decision =
      typeof data.decision === "string" ? data.decision.trim() : undefined;
    this.notes =
      typeof data.notes === "string" ? data.notes.trim() : undefined;
  }
}

export default UpdateApprovalDto;