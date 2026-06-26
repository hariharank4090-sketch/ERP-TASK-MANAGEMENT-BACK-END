import { Request, Response } from 'express';
import { Sequelize, QueryTypes, Transaction } from 'sequelize';
import { ZodError } from 'zod';
import {
    created,
    updated,
    deleted,
    servError,
    notFound,
    sentData
} from '../../../responseObject';
import {
    ScheduleCreateSchema,
    ScheduleUpdateSchema,
    ScheduleQuerySchema,
    ScheduleIdSchema,
    ScheduleStatusUpdateSchema,
    ScheduleCreate,
    ScheduleUpdate,
    ScheduleQuery,
    ScheduleStatusUpdate
} from '../../../models/masters/ProjectSchedule/schedule.type.model';

// Helper to get database from request (using companyDB from auth middleware)
const getDb = (req: Request): Sequelize => {
    if (req.companyDB) {
        return req.companyDB;
    }
    throw new Error('Database connection not available. Please authenticate first.');
};

const getCurrentDatabaseName = (req: Request): string => {
    return req.currentDBName || 'default';
};

const validateWithZod = <T>(schema: any, data: any): {
    success: boolean;
    data?: T;
    errors?: Array<{ field: string; message: string }>;
} => {
    try {
        return { success: true, data: schema.parse(data) };
    } catch (error) {
        if (error instanceof ZodError) {
            return {
                success: false,
                errors: error.issues.map(err => ({
                    field: err.path.join('.') || 'unknown',
                    message: err.message
                }))
            };
        }
        return {
            success: false,
            errors: [{ field: 'unknown', message: 'Validation failed' }]
        };
    }
};

const formatDateForSQL = (date: Date | string | null): string | null => {
    if (!date) return null;

    const d = date instanceof Date ? date : new Date(date);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const validateDateRange = (
    startDate: Date | string | null | undefined,
    endDate: Date | string | null | undefined
): { valid: boolean; message?: string } => {
    if (!startDate || !endDate) return { valid: true };
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return { valid: false, message: 'Invalid date format' };
    }
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    if (end < start) {
        return { valid: false, message: 'End date must be on or after start date' };
    }
    return { valid: true };
};

async function getNextAId(db: Sequelize, transaction: Transaction): Promise<number> {
    const maxAIdResult = await db.query(
        `SELECT ISNULL(MAX(A_Id), 0) + 1 as NextId FROM tbl_Project_Sch_Task_DT`,
        { type: QueryTypes.SELECT, transaction }
    ) as any[];

    let nextAId = maxAIdResult[0]?.NextId || 1;

    const aIdCheck = await db.query(
        `SELECT 1 FROM tbl_Project_Sch_Task_DT WHERE A_Id = ?`,
        { replacements: [nextAId], type: QueryTypes.SELECT, transaction }
    ) as any[];

    if (aIdCheck.length > 0) {
        const availableAIdResult = await db.query(
            `SELECT TOP 1 t1.A_Id + 1 as AvailableId
             FROM tbl_Project_Sch_Task_DT t1
             LEFT JOIN tbl_Project_Sch_Task_DT t2 ON t1.A_Id + 1 = t2.A_Id
             WHERE t2.A_Id IS NULL
             ORDER BY t1.A_Id`,
            { type: QueryTypes.SELECT, transaction }
        ) as any[];
        nextAId = availableAIdResult[0]?.AvailableId || nextAId + 1;
    }
    return nextAId;
}

async function insertTaskDates(
    db: Sequelize,
    schId: number,
    dates: Date[],
    estStartTime: string | null,
    estEndTime: string | null,
    transaction: Transaction
): Promise<void> {
    for (const date of dates) {
        const nextAId = await getNextAId(db, transaction);
        await db.query(
            `INSERT INTO tbl_Project_Sch_Task_DT
             (A_Id, Sch_Id, Task_Work_Date, Task_Start_Time, Task_End_Time)
             VALUES (?, ?, ?, ?, ?)`,
            {
                replacements: [
                    nextAId,
                    schId,
                    formatDateForSQL(date),
                    estStartTime,
                    estEndTime
                ],
                type: QueryTypes.INSERT,
                transaction
            }
        );
    }
}

async function insertPlanDetails(
    db: Sequelize,
    schId: number,
    planId: number,
    selectedDays: number[],
    planDetails: any,
    transaction: Transaction
): Promise<void> {
    // Plan 1 (Time/Daily), Plan 5 (Specific) do not store plan detail rows
    if (planId === 1 || planId === 5) return;
    if (!selectedDays || selectedDays.length === 0) return;

    for (const day of selectedDays) {
        await db.query(
            `INSERT INTO tbl_Project_Sch_DT (Sch_Id, Plan_Month, Plan_Day)
             VALUES (?, ?, ?)`,
            {
                replacements: [
                    schId,
                    (planId === 2 || planId === 3) ? null : (planDetails?.Plan_Month ?? null),
                    day
                ],
                type: QueryTypes.INSERT,
                transaction
            }
        );
    }
}

// Day-of-week helper: 1 = Monday … 7 = Sunday
function getDayOfWeek(date: Date): number {
    const day = date.getDay();
    return day === 0 ? 7 : day;
}

