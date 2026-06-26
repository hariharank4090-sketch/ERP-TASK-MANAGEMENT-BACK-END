import { ZodError, ZodSchema } from 'zod';
import { Response } from 'express';


export const validateBody = <T>(schema: ZodSchema<T>, data: any, res: Response): T | null => {
    try {
        return schema.parse(data);
    } catch (e) {
        if (e instanceof ZodError) {
            res.status(400).json({
                success: false,
                message: 'Invalid input data',
                errors: e.issues.map(err => ({
                    path: err.path.join('.'),
                    message: err.message,
                })),
            });
            return null;
        }
        throw e;
    }
};

import { Request, NextFunction } from 'express';

export const validateRequest = (schema: ZodSchema<any>) => (req: Request, res: Response, next: NextFunction) => {
    try {
        req.body = schema.parse(req.body);
        next();
    } catch (e) {
        if (e instanceof ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: e.issues.map(err => ({
                    path: err.path.join('.'),
                    message: err.message,
                })),
            });
        }
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
