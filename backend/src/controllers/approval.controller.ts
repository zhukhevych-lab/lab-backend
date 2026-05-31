import { Request, Response, NextFunction } from "express";
import * as service from "../services/approval.service";
import CreateApprovalDto from "../dtos/CreateApprovalDto";
import UpdateApprovalDto from "../dtos/UpdateApprovalDto";
import ApprovalResponseDto from "../dtos/ApprovalResponseDto";

type IdParams = { id: string };
type Query = Record<string, string | undefined>;

export const getAll = async (
  req: Request<IdParams, unknown, unknown, Query>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await service.getAll({
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
      page: result.page,
      pageSize: result.pageSize,
    });
  } catch (err) {
    next(err);
  }
};

export const getById = async (
  req: Request<IdParams>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const record = await service.getById(Number(req.params.id));
    return res.json(new ApprovalResponseDto(record));
  } catch (err) {
    next(err);
  }
};

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const dto = new CreateApprovalDto(req.body);
    const record = await service.create({
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

export const update = async (
  req: Request<IdParams>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const dto = new UpdateApprovalDto(req.body);
    const record = await service.update(Number(req.params.id), {
      decision: dto.decision,
      notes: dto.notes,
    });
    return res.json(new ApprovalResponseDto(record));
  } catch (err) {
    next(err);
  }
};

export const remove = async (
  req: Request<IdParams>,
  res: Response,
  next: NextFunction,
) => {
  try {
    await service.remove(Number(req.params.id));
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};