function generateTaskDates(
    startDate: Date,
    endDate: Date,
    planId: number,
    selectedDays: number[],
    _planDetails?: any,
    _specificDates: string[] = []
): Date[] {
    const dates: Date[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        let includeDate = false;

        switch (planId) {
            case 1: // Daily — every day
                includeDate = true;
                break;
            case 2: // Days — weekdays 1-7
                includeDate = selectedDays.includes(getDayOfWeek(currentDate));
                break;
            case 3: // Weekly — weekdays 1-7
                includeDate = selectedDays.includes(getDayOfWeek(currentDate));
                break;
            case 4: // Monthly — day of month 1-31
                includeDate = selectedDays.includes(currentDate.getDate());
                break;
            default:
                includeDate = true;
        }

        if (includeDate) {
            dates.push(new Date(currentDate));
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
}

// Helper function to convert string date to Date object without timezone issues
const parseDateString = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
};

export const getAllSchedules = async (req: Request, res: Response) => {
    try {
        const db = getDb(req);
        const currentDBName = getCurrentDatabaseName(req);
        console.log(`📊 Querying schedules from database: ${currentDBName}`);

        const validation = validateWithZod<ScheduleQuery>(ScheduleQuerySchema, req.query);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid query parameters',
                errors: validation.errors
            });
        }

        const { status, planType, taskId, dateFrom, dateTo, search } = validation.data!;

        let whereConditions = ['s.Sch_Del_Flag = 0'];
        const replacements: any = {};
        let paramCounter = 1;

        if (search) {
            whereConditions.push(`(s.Sch_No LIKE @${paramCounter} OR t.Task_Name LIKE @${paramCounter})`);
            replacements[paramCounter] = `%${search}%`;
            paramCounter++;
        }
        if (status !== undefined) {
            whereConditions.push(`s.Sch_Status = @${paramCounter}`);
            replacements[paramCounter] = status;
            paramCounter++;
        }
        if (planType) {
            whereConditions.push(`s.Sch_Plan_Id = @${paramCounter}`);
            replacements[paramCounter] = planType;
            paramCounter++;
        }
        if (taskId) {
            whereConditions.push(`s.Task_Id = @${paramCounter}`);
            replacements[paramCounter] = taskId;
            paramCounter++;
        }
        if (dateFrom) {
            whereConditions.push(`s.Sch_Date >= @${paramCounter}`);
            replacements[paramCounter] = formatDateForSQL(dateFrom);
            paramCounter++;
        }
        if (dateTo) {
            whereConditions.push(`s.Sch_Date <= @${paramCounter}`);
            replacements[paramCounter] = formatDateForSQL(dateTo);
            paramCounter++;
        }

        const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

        const schedulesQuery = `
            SELECT
                s.Sch_Id, s.Sch_No, s.Sch_Date, s.Task_Id, t.Task_Name,
                s.Task_Type_Id, s.Sch_Plan_Id, p.Plan_Type,
                s.Sch_Type,
                s.Sch_Start_Date, s.Sch_End_Date, s.Task_Sch_Timer_Based,
                s.Sch_Est_Start_Time, s.Sch_Est_End_Time, s.Task_Sch_Duaration,
                s.Sch_Status, s.Entry_By, s.Entry_Date, s.Update_By, s.Update_Date,
                s.Sch_Comp_Date,
                pm.Project_Name, pm.Project_Id
            FROM tbl_Project_Schedule s
            LEFT JOIN tbl_Task t ON s.Task_Id = t.Task_Id
            LEFT JOIN tbl_Project_Master pm ON t.Project_Id = pm.Project_Id
            LEFT JOIN tbl_Sch_Plan p ON s.Sch_Plan_Id = p.Plan_Id
            ${whereClause}
            ORDER BY s.Sch_Id DESC
        `;

        const schedules = await db.query(schedulesQuery, { replacements, type: QueryTypes.SELECT }) as any[];

        if (schedules.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'Project schedules retrieved successfully',
                data: [],
                total: 0
            });
        }

        const scheduleIds = schedules.map((s: any) => s.Sch_Id);

        const taskDatesQuery = `
            SELECT A_Id, Sch_Id, Task_Work_Date, Task_Start_Time, Task_End_Time
            FROM tbl_Project_Sch_Task_DT
            WHERE Sch_Id IN (${scheduleIds.map(() => '?').join(',')})
            ORDER BY Sch_Id, Task_Work_Date
        `;
        const taskDates = await db.query(taskDatesQuery, { replacements: scheduleIds, type: QueryTypes.SELECT }) as any[];

        const planDetailsQuery = `
            SELECT Sch_Id, Plan_Month, Plan_Day
            FROM tbl_Project_Sch_DT
            WHERE Sch_Id IN (${scheduleIds.map(() => '?').join(',')})
        `;
        const planDetails = await db.query(planDetailsQuery, { replacements: scheduleIds, type: QueryTypes.SELECT }) as any[];

        const taskDatesByScheduleId: { [key: number]: any[] } = {};
        const planDetailsByScheduleId: { [key: number]: any[] } = {};

        taskDates.forEach((task: any) => {
            if (!taskDatesByScheduleId[task.Sch_Id]) taskDatesByScheduleId[task.Sch_Id] = [];
            taskDatesByScheduleId[task.Sch_Id].push({
                aId: task.A_Id,
                taskWorkDate: task.Task_Work_Date,
                taskStartTime: task.Task_Start_Time,
                taskEndTime: task.Task_End_Time
            });
        });

        planDetails.forEach((plan: any) => {
            if (!planDetailsByScheduleId[plan.Sch_Id]) planDetailsByScheduleId[plan.Sch_Id] = [];
            planDetailsByScheduleId[plan.Sch_Id].push({
                planMonth: plan.Plan_Month,
                planDay: plan.Plan_Day
            });
        });

        const formattedSchedules = schedules.map((schedule: any) => ({
            schId: schedule.Sch_Id,
            schNo: schedule.Sch_No,
            schDate: schedule.Sch_Date,
            Task_Id: schedule.Task_Id,
            Task_Name: schedule.Task_Name,
            TaskTypeId: schedule.Task_Type_Id,
            schPlanId: schedule.Sch_Plan_Id,
            schType: schedule.Sch_Type,
            Project_Id: schedule.Project_Id,
            Project_Name: schedule.Project_Name,
            planType: schedule.Plan_Type,
            schStartDate: schedule.Sch_Start_Date,
            schEndDate: schedule.Sch_End_Date,
            taskSchTimerBased: schedule.Task_Sch_Timer_Based,
            schEstStartTime: schedule.Sch_Est_Start_Time,
            schEstEndTime: schedule.Sch_Est_End_Time,
            taskSchDuration: schedule.Task_Sch_Duaration,
            schStatus: schedule.Sch_Status,
            schCompDate: schedule.Sch_Comp_Date,
            entryBy: schedule.Entry_By,
            entryDate: schedule.Entry_Date,
            updateBy: schedule.Update_By,
            updateDate: schedule.Update_Date,
            taskDates: taskDatesByScheduleId[schedule.Sch_Id] || [],
            planDetails: planDetailsByScheduleId[schedule.Sch_Id] || []
        }));

        res.status(200).json({
            success: true,
            message: 'Project schedules retrieved successfully',
            data: formattedSchedules,
            total: schedules.length
        });
    } catch (e) {
        console.error('Error in getAllSchedules:', e);
        servError(e, res);
    }
};

