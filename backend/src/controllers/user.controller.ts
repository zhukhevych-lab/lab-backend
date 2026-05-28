import { Request, Response, NextFunction } from "express";
import * as service from "../services/user.service";
import CreateUserRequestDto from "../dtos/CreateUserRequestDto";
import UpdateUserRequestDto from "../dtos/UpdateUserRequestDto";
import UserResponseDto from "../dtos/UserResponseDto";

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
    const user = await service.getById(Number(req.params.id));
    return res.json(new UserResponseDto(user));
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
    const dto = new CreateUserRequestDto(req.body);
    const user = await service.create({ name: dto.name, email: dto.email });
    return res.status(201).json(new UserResponseDto(user));
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
    const dto = new UpdateUserRequestDto(req.body);
    const user = await service.update(Number(req.params.id), {
      name: dto.name,
      email: dto.email,
    });
    return res.json(new UserResponseDto(user));
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