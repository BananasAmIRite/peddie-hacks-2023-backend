import { NextFunction, Request, Response, Router } from 'express';
import { validate } from '../../validator';
import { body } from 'express-validator';
import { getUserByUsername } from '../../db/user/User';
import bcrypt from 'bcrypt';
import prisma from '../../db/db';
import UserStore, { hash } from '../../oauth/UserStore';

// TODO: Rafayel
/**
 *
 * Make an oauth lifecycle that eventually sets a cookie and
 * can associate the cookie to the user
 *
 * Create a React middleware to retrieve the cookie and
 * set the `userId` property of Request with the corresponding
 * user id
 */

const JWT_SECRET = process.env.JWT_SECRET as string;

const USER_STORE = new UserStore(JWT_SECRET);

const authRouter = Router();

authRouter.post('/register', validate([body('username').notEmpty(), body('password').notEmpty()]), async (req, res) => {
    const { username, password } = req.body;

    // make sure username doesnt exist
    const existingUser = await getUserByUsername(username);
    if (existingUser) return res.status(400).send({ message: 'Username already exists. ' });

    const hashed = await hash(password);

    prisma.user
        .create({
            data: {
                username,
                passwordHash: hashed,
                plantTime: null,
            },
        })
        .then((e) => {
            res.status(200).send({ message: 'User successfully created' });
        })
        .catch((err) => {
            res.status(500).send({ message: `Error while creating user: ${err.message}` });
        });
});

authRouter.post('/login', validate([body('username'), body('password')]), async (req, res) => {
    const { username, password } = req.body;

    const token = await USER_STORE.login(username, password);

    if (!token)
        return res.status(400).send({
            message: `Invalid username or password`,
        });

    res.cookie('token', token, {
        httpOnly: true,
        maxAge: USER_STORE.maxAge * 1000,
    });

    res.status(200).send({ message: 'User successfully logged in', token });
});

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token;

    const user = await USER_STORE.getUserByToken(token);

    if (!user) return res.status(401).send({ message: 'No user found. Please log in. ' });

    req.userId = user.id;

    next();
};

export default authRouter;
