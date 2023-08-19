import { Prisma, User } from '@prisma/client';
import prisma from '../db';

export const createUser = (userData: User) => prisma.user.create({ data: userData });

export const getUserById = (userId: number, include: Prisma.UserInclude) =>
    prisma.user.findFirst({ where: { id: userId }, include });

export const getUserByUsername = (username: string, include: Prisma.UserInclude) =>
    prisma.user.findFirst({ where: { username }, include });
