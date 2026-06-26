import { z } from 'zod';

export interface UserAttributes {
    UserId: number;
    Global_User_ID?: string | null;
    UserTypeId?: number | null;
    Name?: string | null;
    UserName?: string | null;
    Password?: string | null;
    Company_Id?: number | null;
    BranchId?: number | null;
    UDel_Flag?: boolean | null;
    Autheticate_Id?: string | null;
}

// Zod schemas
export const userCreateSchema = z.object({
    Global_User_ID: z.string().max(50).optional().nullable(),
    UserTypeId: z.number().int().positive().default(6), // Default to 6
    Name: z.string().max(100).optional().nullable(),
    UserName: z.string()
        .min(1, 'Username is required')
        .max(50, 'Username cannot exceed 50 characters')
        .trim(),
    Password: z.string()
        .min(1, 'Password is required')
        .min(6, 'Password must be at least 6 characters')
        .max(100, 'Password cannot exceed 100 characters'),
    Company_Id: z.number().int().positive().optional().nullable(),
    BranchId: z.number().int().positive().optional().nullable(),
    UDel_Flag: z.boolean().default(false),
    Autheticate_Id: z.string().max(100).optional().nullable()
});

export const userUpdateSchema = z.object({
    Global_User_ID: z.string().max(50).optional().nullable(),
    UserTypeId: z.number().int().positive().optional(),
    Name: z.string().max(100).optional().nullable(),
    UserName: z.string()
        .min(1, 'Username is required')
        .max(50, 'Username cannot exceed 50 characters')
        .trim()
        .optional(),
    Password: z.string()
        .min(6, 'Password must be at least 6 characters')
        .max(100, 'Password cannot exceed 100 characters')
        .optional(),
    Company_Id: z.number().int().positive().optional().nullable(),
    BranchId: z.number().int().positive().optional().nullable(),
    UDel_Flag: z.boolean().optional(),
    Autheticate_Id: z.string().max(100).optional().nullable()
});

export const userQuerySchema = z.object({
    page: z.coerce.number()
        .int()
        .positive()
        .default(1),
    limit: z.coerce.number()
        .int()
        .min(1)
        .max(100)
        .default(20),
    search: z.string().optional(),
    sortBy: z.enum(['UserId', 'UserName', 'Name', 'Company_Id', 'BranchId'])
        .default('UserId'),
    sortOrder: z.enum(['ASC', 'DESC'])
        .default('ASC'),
    companyId: z.coerce.number().int().positive().optional(),
    branchId: z.coerce.number().int().positive().optional(),
    udelFlag: z.coerce.boolean().optional()
});

export const userIdSchema = z.object({
    id: z.coerce.number()
        .int()
        .positive('Valid User ID is required')
});

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type UserQueryParams = z.infer<typeof userQuerySchema>;