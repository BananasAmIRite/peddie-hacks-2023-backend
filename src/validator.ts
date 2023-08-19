import express from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';
// can be reused by many routes

// sequential processing, stops running validations chain if the previous one fails.
export const validate = (validations: ValidationChain[]) => {
    return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        for (let validation of validations) {
            const result = await validation.run(req);
            // if (result.array().length) break;
        }

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        res.status(400).json({ errors: errors.array() });
    };
};