export const getScheduleById = async (req: Request, res: Response) => {
    try {
        const db = getDb(req);
        const currentDBName = getCurrentDatabaseName(req);
        console.log(`📊 Getting schedule by ID from database: ${currentDBName}`);

        const validation = validateWithZod<{ id: number }>(ScheduleIdSchema, req.params);
        if (!validation.success) {
            return res.status(400).json({ success: false, errors: validation.errors });
        }

        const query = `
            SELECT s.*, t.Task_Name, p.Plan_Type, pm.Project_Name, pm.Project_Id
            FROM tbl_Project_Schedule s
            LEFT JOIN tbl_Task t ON s.Task_Id = t.Task_Id
            LEFT JOIN tbl_Project_Master pm ON t.Project_Id = pm.Project_Id
            LEFT JOIN tbl_Sch_Plan p ON s.Sch_Plan_Id = p.Plan_Id
            WHERE s.Sch_Id = ? AND s.Sch_Del_Flag = 0
        `;

        const rows = await db.query(query, { replacements: [validation.data!.id], type: QueryTypes.SELECT }) as any[];
        if (!rows.length) return notFound(res, 'Project schedule not found');

        const detailsQuery = `SELECT * FROM tbl_Project_Sch_Task_DT WHERE Sch_Id = ? ORDER BY Task_Work_Date`;
        const details = await db.query(detailsQuery, { replacements: [validation.data!.id], type: QueryTypes.SELECT }) as any[];

        const planDtQuery = `SELECT * FROM tbl_Project_Sch_DT WHERE Sch_Id = ?`;
        const planDt = await db.query(planDtQuery, { replacements: [validation.data!.id], type: QueryTypes.SELECT }) as any[];

        sentData(res, { ...rows[0], taskDates: details, planDetails: planDt });
    } catch (e) {
        console.error('Error in getScheduleById:', e);
        servError(e, res);
    }
};

export const getScheduleDetails = async (req: Request, res: Response) => {
    try {
        const db = getDb(req);
        const currentDBName = getCurrentDatabaseName(req);
        console.log(`📊 Getting schedule details from database: ${currentDBName}`);

        const validation = validateWithZod<{ id: number }>(ScheduleIdSchema, req.params);
        if (!validation.success) {
            return res.status(400).json({ success: false, errors: validation.errors });
        }

        const query = `SELECT * FROM tbl_Project_Sch_Task_DT WHERE Sch_Id = ? ORDER BY Task_Work_Date`;
        const rows = await db.query(query, { replacements: [validation.data!.id], type: QueryTypes.SELECT }) as any[];
        sentData(res, rows);
    } catch (e) {
        console.error('Error in getScheduleDetails:', e);
        servError(e, res);
    }
};

