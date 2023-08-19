import { WeeklyPlant } from '@prisma/client';

export {};

declare global {
    namespace Express {
        export interface Request {
            plant?: WeeklyPlant;
            userId?: number;
        }
    }
}
