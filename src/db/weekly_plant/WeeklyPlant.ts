import { userInfo } from 'os';
import prisma from '../db';
import { getUserById } from '../user/User';

const WEEK_EPOCH = new Date('January 4, 1970'); // the "first" week (starting from sunday)

export const timeToWeekId = (time: Date): number => {
    return Math.floor((time.getTime() - WEEK_EPOCH.getTime()) / (1000 * 60 * 60 * 24 * 7));
};

export const getAllWeeklyPlants = async (userId: number) => {
    const user = await getUserById(userId, {
        weeklyPlants: true,
    });

    if (!user) throw new Error('No such user');

    return user.weeklyPlants;
};

export const getWeeklyPlant = async (userId: number, time: Date) => {
    const allWeeklyPlants = await getAllWeeklyPlants(userId);

    const weekId = timeToWeekId(time);
    const foundWeek = allWeeklyPlants.find((e) => e.weekId === weekId);

    if (!foundWeek) throw new Error('No week found');

    return foundWeek;
};

export const getCurrentWeek = async (userId: number) => getWeeklyPlant(userId, new Date());

export const createCurrentWeek = async (userId: number) => {
    const currentWeek = timeToWeekId(new Date());
    return prisma.weeklyPlant.create({
        data: {
            userId,
            weekId: currentWeek,
            plantScore: 0,
        },
    });
};

export const getOrCreateCurrentWeek = async (userId: number) => {
    try {
        return await getCurrentWeek(userId);
    } catch (err: any) {
        if (err.message === 'No week found') return await createCurrentWeek(userId);
    }
};