export const createSchedule = async (req: Request, res: Response) => {
    let transaction: Transaction | null = null;
    let isTransactionActive = false;

    try {
        const db = getDb(req);
        const currentDBName = getCurrentDatabaseName(req);
        console.log(`📊 Creating schedule in database: ${currentDBName}`);
        console.log('Create Schedule Request Body:', JSON.stringify(req.body, null, 2));

        const body = {
            ...req.body,
            Sch_No: req.body.Sch_No?.trim(),
            Sch_Status: req.body.Sch_Status || 1
        };

        const validation = validateWithZod<ScheduleCreate>(ScheduleCreateSchema, body);
        if (!validation.success) {
            console.log('Validation Errors:', JSON.stringify(validation.errors, null, 2));
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const {
            Sch_No,
            Sch_Date,
            Task_Id,
            Task_Type_Id,
            Sch_Plan_Id,
            Sch_Type,
            Task_Sch_Timer_Based,
            Sch_Est_Start_Time,
            Sch_Est_End_Time,
            Task_Sch_Duaration,
            Sch_Status,
            Entry_By,
            planDetails,
            selectedDays,
            specificDates
        } = validation.data!;

        // Default values from frontend
        let Sch_Start_Date = validation.data!.Sch_Start_Date;
        let Sch_End_Date = validation.data!.Sch_End_Date;

        // PLAN 5 => AUTO SET START/END DATE FROM specificDates
        if (
            Sch_Plan_Id === 5 &&
            specificDates &&
            specificDates.length > 0
        ) {
            // Sort dates ascending (string sort works for YYYY-MM-DD format)
            const sortedDates = [...specificDates].sort();

            // First date = Start Date (convert string to Date)
            Sch_Start_Date = parseDateString(sortedDates[0]);

            // Last date = End Date (convert string to Date)
            Sch_End_Date = parseDateString(sortedDates[sortedDates.length - 1]);

            console.log('Plan 5 Auto Start Date:', Sch_Start_Date);
            console.log('Plan 5 Auto End Date:', Sch_End_Date);
        }

        // For Plan 5, we don't need to validate date range as we use specificDates
        if (Sch_Plan_Id !== 5) {
            const dateValidation = validateDateRange(Sch_Start_Date, Sch_End_Date);
            if (!dateValidation.valid) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: [{ field: 'Sch_End_Date', message: dateValidation.message }]
                });
            }
        }

        // Check for duplicate schedule number
        const dupCheck = await db.query(
            `SELECT 1 FROM tbl_Project_Schedule WHERE UPPER(Sch_No) = UPPER(?) AND Sch_Del_Flag = 0`,
            { replacements: [Sch_No], type: QueryTypes.SELECT }
        ) as any[];

        if (dupCheck.length) {
            return res.status(409).json({
                success: false,
                message: 'Schedule number already exists'
            });
        }

        // Get next schedule ID
        const maxIdResult = await db.query(
            `SELECT ISNULL(MAX(Sch_Id), 0) + 1 as NextId FROM tbl_Project_Schedule`,
            { type: QueryTypes.SELECT }
        ) as any[];

        const nextSchId = maxIdResult[0]?.NextId;
        if (!nextSchId) throw new Error('Failed to generate next Schedule ID');

        transaction = await db.transaction();
        isTransactionActive = true;

        try {
            // Insert main schedule record
            await db.query(
                `INSERT INTO tbl_Project_Schedule
                 (Sch_Id, Sch_No, Sch_Date, Task_Id, Task_Type_Id, Sch_Plan_Id,
                  Sch_Type,
                  Sch_Start_Date, Sch_End_Date, Task_Sch_Timer_Based,
                  Sch_Est_Start_Time, Sch_Est_End_Time, Task_Sch_Duaration,
                  Sch_Status, Entry_By, Entry_Date, Sch_Del_Flag, Sch_Comp_Date)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, GETDATE(), 0, ${Sch_Status === 3 ? 'GETDATE()' : 'NULL'})`,
                {
                    replacements: [
                        nextSchId,
                        Sch_No,
                        formatDateForSQL(Sch_Date || new Date()),
                        Task_Id,
                        Task_Type_Id,
                        Sch_Plan_Id,
                        Sch_Type || 1,
                        formatDateForSQL(Sch_Start_Date),
                        formatDateForSQL(Sch_End_Date),
                        Task_Sch_Timer_Based ? 1 : 0,
                        Sch_Est_Start_Time,
                        Sch_Est_End_Time,
                        Task_Sch_Duaration,
                        Sch_Status,
                        Entry_By
                    ],
                    type: QueryTypes.INSERT,
                    transaction
                }
            );

            // Insert plan detail rows for non-Plan 5 schedules
            if (Sch_Plan_Id !== 5) {
                await insertPlanDetails(db, nextSchId, Sch_Plan_Id, selectedDays || [], planDetails, transaction);
            }

            // Generate task work dates
            let taskDatesToInsert: Date[] = [];

            if (Sch_Plan_Id === 5) {
                // PLAN 5: SPECIFIC DATES - Use ONLY the specificDates array from frontend
                console.log('Plan 5 - specificDates from frontend:', specificDates);
                
                if (specificDates && specificDates.length > 0) {
                    // IMPORTANT: Use ONLY the specificDates array, ignore Sch_Start_Date and Sch_End_Date
                    taskDatesToInsert = specificDates
                        .filter(ds => ds && /^\d{4}-\d{2}-\d{2}$/.test(ds))
                        .map(ds => parseDateString(ds));
                    console.log(`Plan 5: Using ${taskDatesToInsert.length} specific dates from frontend (IGNORING Sch_Start_Date/Sch_End_Date):`, 
                        taskDatesToInsert.map(d => formatDateForSQL(d)));
                } else {
                    // Only fallback to Sch_Start_Date if NO specific dates provided at all
                    if (Sch_Start_Date) {
                        taskDatesToInsert = [new Date(Sch_Start_Date)];
                        console.log(`Plan 5: No specific dates provided, falling back to Sch_Start_Date: ${formatDateForSQL(Sch_Start_Date)}`);
                    } else {
                        console.warn(`Plan 5: No specific dates and no start date provided - no task dates will be created`);
                    }
                }
            } 
            else if (Sch_Start_Date && Sch_End_Date) {
                taskDatesToInsert = generateTaskDates(
                    new Date(Sch_Start_Date), 
                    new Date(Sch_End_Date),
                    Sch_Plan_Id, 
                    selectedDays || [], 
                    planDetails, 
                    specificDates || []
                );
                console.log(`Plan ${Sch_Plan_Id}: Generated ${taskDatesToInsert.length} task dates from range`);
            }

            if (taskDatesToInsert.length > 0) {
                await insertTaskDates(db, nextSchId, taskDatesToInsert, Sch_Est_Start_Time, Sch_Est_End_Time, transaction);
                console.log(`Inserted ${taskDatesToInsert.length} task dates for schedule ${nextSchId}`);
                console.log(`Inserted dates:`, taskDatesToInsert.map(d => formatDateForSQL(d)));
            } else {
                console.warn(`No task dates generated for schedule ${nextSchId}`);
            }

            await transaction.commit();
            isTransactionActive = false;
            transaction = null;

            // Return the newly created record
            const data = await db.query(
                `SELECT s.*, t.Task_Name, p.Plan_Type, pm.Project_Name, pm.Project_Id
                 FROM tbl_Project_Schedule s
                 LEFT JOIN tbl_Task t ON s.Task_Id = t.Task_Id
                 LEFT JOIN tbl_Project_Master pm ON t.Project_Id = pm.Project_Id
                 LEFT JOIN tbl_Sch_Plan p ON s.Sch_Plan_Id = p.Plan_Id
                 WHERE s.Sch_Id = ?`,
                { replacements: [nextSchId], type: QueryTypes.SELECT }
            ) as any[];

            const taskDatesResult = await db.query(
                `SELECT * FROM tbl_Project_Sch_Task_DT WHERE Sch_Id = ? ORDER BY Task_Work_Date`,
                { replacements: [nextSchId], type: QueryTypes.SELECT }
            ) as any[];

            const planDt = Sch_Plan_Id !== 5 ? await db.query(
                `SELECT * FROM tbl_Project_Sch_DT WHERE Sch_Id = ?`,
                { replacements: [nextSchId], type: QueryTypes.SELECT }
            ) as any[] : [];

            console.log('Final task dates saved to tbl_Project_Sch_Task_DT:', taskDatesResult.map(t => t.Task_Work_Date));
            console.log('Final schedule saved to tbl_Project_Schedule:', data[0]?.Sch_Id, data[0]?.Sch_No);

            return created(res, {
                ...data[0],
                taskDates: taskDatesResult,
                planDetails: planDt
            }, 'Project schedule created successfully');

        } catch (error) {
            console.error('Error during transaction operations:', error);
            if (transaction && isTransactionActive) {
                try { await transaction.rollback(); isTransactionActive = false; } catch (e) { console.error('Rollback error:', e); }
            }
            throw error;
        }

    } catch (e) {
        console.error('Create Schedule Error:', e);
        if (transaction && isTransactionActive) {
            try { await transaction.rollback(); isTransactionActive = false; } catch (err) { console.error('Final rollback error:', err); }
        }
        return res.status(500).json({
            success: false,
            message: 'Failed to create schedule',
            error: e instanceof Error ? e.message : 'Unknown error',
            stack: process.env.NODE_ENV === 'development' ? (e instanceof Error ? e.stack : undefined) : undefined
        });
    }
};

