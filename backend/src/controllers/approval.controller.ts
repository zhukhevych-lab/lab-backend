import { Request, Response, NextFunction } from "express";
import * as service from "../services/approval.service";
import CreateApprovalDto from "../dtos/CreateApprovalDto";
import UpdateApprovalDto from "../dtos/UpdateApprovalDto";
import ApprovalResponseDto from "../dtos/ApprovalResponseDto";

type IdParams = { id: string };
type Query = Record<string, string | undefined>;

export const getAll = (
  req: Request<IdParams, unknown, unknown, Query>,
  res: Response,
) => {
  const result = service.getAll({
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 10,
    decision: req.query.decision,
    accessRequestId: req.query.accessRequestId
      ? Number(req.query.accessRequestId)
      : undefined,
    sortBy: req.query.sortBy as "id" | "decision" | "createdAt" | undefined,
    order: req.query.order as "asc" | "desc" | undefined,
  });

  return res.json({
    items: result.items.map((r) => new ApprovalResponseDto(r)),
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
    totalPages: result.totalPages,
  });
};

export const getById = (
  req: Request<IdParams>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const record = service.getById(Number(req.params.id));
    return res.json(new ApprovalResponseDto(record));
  } catch (err) {
    next(err);
  }
};

export const create = (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = new CreateApprovalDto(req.body);
    const record = service.create({
      accessRequestId: dto.accessRequestId,
      approverId: dto.approverId,
      decision: dto.decision,
      notes: dto.notes,
    });
    return res.status(201).json(new ApprovalResponseDto(record));
  } catch (err) {
    next(err);
  }
};

export const update = (
  req: Request<IdParams>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const dto = new UpdateApprovalDto(req.body);
    const record = service.update(Number(req.params.id), {
      decision: dto.decision,
      notes: dto.notes,
    });
    return res.json(new ApprovalResponseDto(record));
  } catch (err) {
    next(err);
  }
};

export const remove = (
  req: Request<IdParams>,
  res: Response,
  next: NextFunction,
) => {
  try {
    service.remove(Number(req.params.id));
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};