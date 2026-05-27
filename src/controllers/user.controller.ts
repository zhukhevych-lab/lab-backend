import { Request, Response, NextFunction } from "express";
import * as service from "../services/user.service";
import CreateUserRequestDto from "../dtos/CreateUserRequestDto";
import UpdateUserRequestDto from "../dtos/UpdateUserRequestDto";
import UserResponseDto from "../dtos/UserResponseDto";

type IdParams = { id: string };
type Query = Record<string, string | undefined>;

export const getAll = (
  req: Request<IdParams, unknown, unknown, Query>,
  res: Response,
) => {
  const result = service.getAll({
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 10,
    sortBy: req.query.sortBy as "id" | "name" | "email" | undefined,
    order: req.query.order as "asc" | "desc" | undefined,
    name: req.query.name,
  });

  return res.json({
    items: result.items.map((u) => new UserResponseDto(u)),
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
    const user = service.getById(Number(req.params.id));
    return res.json(new UserResponseDto(user));
  } catch (err) {
    next(err);
  }
};

export const create = (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = new CreateUserRequestDto(req.body);
    const user = service.create({ name: dto.name, email: dto.email });
    return res.status(201).json(new UserResponseDto(user));
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
    const dto = new UpdateUserRequestDto(req.body);
    const user = service.update(Number(req.params.id), {
      name: dto.name,
      email: dto.email,
    });
    return res.json(new UserResponseDto(user));
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