import express, { json, urlencoded } from 'express';
import prisma from './db/db';
import userRouter from './routes/user/user.route';
import authRouter from './routes/oauth/oauth.route';
import { timeToWeekId } from './db/weekly_plant/WeeklyPlant';

const app = express();

// middleware
app.use(urlencoded({ extended: true }));
app.use(json());

// routers
app.use('/user', userRouter);
app.use('/auth', authRouter);

app.get('/currentWeek', (req, res) =>
    res
        .status(200)
        .send({ weekId: timeToWeekId(new Date()) })
        .end()
);

prisma.$connect();

app.listen(process.env.SERVER_PORT, () => {
    console.log(`Listening on port, ${process.env.SERVER_PORT}`);
});
