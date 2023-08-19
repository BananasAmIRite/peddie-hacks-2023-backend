import { User } from '@prisma/client';
import { getUserById, getUserByUsername } from '../db/user/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export default class UserStore {
    public constructor(private secret: string, public readonly maxAge: number = 30 * 24 * 60 * 60) {}

    public async login(username: string, password: string): Promise<string | false> {
        const user = await getUserByUsername(username);

        const pwIsValid = !user ? false : await bcrypt.compare(password, user.passwordHash);

        if (!pwIsValid || !user) return false; // ew

        return jwt.sign(
            {
                id: user.id,
                username: user.username,
            },
            this.secret,
            { expiresIn: this.maxAge }
        );
    }

    public async getUserByToken(token: string): Promise<User | null> {
        try {
            const { id }: jwt.JwtPayload = jwt.verify(token, this.secret) as jwt.JwtPayload;

            const user = await getUserById(id);
            return user;
        } catch (err) {
            return null;
        }
    }
}

export const hash = (pw: string) => bcrypt.hash(pw, 10);