export const updateSchedule = async (req: Request, res: Response) => {
    let transaction: Transaction | null = null;
    let isTransactionActive = false;

    try {
        const db = getDb(req);
        const currentDBName = getCurrentDatabaseName(req);
        console.log(`📊 Updating schedule in database: ${currentDBName}`);

        const idCheck = validateWithZod<{ id: number }>(ScheduleIdSchema, req.params);
        if (!idCheck.success) {
            return res.status(400).json({ success: false, errors: idCheck.errors });
        }

        const bodyCheck = validateWithZod<ScheduleUpdate>(ScheduleUpdateSchema, req.body);
        if (!bodyCheck.success) {
            return res.status(400).json({ success: false, errors: bodyCheck.errors });
        }

        const scheduleId = idCheck.data!.id;
        const updateData = bodyCheck.data!;

        // PLAN 5 => AUTO UPDATE START/END DATE FROM specificDates
        if (
            updateData.Sch_Plan_Id === 5 &&
            updateData.specificDates &&
            updateData.specificDates.length > 0
        ) {
            const sortedDates = [...updateData.specificDates].sort();

            // Convert string dates to Date objects
            updateData.Sch_Start_Date = parseDateString(sortedDates[0]);
            updateData.Sch_End_Date = parseDateString(sortedDates[sortedDates.length - 1]);

            console.log('Update Plan 5 Auto Start Date:', updateData.Sch_Start_Date);
            console.log('Update Plan 5 Auto End Date:', updateData.Sch_End_Date);
        }

        // Confirm schedule exists and get current status for completion date handling
        const exists = await db.query(
            `SELECT Sch_Plan_Id, Sch_Status FROM tbl_Project_Schedule WHERE Sch_Id = ? AND Sch_Del_Flag = 0`,
            { replacements: [scheduleId], type: QueryTypes.SELECT }
        ) as any[];

        if (!exists.length) return notFound(res, 'Project schedule not found');

        const currentPlanId = exists[0].Sch_Plan_Id;
        const currentStatus = exists[0].Sch_Status;

        // Check for duplicate schedule number
        if (updateData.Sch_No) {
            const dupCheck = await db.query(
                `SELECT 1 FROM tbl_Project_Schedule
                 WHERE UPPER(Sch_No) = UPPER(?) AND Sch_Id != ? AND Sch_Del_Flag = 0`,
                { replacements: [updateData.Sch_No, scheduleId], type: QueryTypes.SELECT }
            ) as any[];

            if (dupCheck.length) {
                return res.status(409).json({
                    success: false,
                    message: 'Schedule number already exists'
                });
            }
        }

        transaction = await db.transaction();
        isTransactionActive = true;

        try {
            // Build dynamic UPDATE
            const updateFields: string[] = [];
            const updateValues: any[] = [];

            if (updateData.Sch_No !== undefined) { updateFields.push('Sch_No = ?'); updateValues.push(updateData.Sch_No); }
            if (updateData.Sch_Date !== undefined) { updateFields.push('Sch_Date = ?'); updateValues.push(formatDateForSQL(updateData.Sch_Date)); }
            if (updateData.Task_Id !== undefined) { updateFields.push('Task_Id = ?'); updateValues.push(updateData.Task_Id); }
            if (updateData.Task_Type_Id !== undefined) { updateFields.push('Task_Type_Id = ?'); updateValues.push(updateData.Task_Type_Id); }
            if (updateData.Sch_Plan_Id !== undefined) { updateFields.push('Sch_Plan_Id = ?'); updateValues.push(updateData.Sch_Plan_Id); }
            if (updateData.Sch_Type !== undefined) { updateFields.push('Sch_Type = ?'); updateValues.push(updateData.Sch_Type); }
            if (updateData.Sch_Start_Date !== undefined) { updateFields.push('Sch_Start_Date = ?'); updateValues.push(formatDateForSQL(updateData.Sch_Start_Date)); }
            if (updateData.Sch_End_Date !== undefined) { updateFields.push('Sch_End_Date = ?'); updateValues.push(formatDateForSQL(updateData.Sch_End_Date)); }
            if (updateData.Task_Sch_Timer_Based !== undefined) { updateFields.push('Task_Sch_Timer_Based = ?'); updateValues.push(updateData.Task_Sch_Timer_Based ? 1 : 0); }
            if (updateData.Sch_Est_Start_Time !== undefined) { updateFields.push('Sch_Est_Start_Time = ?'); updateValues.push(updateData.Sch_Est_Start_Time); }
            if (updateData.Sch_Est_End_Time !== undefined) { updateFields.push('Sch_Est_End_Time = ?'); updateValues.push(updateData.Sch_Est_End_Time); }
            if (updateData.Task_Sch_Duaration !== undefined) { updateFields.push('Task_Sch_Duaration = ?'); updateValues.push(updateData.Task_Sch_Duaration); }
            
            // Handle Sch_Status with completion date logic
            if (updateData.Sch_Status !== undefined) {
                updateFields.push('Sch_Status = ?');
                updateValues.push(updateData.Sch_Status);
                
                // If setting status to 3 (completed), set completion date
                if (updateData.Sch_Status === 3) {
                    updateFields.push('Sch_Comp_Date = GETDATE()');
                } 
                // If changing from completed to another status, clear completion date
                else if (currentStatus === 3 && updateData.Sch_Status !== 3) {
                    updateFields.push('Sch_Comp_Date = NULL');
                }
            }
            
            if (updateData.Update_By !== undefined) { updateFields.push('Update_By = ?'); updateValues.push(updateData.Update_By); }
            updateFields.push('Update_Date = GETDATE()');

            if (updateFields.length > 0) {
                updateValues.push(scheduleId);
                await db.query(
                    `UPDATE tbl_Project_Schedule SET ${updateFields.join(', ')} WHERE Sch_Id = ?`,
                    { replacements: updateValues, transaction }
                );
            }

            // Regenerate task dates when schedule configuration changes
            const shouldRegenerate = updateData.Sch_Plan_Id !== undefined ||
                updateData.Sch_Start_Date !== undefined ||
                updateData.Sch_End_Date !== undefined ||
                updateData.selectedDays !== undefined ||
                updateData.specificDates !== undefined;

            if (shouldRegenerate) {
                // Delete existing detail rows
                await db.query(`DELETE FROM tbl_Project_Sch_DT WHERE Sch_Id = ?`, { replacements: [scheduleId], transaction });
                await db.query(`DELETE FROM tbl_Project_Sch_Task_DT WHERE Sch_Id = ?`, { replacements: [scheduleId], transaction });

                const getCurrentValue = async (field: string): Promise<any> => {
                    const result = await db.query(
                        `SELECT ${field} FROM tbl_Project_Schedule WHERE Sch_Id = ?`,
                        { replacements: [scheduleId], type: QueryTypes.SELECT, transaction }
                    ) as any[];
                    return result[0]?.[field];
                };

                const planId = updateData.Sch_Plan_Id !== undefined ? updateData.Sch_Plan_Id : currentPlanId;
                const startDate = updateData.Sch_Start_Date !== undefined ? updateData.Sch_Start_Date : await getCurrentValue('Sch_Start_Date');
                const endDate = updateData.Sch_End_Date !== undefined ? updateData.Sch_End_Date : await getCurrentValue('Sch_End_Date');
                const selectedDaysArray = updateData.selectedDays || [];
                const specificDatesArray = updateData.specificDates || [];
                const estStartTime = updateData.Sch_Est_Start_Time !== undefined ? updateData.Sch_Est_Start_Time : await getCurrentValue('Sch_Est_Start_Time');
                const estEndTime = updateData.Sch_Est_End_Time !== undefined ? updateData.Sch_Est_End_Time : await getCurrentValue('Sch_Est_End_Time');

                // Re-insert plan detail rows for non-Plan 5
                if (planId !== 5) {
                    await insertPlanDetails(db, scheduleId, planId, selectedDaysArray, updateData.planDetails, transaction);
                }

                // Regenerate task work dates
                let taskDatesToInsert: Date[] = [];

                if (planId === 5) {
                    // PLAN 5: SPECIFIC DATES - Use ONLY specificDates array
                    console.log('Update - Plan 5 specificDates from frontend:', specificDatesArray);
                    
                    if (specificDatesArray.length > 0) {
                        taskDatesToInsert = specificDatesArray
                            .filter(ds => ds && /^\d{4}-\d{2}-\d{2}$/.test(ds))
                            .map(ds => parseDateString(ds));
                        console.log(`Update - Plan 5: Using ${taskDatesToInsert.length} specific dates (IGNORING start/end dates)`);
                    } else if (startDate) {
                        taskDatesToInsert = [new Date(startDate)];
                        console.log(`Update - Plan 5: No specific dates, using start date as fallback`);
                    }
                } else if (startDate && endDate) {
                    taskDatesToInsert = generateTaskDates(
                        new Date(startDate), 
                        new Date(endDate),
                        planId, 
                        selectedDaysArray, 
                        updateData.planDetails, 
                        []
                    );
                }

                if (taskDatesToInsert.length > 0) {
                    await insertTaskDates(db, scheduleId, taskDatesToInsert, estStartTime, estEndTime, transaction);
                    console.log(`Update - Inserted ${taskDatesToInsert.length} task dates`);
                }
            }

            await transaction.commit();
            isTransactionActive = false;
            transaction = null;

            // Return the updated record
            const data = await db.query(
                `SELECT s.*, t.Task_Name, p.Plan_Type, pm.Project_Name, pm.Project_Id
                 FROM tbl_Project_Schedule s
                 LEFT JOIN tbl_Task t ON s.Task_Id = t.Task_Id
                 LEFT JOIN tbl_Project_Master pm ON t.Project_Id = pm.Project_Id
                 LEFT JOIN tbl_Sch_Plan p ON s.Sch_Plan_Id = p.Plan_Id
                 WHERE s.Sch_Id = ?`,
                { replacements: [scheduleId], type: QueryTypes.SELECT }
            ) as any[];

            const taskDatesResult = await db.query(
                `SELECT * FROM tbl_Project_Sch_Task_DT WHERE Sch_Id = ? ORDER BY Task_Work_Date`,
                { replacements: [scheduleId], type: QueryTypes.SELECT }
            ) as any[];

            const planDt = await db.query(
                `SELECT * FROM tbl_Project_Sch_DT WHERE Sch_Id = ?`,
                { replacements: [scheduleId], type: QueryTypes.SELECT }
            ) as any[];

            return updated(res, { ...data[0], taskDates: taskDatesResult, planDetails: planDt }, 'Project schedule updated successfully');

        } catch (error) {
            console.error('Error during transaction operations:', error);
            if (transaction && isTransactionActive) {
                try { await transaction.rollback(); isTransactionActive = false; } catch (e) { console.error('Rollback error:', e); }
            }
            throw error;
        }

    } catch (e) {
        console.error('Update Schedule Error:', e);
        if (transaction && isTransactionActive) {
            try { await transaction.rollback(); isTransactionActive = false; } catch (err) { console.error('Final rollback error:', err); }
        }
        return res.status(500).json({
            success: false,
            message: 'Failed to update schedule',
            error: e instanceof Error ? e.message : 'Unknown error',
            stack: process.env.NODE_ENV === 'development' ? (e instanceof Error ? e.stack : undefined) : undefined
        });
    }
};

