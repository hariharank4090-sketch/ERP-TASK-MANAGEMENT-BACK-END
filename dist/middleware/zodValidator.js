"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = exports.validateBody = void 0;
const zod_1 = require("zod");
const validateBody = (schema, data, res) => {
    try {
        return schema.parse(data);
    }
    catch (e) {
        if (e instanceof zod_1.ZodError) {
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
exports.validateBody = validateBody;
const validateRequest = (schema) => (req, res, next) => {
    try {
        req.body = schema.parse(req.body);
        next();
    }
    catch (e) {
        if (e instanceof zod_1.ZodError) {
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
exports.validateRequest = validateRequest;
