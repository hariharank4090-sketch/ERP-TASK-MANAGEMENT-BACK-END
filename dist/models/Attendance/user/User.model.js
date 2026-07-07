"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userIdSchema = exports.userQuerySchema = exports.userUpdateSchema = exports.userCreateSchema = void 0;
const zod_1 = require("zod");
// Zod schemas
exports.userCreateSchema = zod_1.z.object({
    Global_User_ID: zod_1.z.string().max(50).optional().nullable(),
    UserTypeId: zod_1.z.number().int().positive().default(6), // Default to 6
    Name: zod_1.z.string().max(100).optional().nullable(),
    UserName: zod_1.z.string()
        .min(1, 'Username is required')
        .max(50, 'Username cannot exceed 50 characters')
        .trim(),
    Password: zod_1.z.string()
        .min(1, 'Password is required')
        .min(6, 'Password must be at least 6 characters')
        .max(100, 'Password cannot exceed 100 characters'),
    Company_Id: zod_1.z.number().int().positive().optional().nullable(),
    BranchId: zod_1.z.number().int().positive().optional().nullable(),
    UDel_Flag: zod_1.z.boolean().default(false),
    Autheticate_Id: zod_1.z.string().max(100).optional().nullable()
});
exports.userUpdateSchema = zod_1.z.object({
    Global_User_ID: zod_1.z.string().max(50).optional().nullable(),
    UserTypeId: zod_1.z.number().int().positive().optional(),
    Name: zod_1.z.string().max(100).optional().nullable(),
    UserName: zod_1.z.string()
        .min(1, 'Username is required')
        .max(50, 'Username cannot exceed 50 characters')
        .trim()
        .optional(),
    Password: zod_1.z.string()
        .min(6, 'Password must be at least 6 characters')
        .max(100, 'Password cannot exceed 100 characters')
        .optional(),
    Company_Id: zod_1.z.number().int().positive().optional().nullable(),
    BranchId: zod_1.z.number().int().positive().optional().nullable(),
    UDel_Flag: zod_1.z.boolean().optional(),
    Autheticate_Id: zod_1.z.string().max(100).optional().nullable()
});
exports.userQuerySchema = zod_1.z.object({
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
    sortBy: zod_1.z.enum(['UserId', 'UserName', 'Name', 'Company_Id', 'BranchId'])
        .default('UserId'),
    sortOrder: zod_1.z.enum(['ASC', 'DESC'])
        .default('ASC'),
    companyId: zod_1.z.coerce.number().int().positive().optional(),
    branchId: zod_1.z.coerce.number().int().positive().optional(),
    udelFlag: zod_1.z.coerce.boolean().optional()
});
exports.userIdSchema = zod_1.z.object({
    id: zod_1.z.coerce.number()
        .int()
        .positive('Valid User ID is required')
});