export const updateScheduleStatus = async (req: Request, res: Response) => {
    try {
        const db = getDb(req);
        const currentDBName = getCurrentDatabaseName(req);
        console.log(`📊 Updating schedule status in database: ${currentDBName}`);

        const idCheck = validateWithZod<{ id: number }>(ScheduleIdSchema, req.params);
        if (!idCheck.success) {
            return res.status(400).json({ success: false, errors: idCheck.errors });
        }

        const bodyCheck = validateWithZod<ScheduleStatusUpdate>(ScheduleStatusUpdateSchema, req.body);
        if (!bodyCheck.success) {
            return res.status(400).json({ success: false, errors: bodyCheck.errors });
        }

        const status = bodyCheck.data!.status;
        const updateBy = bodyCheck.data!.Update_By;
        const scheduleId = idCheck.data!.id;

        // Get current status to determine if completion date should be cleared
        const currentRecord = await db.query(
            `SELECT Sch_Status FROM tbl_Project_Schedule WHERE Sch_Id = ? AND Sch_Del_Flag = 0`,
            { replacements: [scheduleId], type: QueryTypes.SELECT }
        ) as any[];

        const currentStatus = currentRecord[0]?.Sch_Status;

        // Build the update query with completion date logic
        let compDateUpdate = '';
        if (status === 3) {
            // Setting to completed
            compDateUpdate = ', Sch_Comp_Date = GETDATE()';
        } else if (currentStatus === 3 && status !== 3) {
            // Changing from completed to another status
            compDateUpdate = ', Sch_Comp_Date = NULL';
        }

        await db.query(
            `UPDATE tbl_Project_Schedule 
             SET Sch_Status = ?, 
                 Update_By = ?, 
                 Update_Date = GETDATE()
                 ${compDateUpdate}
             WHERE Sch_Id = ? AND Sch_Del_Flag = 0`,
            { replacements: [status, updateBy, scheduleId] }
        );

        // Fetch updated record to return
        const updatedRecord = await db.query(
            `SELECT s.*, t.Task_Name, p.Plan_Type, pm.Project_Name, pm.Project_Id
             FROM tbl_Project_Schedule s
             LEFT JOIN tbl_Task t ON s.Task_Id = t.Task_Id
             LEFT JOIN tbl_Project_Master pm ON t.Project_Id = pm.Project_Id
             LEFT JOIN tbl_Sch_Plan p ON s.Sch_Plan_Id = p.Plan_Id
             WHERE s.Sch_Id = ? AND s.Sch_Del_Flag = 0`,
            { replacements: [scheduleId], type: QueryTypes.SELECT }
        ) as any[];

        // Also fetch task dates if needed
        const taskDatesResult = await db.query(
            `SELECT * FROM tbl_Project_Sch_Task_DT WHERE Sch_Id = ? ORDER BY Task_Work_Date`,
            { replacements: [scheduleId], type: QueryTypes.SELECT }
        ) as any[];

        const planDt = await db.query(
            `SELECT * FROM tbl_Project_Sch_DT WHERE Sch_Id = ?`,
            { replacements: [scheduleId], type: QueryTypes.SELECT }
        ) as any[];

        const responseData = updatedRecord[0] ? {
            ...updatedRecord[0],
            taskDates: taskDatesResult,
            planDetails: planDt
        } : null;

        updated(res, responseData, 'Schedule status updated successfully');
    } catch (e) {
        console.error('Error in updateScheduleStatus:', e);
        servError(e, res);
    }
};

