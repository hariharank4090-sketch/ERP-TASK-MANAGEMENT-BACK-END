import { z } from 'zod';

export interface LeaveTypeAttributes {
    Id: number;
    LeaveType: string;
}

// Zod schemas
export const leaveTypeCreateSchema = z.object({
    LeaveType: z.string()
        .min(1, 'Leave type is required')
        .max(100, 'Leave type cannot exceed 100 characters')
        .trim()
});

export const leaveTypeUpdateSchema = z.object({
    LeaveType: z.string()
        .min(1, 'Leave type is required')
        .max(100, 'Leave type cannot exceed 100 characters')
        .trim()
});

export const leaveTypeQuerySchema = z.object({
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
    sortBy: z.enum(['Id', 'LeaveType'])
        .default('Id'),
    sortOrder: z.enum(['ASC', 'DESC'])
        .default('ASC')
});

export const leaveTypeIdSchema = z.object({
    id: z.coerce.number()
        .int()
        .positive('Valid ID is required')
});

export type LeaveTypeCreateInput = z.infer<typeof leaveTypeCreateSchema>;
export type LeaveTypeUpdateInput = z.infer<typeof leaveTypeUpdateSchema>;
export type LeaveTypeQueryParams = z.infer<typeof leaveTypeQuerySchema>;