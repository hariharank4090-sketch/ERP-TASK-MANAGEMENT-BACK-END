"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleIdSchema = exports.ScheduleQuerySchema = exports.ScheduleDetailSchema = exports.ScheduleStatusUpdateSchema = exports.ScheduleUpdateSchema = exports.ScheduleCreateSchema = void 0;
const zod_1 = require("zod");
// Plan Types:
// 1: Time Based (Special)
// 2: Day Based (Daily - days of week)
// 3: Weekly Based (Weekly - weeks of month)
// 4: Monthly Based (Monthly - days of month)
// 5: Specific Day (One Time OR Multiple Specific Dates via calendar picker)
exports.ScheduleCreateSchema = zod_1.z.object({
    Sch_No: zod_1.z.string().min(1, 'Schedule number is required').max(50),
    Sch_Date: zod_1.z.union([zod_1.z.string(), zod_1.z.date()]).optional().transform(val => val ? new Date(val) : new Date()),
    Task_Id: zod_1.z.number().int().positive('Task is required'),
    Task_Type_Id: zod_1.z.number().int().positive('Schedule type is required'),
    Sch_Plan_Id: zod_1.z.number().int().min(1).max(5, 'Plan Id must be between 1 and 5'),
    Sch_Type: zod_1.z.number().int().min(1).max(4).optional().default(1),
    Sch_Start_Date: zod_1.z.union([zod_1.z.string(), zod_1.z.date(), zod_1.z.null()]).transform(val => val ? new Date(val) : null),
    Sch_End_Date: zod_1.z.union([zod_1.z.string(), zod_1.z.date(), zod_1.z.null()]).transform(val => val ? new Date(val) : null),
    Task_Sch_Timer_Based: zod_1.z.boolean().default(false),
    Sch_Est_Start_Time: zod_1.z.string().nullable(),
    Sch_Est_End_Time: zod_1.z.string().nullable(),
    Task_Sch_Duaration: zod_1.z.number().nullable(),
    Sch_Status: zod_1.z.number().int().min(0).max(4).default(1),
    Entry_By: zod_1.z.number().int().positive('Entry user is required'),
    planDetails: zod_1.z.object({
        Plan_Month: zod_1.z.union([zod_1.z.number().int().min(0).max(12), zod_1.z.null()]).optional(),
        Plan_Day: zod_1.z.union([zod_1.z.number().int().min(0).max(31), zod_1.z.null()]).optional()
    }).optional().default({}),
    selectedDays: zod_1.z.array(zod_1.z.number().int()).optional().default([]),
    specificDates: zod_1.z.array(zod_1.z.string()).optional().default([])
}).superRefine((data, ctx) => {
    // Basic date range validation: end must not be before start
    if (data.Sch_Start_Date && data.Sch_End_Date) {
        const startDate = new Date(data.Sch_Start_Date);
        const endDate = new Date(data.Sch_End_Date);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);
        if (endDate < startDate) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                path: ['Sch_End_Date'],
                message: 'End date must be on or after start date',
            });
        }
    }
    const { Sch_Plan_Id, planDetails, selectedDays, specificDates } = data;
    if (Sch_Plan_Id === 2) { // Day Based (Daily)
        if (selectedDays && selectedDays.length > 0) {
            const invalidDays = selectedDays.filter(d => d < 1 || d > 7);
            if (invalidDays.length > 0) {
                ctx.addIssue({
                    code: zod_1.z.ZodIssueCode.custom,
                    path: ['selectedDays'],
                    message: 'For Day Based plan, selected days must be between 1 and 7 (1=Monday, 7=Sunday)',
                });
            }
        }
    }
    else if (Sch_Plan_Id === 3) { // Weekly Based
        if (selectedDays && selectedDays.length > 0) {
            const invalidWeeks = selectedDays.filter(w => w < 1 || w > 7);
            if (invalidWeeks.length > 0) {
                ctx.addIssue({
                    code: zod_1.z.ZodIssueCode.custom,
                    path: ['selectedDays'],
                    message: 'For Weekly Based plan, selected weeks must be between 1 and 7',
                });
            }
        }
        if (planDetails?.Plan_Month !== undefined && planDetails.Plan_Month !== null) {
            if (planDetails.Plan_Month < 0 || planDetails.Plan_Month > 12) {
                ctx.addIssue({
                    code: zod_1.z.ZodIssueCode.custom,
                    path: ['planDetails.Plan_Month'],
                    message: 'Plan month must be between 0 and 12 (0 for all months)',
                });
            }
        }
    }
    else if (Sch_Plan_Id === 4) { // Monthly Based
        if (selectedDays && selectedDays.length > 0) {
            const invalidDays = selectedDays.filter(d => d < 1 || d > 31);
            if (invalidDays.length > 0) {
                ctx.addIssue({
                    code: zod_1.z.ZodIssueCode.custom,
                    path: ['selectedDays'],
                    message: 'For Monthly Based plan, selected days must be between 1 and 31',
                });
            }
        }
        if (planDetails?.Plan_Month !== undefined && planDetails.Plan_Month !== null) {
            if (planDetails.Plan_Month < 0 || planDetails.Plan_Month > 12) {
                ctx.addIssue({
                    code: zod_1.z.ZodIssueCode.custom,
                    path: ['planDetails.Plan_Month'],
                    message: 'Plan month must be between 0 and 12 (0 for all months)',
                });
            }
        }
    }
    // Plan 5 (Specific Dates): NO same-day restriction.
    // specificDates array drives which dates get inserted.
    // Sch_Start_Date / Sch_End_Date are just the calendar bounds for UI display.
});
exports.ScheduleUpdateSchema = zod_1.z.object({
    Sch_No: zod_1.z.string().min(1, 'Schedule number is required').max(50).optional(),
    Sch_Date: zod_1.z.union([zod_1.z.string(), zod_1.z.date()]).optional().transform(val => val ? new Date(val) : undefined),
    Task_Id: zod_1.z.number().int().positive('Task is required').optional(),
    Task_Type_Id: zod_1.z.number().int().positive().optional(),
    Sch_Plan_Id: zod_1.z.number().int().min(1).max(5).optional(),
    Sch_Type: zod_1.z.number().int().min(1).max(4).optional(),
    Sch_Start_Date: zod_1.z.union([zod_1.z.string(), zod_1.z.date(), zod_1.z.null()]).optional().transform(val => val ? new Date(val) : null),
    Sch_End_Date: zod_1.z.union([zod_1.z.string(), zod_1.z.date(), zod_1.z.null()]).optional().transform(val => val ? new Date(val) : null),
    Task_Sch_Timer_Based: zod_1.z.boolean().optional(),
    Sch_Est_Start_Time: zod_1.z.string().nullable().optional(),
    Sch_Est_End_Time: zod_1.z.string().nullable().optional(),
    Task_Sch_Duaration: zod_1.z.number().nullable().optional(),
    Sch_Status: zod_1.z.number().int().min(0).max(4).optional(),
    Update_By: zod_1.z.number().int().positive('Update user is required'),
    planDetails: zod_1.z.object({
        Plan_Month: zod_1.z.union([zod_1.z.number().int().min(0).max(12), zod_1.z.null()]).optional(),
        Plan_Day: zod_1.z.union([zod_1.z.number().int().min(0).max(31), zod_1.z.null()]).optional()
    }).optional(),
    selectedDays: zod_1.z.array(zod_1.z.number().int()).optional(),
    specificDates: zod_1.z.array(zod_1.z.string()).optional()
}).superRefine((data, ctx) => {
    // Basic date range validation: end must not be before start
    if (data.Sch_Start_Date && data.Sch_End_Date) {
        const startDate = new Date(data.Sch_Start_Date);
        const endDate = new Date(data.Sch_End_Date);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);
        if (endDate < startDate) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                path: ['Sch_End_Date'],
                message: 'End date must be on or after start date',
            });
        }
    }
    // Plan 5 update: no same-day restriction — specificDates drives the insert logic
});
exports.ScheduleStatusUpdateSchema = zod_1.z.object({
    status: zod_1.z.number().int().min(0).max(4),
    Update_By: zod_1.z.number().int().positive()
});
exports.ScheduleDetailSchema = zod_1.z.object({
    Task_Work_Date: zod_1.z.union([zod_1.z.string(), zod_1.z.date()]).transform(val => new Date(val)),
    Task_Start_Time: zod_1.z.string().nullable(),
    Task_End_Time: zod_1.z.string().nullable()
});
exports.ScheduleQuerySchema = zod_1.z.object({
    page: zod_1.z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: zod_1.z.string().optional().transform(val => val ? parseInt(val) : 20),
    search: zod_1.z.string().optional(),
    status: zod_1.z.string().optional().transform(val => val ? parseInt(val) : undefined),
    planType: zod_1.z.string().optional().transform(val => val ? parseInt(val) : undefined),
    taskId: zod_1.z.string().optional().transform(val => val ? parseInt(val) : undefined),
    dateFrom: zod_1.z.string().optional().transform(val => val ? new Date(val) : undefined),
    dateTo: zod_1.z.string().optional().transform(val => val ? new Date(val) : undefined),
    sortBy: zod_1.z.enum(['Sch_Id', 'Sch_No', 'Sch_Date', 'Task_Name', 'Sch_Status', 'Entry_Date']).optional(),
    sortOrder: zod_1.z.enum(['ASC', 'DESC']).optional()
});
exports.ScheduleIdSchema = zod_1.z.object({
    id: zod_1.z.string().transform(val => parseInt(val))
});