export const deleteSchedule = async (req: Request, res: Response) => {
    try {
        const db = getDb(req);
        const currentDBName = getCurrentDatabaseName(req);
        console.log(`📊 Deleting schedule from database: ${currentDBName}`);

        const validation = validateWithZod<{ id: number }>(ScheduleIdSchema, req.params);
        if (!validation.success) {
            return res.status(400).json({ success: false, errors: validation.errors });
        }

        await db.query(
            `UPDATE tbl_Project_Schedule SET Sch_Del_Flag = 1, Update_Date = GETDATE()
             WHERE Sch_Id = ? AND Sch_Del_Flag = 0`,
            { replacements: [validation.data!.id] }
        );

        deleted(res, 'Project schedule deleted successfully');
    } catch (e) {
        console.error('Error in deleteSchedule:', e);
        servError(e, res);
    }
};

export const getSchedulePlansDropdown = async (req: Request, res: Response) => {
    try {
        const db = getDb(req);
        const currentDBName = getCurrentDatabaseName(req);
        console.log(`📊 Getting schedule plans dropdown from database: ${currentDBName}`);

        const rows = await db.query(
            `SELECT Plan_Id as value, Plan_Type as label FROM tbl_Sch_Plan ORDER BY Plan_Id`,
            { type: QueryTypes.SELECT }
        ) as any[];

        sentData(res, rows);
    } catch (e) {
        console.error('Error in getSchedulePlansDropdown:', e);
        servError(e, res);
    }
};

