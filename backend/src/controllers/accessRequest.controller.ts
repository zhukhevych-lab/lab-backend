import { Request, Response, NextFunction } from "express";
import * as service from "../services/accessRequest.service";
import CreateAccessRequestDto from "../dtos/CreateAccessRequestDto";
import UpdateAccessRequestDto from "../dtos/UpdateAccessRequestDto";
import AccessRequestResponseDto from "../dtos/AccessRequestResponseDto";

type IdParams = { id: string };
type Query = Record<string, string | undefined>;

export const getAll = (
  req: Request<IdParams, unknown, unknown, Query>,
  res: Response,
) => {
  const result = service.getAll({
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 10,
    status: req.query.status,
    accessType: req.query.accessType,
    sortBy: req.query.sortBy as "id" | "date" | "status" | undefined,
    order: req.query.order as "asc" | "desc" | undefined,
  });

  return res.json({
    items: result.items.map((r) => new AccessRequestResponseDto(r)),
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
    return res.json(new AccessRequestResponseDto(record));
  } catch (err) {
    next(err);
  }
};

export const create = (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = new CreateAccessRequestDto(req.body);
    const record = service.create({
      userId: dto.userId,
      date: dto.date,
      accessType: dto.accessType,
      comments: dto.comments,
    });
    return res.status(201).json(new AccessRequestResponseDto(record));
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
    const dto = new UpdateAccessRequestDto(req.body);
    const record = service.update(Number(req.params.id), {
      date: dto.date,
      accessType: dto.accessType,
      comments: dto.comments,
      status: dto.status,
    });
    return res.json(new AccessRequestResponseDto(record));
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