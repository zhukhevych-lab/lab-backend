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
    sortBy: req.query.sortBy,
    order: req.query.order,
  });

  return result.then((data) =>
    res.json({
      items: data.items.map((r) => new AccessRequestResponseDto(r)),
      page: data.page,
      pageSize: data.pageSize,
    }),
  );
};

export const getById = (
  req: Request<IdParams>,
  res: Response,
  next: NextFunction,
) => {
  service
    .getById(Number(req.params.id))
    .then((record) => res.json(new AccessRequestResponseDto(record)))
    .catch(next);
};

export const getWithUser = (
  req: Request<IdParams>,
  res: Response,
  next: NextFunction,
) => {
  service
    .getWithUser(Number(req.params.id))
    .then((record) => res.json({ data: record }))
    .catch(next);
};

export const getStats = (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  service
    .getStats()
    .then((stats) => res.json({ data: stats }))
    .catch(next);
};

export const search = (
  req: Request<IdParams, unknown, unknown, Query>,
  res: Response,
  next: NextFunction,
) => {
  const q = req.query.q ?? "";
  service
    .search(q)
    .then((items) =>
      res.json({
        data: items.map((r) => new AccessRequestResponseDto(r)),
        warning:
          "This endpoint uses string concatenation and is vulnerable to SQL injection. For demo purposes only.",
      }),
    )
    .catch(next);
};

export const create = (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = new CreateAccessRequestDto(req.body);
    service
      .create({
        userId: dto.userId,
        date: dto.date,
        accessType: dto.accessType,
        comments: dto.comments,
      })
      .then((record) =>
        res.status(201).json(new AccessRequestResponseDto(record)),
      )
      .catch(next);
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
    service
      .update(Number(req.params.id), {
        date: dto.date,
        accessType: dto.accessType,
        comments: dto.comments,
        status: dto.status,
      })
      .then((record) => res.json(new AccessRequestResponseDto(record)))
      .catch(next);
  } catch (err) {
    next(err);
  }
};

export const remove = (
  req: Request<IdParams>,
  res: Response,
  next: NextFunction,
) => {
  service
    .remove(Number(req.params.id))
    .then(() => res.status(204).send())
    .catch(next);
};