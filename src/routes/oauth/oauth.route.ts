import { Router } from 'express';

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

const authRouter = Router();

export default authRouter;
