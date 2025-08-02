import { PrismaClient } from "@prisma/client";

export async function paginate<T>(
  model: any,
  page: number,
  pageSize: number,
  include: object = {},
  where: object = {},
  orderBy: object = {}
): Promise<{ result: T[]; total: number }> {
  const skip = (page - 1) * pageSize;
  const [result, total] = await Promise.all([
    model.findMany({ skip, take: pageSize, include, where, orderBy }),
    model.count({ where }),
  ]);
  return { result, total };
}
