"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaveTypeIdSchema = exports.leaveTypeQuerySchema = exports.leaveTypeUpdateSchema = exports.leaveTypeCreateSchema = void 0;
const zod_1 = require("zod");
// Zod schemas
exports.leaveTypeCreateSchema = zod_1.z.object({
    LeaveType: zod_1.z.string()
        .min(1, 'Leave type is required')
        .max(100, 'Leave type cannot exceed 100 characters')
        .trim()
});
exports.leaveTypeUpdateSchema = zod_1.z.object({
    LeaveType: zod_1.z.string()
        .min(1, 'Leave type is required')
        .max(100, 'Leave type cannot exceed 100 characters')
        .trim()
});
exports.leaveTypeQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number()
        .int()
        .positive()
        .default(1),
    limit: zod_1.z.coerce.number()
        .int()
        .min(1)
        .max(100)
        .default(20),
    search: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(['Id', 'LeaveType'])
        .default('Id'),
    sortOrder: zod_1.z.enum(['ASC', 'DESC'])
        .default('ASC')
});
exports.leaveTypeIdSchema = zod_1.z.object({
    id: zod_1.z.coerce.number()
        .int()
        .positive('Valid ID is required')
});
