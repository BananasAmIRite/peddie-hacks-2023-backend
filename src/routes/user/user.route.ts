import { Router } from 'express';
import plantRouter from './plant/plant.route';

const userRouter = Router();

userRouter.get('/me', (req, res) => {
    // return data on the user (including user id)
});

// TODO: implement a middleware to make sure user is authenticated

userRouter.use('/plant', plantRouter);

export default userRouter;