export const getTasksDropdown = async (req: Request, res: Response) => {
    try {
        const db = getDb(req);
        const currentDBName = getCurrentDatabaseName(req);
        console.log(`📊 Getting tasks dropdown from database: ${currentDBName}`);

        const rows = await db.query(
            `SELECT Task_Id as value, Task_Name as label FROM tbl_Task ORDER BY Task_Name`,
            { type: QueryTypes.SELECT }
        ) as any[];

        sentData(res, rows);
    } catch (e) {
        console.error('Error in getTasksDropdown:', e);
        servError(e, res);
    }
};

export const getScheduleTypesDropdown = async (req: Request, res: Response) => {
    try {
        const scheduleTypes = [
            { value: 1, label: 'Special' },
            { value: 2, label: 'Day' },
            { value: 3, label: 'Week' },
            { value: 4, label: 'Month' }
        ];
        sentData(res, scheduleTypes);
    } catch (e) {
        console.error('Error in getScheduleTypesDropdown:', e);
        servError(e, res);
    }
};

export const getScheduleDropdown = async (req: Request, res: Response) => {
    try {
        const db = getDb(req);
        const currentDBName = getCurrentDatabaseName(req);
        console.log(`📊 Getting schedule dropdown from database: ${currentDBName}`);

        const rows = await db.query(
            `SELECT s.Sch_Id as value, s.Sch_No + ' - ' + ISNULL(t.Task_Name, 'No Task') as label
             FROM tbl_Project_Schedule s
             LEFT JOIN tbl_Task t ON s.Task_Id = t.Task_Id
             WHERE s.Sch_Del_Flag = 0
             ORDER BY s.Sch_No DESC`,
            { type: QueryTypes.SELECT }
        ) as any[];

        sentData(res, rows);
    } catch (e) {
        console.error('Error in getScheduleDropdown:', e);
        servError(e, res);
    }
};

export const getAllActiveSchedules = async (req: Request, res: Response) => {
    try {
        const db = getDb(req);
        const currentDBName = getCurrentDatabaseName(req);
        console.log(`📊 Getting active schedules from database: ${currentDBName}`);

        const rows = await db.query(
            `SELECT s.*, t.Task_Name, p.Plan_Type, pm.Project_Name, pm.Project_Id
             FROM tbl_Project_Schedule s
             LEFT JOIN tbl_Task t ON s.Task_Id = t.Task_Id
             LEFT JOIN tbl_Project_Master pm ON t.Project_Id = pm.Project_Id
             LEFT JOIN tbl_Sch_Plan p ON s.Sch_Plan_Id = p.Plan_Id
             WHERE s.Sch_Del_Flag = 0 AND s.Sch_Status = 1
             ORDER BY s.Sch_Date DESC`,
            { type: QueryTypes.SELECT }
        ) as any[];

        sentData(res, rows);
    } catch (e) {
        console.error('Error in getAllActiveSchedules:', e);
        servError(e, res);
    }
};