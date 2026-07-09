import { Request, Response } from 'express';
import { Op, Sequelize } from 'sequelize';
import { ZodError } from 'zod';
import { updated, notFound } from '../../../responseObject';
import { initTaskDetailModel, TaskDetailWithSchedule, TaskDetailCreateInput, TaskDetailUpdateInput, TaskDetailQueryParams, taskDetailQuerySchema, taskDetailIdSchema, taskDetailUpdateSchema, taskDetailCreateSchema } from '../../../models/taskDetails/type.model';

// Define interface for schedule task data
interface ScheduleTaskData {
    Task_Work_Date: Date;
    Task_Start_Time: Date;
    Task_End_Time: Date;
}

function parseIdParam(param: string | string[] | undefined): number | null {
    if (!param || Array.isArray(param)) return null;
    const parsed = parseInt(param);
    return isNaN(parsed) ? null : parsed;
}

function getStringParam(param: string | string[] | undefined): string | undefined {
    if (!param) return undefined;
    return Array.isArray(param) ? param[0] : param;
}

const validateWithZod = <T>(schema: any, data: any): {
    success: boolean;
    data?: T;
    errors?: Array<{ field: string; message: string }>
} => {
    try {
        const validatedData = schema.parse(data);
        return { success: true, data: validatedData };
    } catch (error: any) {
        if (error instanceof ZodError) {
            const issues = error.issues;
            return {
                success: false,
                errors: issues.map((err: any) => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            };
        }
        return {
            success: false,
            errors: [{ field: 'unknown', message: error.message || 'Validation failed' }]
        };
    }
};

// Helper function to convert raw query results to model format
function mapRawToTaskDetail(raw: any): TaskDetailWithSchedule {
    if (!raw) return {} as TaskDetailWithSchedule;
    
    return {
        Id: raw.Id,
        AN_No: raw.AN_No,
        Project_Id: raw.Project_Id,
        Sch_Id: raw.Sch_Id,
        Task_Levl_Id: raw.Task_Levl_Id,
        Task_Id: raw.Task_Id,
        Assigned_Emp_Id: raw.Assigned_Emp_Id,
        Emp_Id: raw.Emp_Id,
        Task_Assign_dt: raw.Task_Assign_dt,
        Sch_Period: raw.Sch_Period,
        Sch_Time: raw.Sch_Time,
        EN_Time: raw.EN_Time,
        Ord_By: raw.Ord_By,
        Invovled_Stat: raw.Invovled_Stat,
        Schedule_Task_Sch_Timer_Based: raw.Schedule_Task_Sch_Timer_Based,
        Schedule_Sch_No: raw.Schedule_Sch_No,
        Schedule_Sch_Date: raw.Schedule_Sch_Date,
        Schedule_Task_Type_Id: raw.Schedule_Task_Type_Id,
        Schedule_Sch_Plan_Id: raw.Schedule_Sch_Plan_Id,
        Schedule_Sch_Start_Date: raw.Schedule_Sch_Start_Date,
        Schedule_Sch_End_Date: raw.Schedule_Sch_End_Date,
        Schedule_Task_Sch_Duaration: raw.Schedule_Task_Sch_Duaration,
        Schedule_Sch_Status: raw.Schedule_Sch_Status,
        Task_Name: raw.Task_Name,
        Task_Desc: raw.Task_Desc,
        Task_Type_Id: raw.Task_Type_Id
    };
}

// Helper to get company database from request
const getCompanyDB = (req: Request): Sequelize => {
    return (req as any).companyDB || (req as any).sequelize;
};

// Helper to get TaskDetail model for specific database
const getTaskDetailModel = (sequelizeInstance: Sequelize) => {
    return initTaskDetailModel(sequelizeInstance);
};

export const getAllTaskDetails = async (req: Request, res: Response) => {
    try {
        const companyDB = getCompanyDB(req);
        
        const validation = validateWithZod<TaskDetailQueryParams>(taskDetailQuerySchema, req.query);
        
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const {
            Project_Id,
            Sch_Id,
            Task_Id,
            Emp_Id,
            Assigned_Emp_Id,
            Invovled_Stat,
            from_Task_Assign_dt,
            to_Task_Assign_dt,
            sortBy = 'td.Id',
            sortOrder = 'DESC'
        } = validation.data!;

        // Build WHERE conditions
        let whereClause = '1=1';
        const replacements: any = {};

        if (Project_Id) {
            whereClause += ' AND td.Project_Id = :Project_Id';
            replacements.Project_Id = Project_Id;
        }
        if (Sch_Id) {
            whereClause += ' AND td.Sch_Id = :Sch_Id';
            replacements.Sch_Id = Sch_Id;
        }
        if (Task_Id) {
            whereClause += ' AND td.Task_Id = :Task_Id';
            replacements.Task_Id = Task_Id;
        }
        if (Emp_Id) {
            whereClause += ' AND td.Emp_Id = :Emp_Id';
            replacements.Emp_Id = Emp_Id;
        }
        if (Assigned_Emp_Id) {
            whereClause += ' AND td.Assigned_Emp_Id = :Assigned_Emp_Id';
            replacements.Assigned_Emp_Id = Assigned_Emp_Id;
        }
        if (Invovled_Stat !== undefined && Invovled_Stat !== null) {
            whereClause += ' AND td.Invovled_Stat = :Invovled_Stat';
            replacements.Invovled_Stat = Invovled_Stat;
        }
        if (from_Task_Assign_dt) {
            const startDate = new Date(from_Task_Assign_dt);
            startDate.setHours(0, 0, 0, 0);
            whereClause += ' AND td.Task_Assign_dt >= :from_Task_Assign_dt';
            replacements.from_Task_Assign_dt = startDate;
        }
        if (to_Task_Assign_dt) {
            const endDate = new Date(to_Task_Assign_dt);
            endDate.setHours(23, 59, 59, 999);
            whereClause += ' AND td.Task_Assign_dt <= :to_Task_Assign_dt';
            replacements.to_Task_Assign_dt = endDate;
        }

        const rows: any[] = await companyDB.query(
            `WITH LatestSchedules AS (
                 SELECT Task_Id, MAX(Sch_Id) as Max_Sch_Id
                 FROM tbl_Project_Schedule
                 GROUP BY Task_Id
             )
             SELECT 
                td.*,
                ps.Task_Sch_Timer_Based as Schedule_Task_Sch_Timer_Based,
                ps.Sch_No as Schedule_Sch_No,
                ps.Sch_Date as Schedule_Sch_Date,
                ps.Task_Type_Id as Schedule_Task_Type_Id,
                ps.Sch_Plan_Id as Schedule_Sch_Plan_Id,
                ps.Sch_Start_Date as Schedule_Sch_Start_Date,
                ps.Sch_End_Date as Schedule_Sch_End_Date,
                ps.Task_Sch_Duaration as Schedule_Task_Sch_Duaration,
                ps.Sch_Status as Schedule_Sch_Status,
                t.Task_Name,
                t.Task_Desc,
                t.Task_Type_Id
             FROM tbl_Task_Details td
             LEFT JOIN LatestSchedules ls ON ls.Task_Id = td.Task_Id
             LEFT JOIN tbl_Project_Schedule ps ON ps.Sch_Id = ls.Max_Sch_Id
             LEFT JOIN tbl_Task t ON td.Task_Id = t.Task_Id
             WHERE ${whereClause}
             ORDER BY ${sortBy} ${sortOrder}`,
            {
                replacements,
                type: 'SELECT'
            }
        );

        const mappedRows = (rows || []).map(mapRawToTaskDetail);

        return res.status(200).json({
            success: true,
            message: 'Task details retrieved successfully',
            data: mappedRows
        });

    } catch (error: any) {
        console.error('Error fetching task details:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getTaskDetailById = async (req: Request, res: Response) => {
    try {
        const companyDB = getCompanyDB(req);
        
        const id = parseIdParam(req.params.id);
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID parameter'
            });
        }

        const validation = validateWithZod<{ id: number }>(taskDetailIdSchema, { id });
        
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const rows: any[] = await companyDB.query(
            `SELECT 
                td.*,
                ps.Task_Sch_Timer_Based as Schedule_Task_Sch_Timer_Based,
                ps.Sch_No as Schedule_Sch_No,
                ps.Sch_Date as Schedule_Sch_Date,
                ps.Task_Type_Id as Schedule_Task_Type_Id,
                ps.Sch_Plan_Id as Schedule_Sch_Plan_Id,
                ps.Sch_Start_Date as Schedule_Sch_Start_Date,
                ps.Sch_End_Date as Schedule_Sch_End_Date,
                ps.Task_Sch_Duaration as Schedule_Task_Sch_Duaration,
                ps.Sch_Status as Schedule_Sch_Status,
                t.Task_Name,
                t.Task_Desc,
                t.Task_Type_Id
             FROM tbl_Task_Details td
             LEFT JOIN tbl_Project_Schedule ps ON td.Task_Id = ps.Task_Id
             LEFT JOIN tbl_Task t ON td.Task_Id = t.Task_Id
             WHERE td.Id = :id`,
            {
                replacements: { id },
                type: 'SELECT'
            }
        );

        const taskDetail = rows && rows.length > 0 ? rows[0] : null;
        
        if (!taskDetail) {
            return notFound(res, 'Task detail not found');
        }

        const mappedTaskDetail = mapRawToTaskDetail(taskDetail);

        return res.status(200).json({
            success: true,
            message: 'Task detail retrieved successfully',
            data: mappedTaskDetail
        });

    } catch (error: any) {
        console.error('Error fetching task detail:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getTaskDetailsByProject = async (req: Request, res: Response) => {
    try {
        const companyDB = getCompanyDB(req);
        
        const projectIdParam = getStringParam(req.params.projectId);
        
        if (!projectIdParam || isNaN(parseInt(projectIdParam))) {
            return res.status(400).json({
                success: false,
                message: 'Valid project ID is required'
            });
        }

        const projectId = parseInt(projectIdParam);

        const rows: any[] = await companyDB.query(
            `SELECT 
                td.*,
                ps.Task_Sch_Timer_Based as Schedule_Task_Sch_Timer_Based,
                ps.Sch_No as Schedule_Sch_No,
                ps.Sch_Date as Schedule_Sch_Date,
                ps.Task_Type_Id as Schedule_Task_Type_Id,
                ps.Sch_Plan_Id as Schedule_Sch_Plan_Id,
                ps.Sch_Start_Date as Schedule_Sch_Start_Date,
                ps.Sch_End_Date as Schedule_Sch_End_Date,
                ps.Task_Sch_Duaration as Schedule_Task_Sch_Duaration,
                ps.Sch_Status as Schedule_Sch_Status,
                t.Task_Name,
                t.Task_Desc,
                t.Task_Type_Id
             FROM tbl_Task_Details td
             LEFT JOIN tbl_Project_Schedule ps ON td.Task_Id = ps.Task_Id
             LEFT JOIN tbl_Task t ON td.Task_Id = t.Task_Id
             WHERE td.Project_Id = :projectId
             ORDER BY td.Id DESC`,
            {
                replacements: { projectId },
                type: 'SELECT'
            }
        );

        const mappedRows = (rows || []).map(mapRawToTaskDetail);

        return res.status(200).json({
            success: true,
            message: 'Task details retrieved successfully',
            data: mappedRows
        });

    } catch (error: any) {
        console.error('Error fetching task details by project:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getTaskDetailsBySchedule = async (req: Request, res: Response) => {
    try {
        const companyDB = getCompanyDB(req);
        
        const schIdParam = getStringParam(req.params.schId);
        
        if (!schIdParam || isNaN(parseInt(schIdParam))) {
            return res.status(400).json({
                success: false,
                message: 'Valid schedule ID is required'
            });
        }

        const schId = parseInt(schIdParam);

        const rows: any[] = await companyDB.query(
            `SELECT 
                td.*,
                ps.Task_Sch_Timer_Based as Schedule_Task_Sch_Timer_Based,
                ps.Sch_No as Schedule_Sch_No,
                ps.Sch_Date as Schedule_Sch_Date,
                ps.Task_Type_Id as Schedule_Task_Type_Id,
                ps.Sch_Plan_Id as Schedule_Sch_Plan_Id,
                ps.Sch_Start_Date as Schedule_Sch_Start_Date,
                ps.Sch_End_Date as Schedule_Sch_End_Date,
                ps.Task_Sch_Duaration as Schedule_Task_Sch_Duaration,
                ps.Sch_Status as Schedule_Sch_Status,
                t.Task_Name,
                t.Task_Desc,
                t.Task_Type_Id
             FROM tbl_Task_Details td
             LEFT JOIN tbl_Project_Schedule ps ON td.Task_Id = ps.Task_Id
             LEFT JOIN tbl_Task t ON td.Task_Id = t.Task_Id
             WHERE td.Sch_Id = :schId
             ORDER BY td.Id DESC`,
            {
                replacements: { schId },
                type: 'SELECT'
            }
        );

        const mappedRows = (rows || []).map(mapRawToTaskDetail);

        return res.status(200).json({
            success: true,
            message: 'Task details retrieved successfully',
            data: mappedRows
        });

    } catch (error: any) {
        console.error('Error fetching task details by schedule:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getTaskDetailsByTask = async (req: Request, res: Response) => {
    try {
        const companyDB = getCompanyDB(req);
        
        const taskIdParam = getStringParam(req.params.taskId);
        
        if (!taskIdParam || isNaN(parseInt(taskIdParam))) {
            return res.status(400).json({
                success: false,
                message: 'Valid task ID is required'
            });
        }

        const taskId = parseInt(taskIdParam);

        const rows: any[] = await companyDB.query(
            `SELECT 
                td.*,
                ps.Task_Sch_Timer_Based as Schedule_Task_Sch_Timer_Based,
                ps.Sch_No as Schedule_Sch_No,
                ps.Sch_Date as Schedule_Sch_Date,
                ps.Task_Type_Id as Schedule_Task_Type_Id,
                ps.Sch_Plan_Id as Schedule_Sch_Plan_Id,
                ps.Sch_Start_Date as Schedule_Sch_Start_Date,
                ps.Sch_End_Date as Schedule_Sch_End_Date,
                ps.Task_Sch_Duaration as Schedule_Task_Sch_Duaration,
                ps.Sch_Status as Schedule_Sch_Status,
                t.Task_Name,
                t.Task_Desc,
                t.Task_Type_Id
             FROM tbl_Task_Details td
             LEFT JOIN tbl_Project_Schedule ps ON td.Task_Id = ps.Task_Id
             LEFT JOIN tbl_Task t ON td.Task_Id = t.Task_Id
             WHERE td.Task_Id = :taskId
             ORDER BY td.Id DESC`,
            {
                replacements: { taskId },
                type: 'SELECT'
            }
        );

        const mappedRows = (rows || []).map(mapRawToTaskDetail);

        return res.status(200).json({
            success: true,
            message: 'Task details retrieved successfully',
            data: mappedRows
        });

    } catch (error: any) {
        console.error('Error fetching task details by task:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getTaskDetailsByEmployee = async (req: Request, res: Response) => {
    try {
        const companyDB = getCompanyDB(req);
        
        const empIdParam = getStringParam(req.params.empId);
        
        if (!empIdParam || isNaN(parseInt(empIdParam))) {
            return res.status(400).json({
                success: false,
                message: 'Valid employee ID is required'
            });
        }

        const empId = parseInt(empIdParam);

        const rows: any[] = await companyDB.query(
            `SELECT 
                td.*,
                ps.Task_Sch_Timer_Based as Schedule_Task_Sch_Timer_Based,
                ps.Sch_No as Schedule_Sch_No,
                ps.Sch_Date as Schedule_Sch_Date,
                ps.Task_Type_Id as Schedule_Task_Type_Id,
                ps.Sch_Plan_Id as Schedule_Sch_Plan_Id,
                ps.Sch_Start_Date as Schedule_Sch_Start_Date,
                ps.Sch_End_Date as Schedule_Sch_End_Date,
                ps.Task_Sch_Duaration as Schedule_Task_Sch_Duaration,
                ps.Sch_Status as Schedule_Sch_Status,
                t.Task_Name,
                t.Task_Desc,
                t.Task_Type_Id
             FROM tbl_Task_Details td
             LEFT JOIN tbl_Project_Schedule ps ON td.Task_Id = ps.Task_Id
             LEFT JOIN tbl_Task t ON td.Task_Id = t.Task_Id
             WHERE td.Emp_Id = :empId
             ORDER BY td.Id DESC`,
            {
                replacements: { empId },
                type: 'SELECT'
            }
        );

        const mappedRows = (rows || []).map(mapRawToTaskDetail);

        return res.status(200).json({
            success: true,
            message: 'Task details retrieved successfully',
            data: mappedRows
        });

    } catch (error: any) {
        console.error('Error fetching task details by employee:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getTaskDetailsWithFilters = async (req: Request, res: Response) => {
    try {
        const companyDB = getCompanyDB(req);
        
        const validation = validateWithZod<TaskDetailQueryParams>(taskDetailQuerySchema, req.query);
        
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const {
            Project_Ids,
            Task_Ids,
            Emp_Ids,
            has_AN_No,
            has_Assigned_Emp,
            sortBy = 'td.Id',
            sortOrder = 'DESC'
        } = validation.data!;

        let whereClause = '1=1';
        const replacements: any = {};

        if (Project_Ids && Project_Ids.length > 0) {
            whereClause += ' AND td.Project_Id IN (:Project_Ids)';
            replacements.Project_Ids = Project_Ids;
        }

        if (Task_Ids && Task_Ids.length > 0) {
            whereClause += ' AND td.Task_Id IN (:Task_Ids)';
            replacements.Task_Ids = Task_Ids;
        }

        if (Emp_Ids && Emp_Ids.length > 0) {
            whereClause += ' AND td.Emp_Id IN (:Emp_Ids)';
            replacements.Emp_Ids = Emp_Ids;
        }

        if (has_AN_No !== undefined) {
            if (has_AN_No) {
                whereClause += ' AND td.AN_No IS NOT NULL';
            } else {
                whereClause += ' AND td.AN_No IS NULL';
            }
        }

        if (has_Assigned_Emp !== undefined) {
            if (has_Assigned_Emp) {
                whereClause += ' AND td.Assigned_Emp_Id IS NOT NULL';
            } else {
                whereClause += ' AND td.Assigned_Emp_Id IS NULL';
            }
        }

        const rows: any[] = await companyDB.query(
            `SELECT 
                td.*,
                ps.Task_Sch_Timer_Based as Schedule_Task_Sch_Timer_Based,
                ps.Sch_No as Schedule_Sch_No,
                ps.Sch_Date as Schedule_Sch_Date,
                ps.Task_Type_Id as Schedule_Task_Type_Id,
                ps.Sch_Plan_Id as Schedule_Sch_Plan_Id,
                ps.Sch_Start_Date as Schedule_Sch_Start_Date,
                ps.Sch_End_Date as Schedule_Sch_End_Date,
                ps.Task_Sch_Duaration as Schedule_Task_Sch_Duaration,
                ps.Sch_Status as Schedule_Sch_Status,
                t.Task_Name,
                t.Task_Desc,
                t.Task_Type_Id
             FROM tbl_Task_Details td
             LEFT JOIN tbl_Project_Schedule ps ON td.Task_Id = ps.Task_Id
             LEFT JOIN tbl_Task t ON td.Task_Id = t.Task_Id
             WHERE ${whereClause}
             ORDER BY ${sortBy} ${sortOrder}`,
            {
                replacements,
                type: 'SELECT'
            }
        );

        const mappedRows = (rows || []).map(mapRawToTaskDetail);

        return res.status(200).json({
            success: true,
            message: 'Task details retrieved successfully',
            data: mappedRows
        });

    } catch (error: any) {
        console.error('Error fetching task details with filters:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const updateTaskDetail = async (req: Request, res: Response) => {
    try {
        const companyDB = getCompanyDB(req);
        const TaskDetailModel = getTaskDetailModel(companyDB);
        
        const id = parseIdParam(req.params.id);
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID parameter'
            });
        }

        const idValidation = validateWithZod<{ id: number }>(taskDetailIdSchema, { id });
        
        if (!idValidation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: idValidation.errors
            });
        }

        const bodyValidation = validateWithZod<TaskDetailUpdateInput>(taskDetailUpdateSchema, req.body);
        
        if (!bodyValidation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: bodyValidation.errors
            });
        }

        const updateData = bodyValidation.data!;

        const taskDetail = await TaskDetailModel.findByPk(id);
        
        if (!taskDetail) {
            return notFound(res, 'Task detail not found');
        }

        // If updating Sch_Id, Emp_Id, or Task_Assign_dt, check for duplicates
        if (updateData.Sch_Id || updateData.Emp_Id || updateData.Task_Assign_dt) {
            const newSchId = updateData.Sch_Id !== undefined ? updateData.Sch_Id : taskDetail.Sch_Id;
            const newEmpId = updateData.Emp_Id !== undefined ? updateData.Emp_Id : taskDetail.Emp_Id;
            const newTaskAssignDt = updateData.Task_Assign_dt !== undefined ? updateData.Task_Assign_dt : taskDetail.Task_Assign_dt;

            const duplicateCheck: any[] = await companyDB.query(
                `SELECT Id FROM tbl_Task_Details 
                 WHERE Sch_Id = :schId 
                   AND Emp_Id = :empId 
                   AND Task_Assign_dt >= CAST(:taskAssignDt AS DATETIME)
                   AND Task_Assign_dt < DATEADD(day, 1, CAST(:taskAssignDt AS DATETIME))
                   AND Id != :id`,
                {
                    replacements: {
                        schId: newSchId,
                        empId: newEmpId,
                        taskAssignDt: newTaskAssignDt,
                        id: id
                    },
                    type: 'SELECT'
                }
            );

            if (duplicateCheck && duplicateCheck.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Duplicate record found: Same Sch_Id, Emp_Id, and Task_Assign_dt combination already exists',
                    duplicateId: duplicateCheck[0].Id
                });
            }
        }

        await taskDetail.update(updateData);
        
        const rows: any[] = await companyDB.query(
            `SELECT 
                td.*,
                ps.Task_Sch_Timer_Based as Schedule_Task_Sch_Timer_Based,
                ps.Sch_No as Schedule_Sch_No,
                ps.Sch_Date as Schedule_Sch_Date,
                ps.Task_Type_Id as Schedule_Task_Type_Id,
                ps.Sch_Plan_Id as Schedule_Sch_Plan_Id,
                ps.Sch_Start_Date as Schedule_Sch_Start_Date,
                ps.Sch_End_Date as Schedule_Sch_End_Date,
                ps.Task_Sch_Duaration as Schedule_Task_Sch_Duaration,
                ps.Sch_Status as Schedule_Sch_Status,
                t.Task_Name,
                t.Task_Desc,
                t.Task_Type_Id
             FROM tbl_Task_Details td
             LEFT JOIN tbl_Project_Schedule ps ON td.Task_Id = ps.Task_Id
             LEFT JOIN tbl_Task t ON td.Task_Id = t.Task_Id
             WHERE td.Id = :id`,
            {
                replacements: { id },
                type: 'SELECT'
            }
        );

        const updatedTaskDetail = rows && rows.length > 0 ? rows[0] : null;
        
        if (!updatedTaskDetail) {
            return notFound(res, 'Task detail not found after update');
        }

        const mappedTaskDetail = mapRawToTaskDetail(updatedTaskDetail);
        
        return updated(res, {
            success: true,
            message: 'Task detail updated successfully',
            data: mappedTaskDetail
        });

    } catch (error: any) {
        console.error('Error updating task detail:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const deleteTaskDetail = async (req: Request, res: Response) => {
    try {
        const companyDB = getCompanyDB(req);
        const TaskDetailModel = getTaskDetailModel(companyDB);
        
        const id = parseIdParam(req.params.id);
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID parameter'
            });
        }

        const validation = validateWithZod<{ id: number }>(taskDetailIdSchema, { id });
        
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const taskDetail = await TaskDetailModel.findByPk(id);
        
        if (!taskDetail) {
            return notFound(res, 'Task detail not found');
        }

        await taskDetail.destroy();
        
        return res.status(200).json({
            success: true,
            message: 'Task detail deleted successfully'
        });

    } catch (error: any) {
        console.error('Error deleting task detail:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getTaskDetailsStatistics = async (req: Request, res: Response) => {
    try {
        const companyDB = getCompanyDB(req);
        const TaskDetailModel = getTaskDetailModel(companyDB);
        
        const totalRecords = await TaskDetailModel.count();
        const recordsWithAN = await TaskDetailModel.count({ where: { AN_No: { [Op.ne]: null } } });
        const recordsWithAssignedEmp = await TaskDetailModel.count({ where: { Assigned_Emp_Id: { [Op.ne]: null } } });
        
        const statusCounts = await TaskDetailModel.findAll({
            attributes: ['Invovled_Stat', [companyDB.fn('COUNT', companyDB.col('Invovled_Stat')), 'count']],
            where: { Invovled_Stat: { [Op.ne]: null } },
            group: ['Invovled_Stat']
        });

        const timerBasedStatsResult: any = await companyDB.query(
            `SELECT 
                COUNT(DISTINCT td.Task_Id) as tasksWithTimerBased,
                SUM(CASE WHEN ps.Task_Sch_Timer_Based = 1 THEN 1 ELSE 0 END) as timerBasedCount
             FROM tbl_Task_Details td
             LEFT JOIN tbl_Project_Schedule ps ON td.Task_Id = ps.Task_Id`,
            { type: 'SELECT' }
        );

        const timerBasedStats = (timerBasedStatsResult && timerBasedStatsResult.length > 0) 
            ? timerBasedStatsResult[0] 
            : { tasksWithTimerBased: 0, timerBasedCount: 0 };

        return res.status(200).json({
            success: true,
            message: 'Statistics retrieved successfully',
            data: {
                totalRecords,
                recordsWithAN,
                recordsWithAssignedEmp,
                recordsWithoutAN: totalRecords - recordsWithAN,
                recordsWithoutAssignedEmp: totalRecords - recordsWithAssignedEmp,
                statusDistribution: statusCounts,
                scheduleStats: timerBasedStats
            }
        });

    } catch (error: any) {
        console.error('Error fetching statistics:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const createTaskDetailsRaw = async (req: Request, res: Response) => {
    const companyDB = getCompanyDB(req);
    const transaction = await companyDB.transaction();

    try {
        const validation = validateWithZod<TaskDetailCreateInput>(
            taskDetailCreateSchema,
            req.body
        );

        if (!validation.success) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validation.errors
            });
        }

        const {
            Project_Id,
            Sch_Id,
            Task_Id,
            Emp_Ids,
            Task_Levl_Id,
            Assigned_Emp_Id,
            Ord_By,
            Invovled_Stat
        } = validation.data!;

        // Fetch data from tbl_Project_Sch_Task_DT based on Sch_Id
        const scheduleTaskData: any[] = await companyDB.query(
            `SELECT 
                Task_Work_Date,
                Task_Start_Time,
                Task_End_Time
             FROM tbl_Project_Sch_Task_DT 
             WHERE Sch_Id = :schId
             ORDER BY Task_Work_Date ASC`,
            {
                replacements: { schId: Sch_Id },
                type: 'SELECT',
                transaction
            }
        );

        if (!scheduleTaskData || scheduleTaskData.length === 0) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: `No schedule task data found for Sch_Id: ${Sch_Id}`
            });
        }

        // Get the current max AN_No to generate next values
        const maxAnNoResult: any = await companyDB.query(
            `SELECT ISNULL(MAX(AN_No), 0) AS maxANNo FROM tbl_Task_Details`,
            { transaction, type: 'SELECT' }
        );

        let nextANNo = (maxAnNoResult[0]?.maxANNo || 0) + 1;
        const insertedAN_NoValues: number[] = [];
        let totalRecordsCreated = 0;
        const duplicateRecords: any[] = [];
        const successfulRecords: any[] = [];

        // For each employee and each schedule task record, create a task detail
        for (let i = 0; i < Emp_Ids.length; i++) {
            for (let j = 0; j < scheduleTaskData.length; j++) {
                const taskRecord = scheduleTaskData[j] as ScheduleTaskData;
                
                // Check if duplicate exists for Sch_Id, Emp_Id, and Task_Assign_dt (date only)
                const checkDuplicate: any[] = await companyDB.query(
                    `SELECT Id FROM tbl_Task_Details 
                     WHERE Sch_Id = :schId 
                       AND Emp_Id = :empId 
                       AND Task_Assign_dt >= CAST(:taskAssignDt AS DATETIME)
                   AND Task_Assign_dt < DATEADD(day, 1, CAST(:taskAssignDt AS DATETIME))`,
                    {
                        replacements: {
                            schId: Sch_Id,
                            empId: Emp_Ids[i],
                            taskAssignDt: taskRecord.Task_Work_Date
                        },
                        transaction,
                        type: 'SELECT'
                    }
                );

                if (checkDuplicate && checkDuplicate.length > 0) {
                    // Record duplicate found - skip insertion
                    duplicateRecords.push({
                        employeeId: Emp_Ids[i],
                        scheduleDate: taskRecord.Task_Work_Date,
                        existingId: checkDuplicate[0].Id
                    });
                    continue;
                }

                // Insert new record if no duplicate found
                await companyDB.query(
                    `INSERT INTO tbl_Task_Details
                    (AN_No, Project_Id, Sch_Id, Task_Levl_Id, Task_Id, Assigned_Emp_Id, Emp_Id, 
                     Task_Assign_dt, Sch_Time, EN_Time, Ord_By, Invovled_Stat)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    {
                        replacements: [
                            nextANNo,
                            Project_Id,
                            Sch_Id,
                            Task_Levl_Id || null,
                            Task_Id,
                            Assigned_Emp_Id || null,
                            Emp_Ids[i],
                            taskRecord.Task_Work_Date,
                            taskRecord.Task_Start_Time,
                            taskRecord.Task_End_Time,
                            Ord_By || null,
                            Invovled_Stat || null
                        ],
                        transaction,
                        type: 'INSERT'
                    }
                );

                insertedAN_NoValues.push(nextANNo);
                successfulRecords.push({
                    employeeId: Emp_Ids[i],
                    scheduleDate: taskRecord.Task_Work_Date,
                    anNo: nextANNo
                });
                totalRecordsCreated++;
                nextANNo++;
            }
        }

        await transaction.commit();

        let message = `Task details created successfully`;
        if (successfulRecords.length > 0) {
            message = `${totalRecordsCreated} record(s) created for ${Emp_Ids.length} employee(s) across ${scheduleTaskData.length} schedule task record(s)`;
        }
        if (duplicateRecords.length > 0) {
            message += `. ${duplicateRecords.length} duplicate record(s) skipped (duplicate: Sch_Id + Emp_Id + Task_Assign_dt)`;
        }

        return res.status(201).json({
            success: true,
            message: message,
            data: {
                totalRecords: totalRecordsCreated,
                employeeCount: Emp_Ids.length,
                scheduleTaskCount: scheduleTaskData.length,
                employeeIds: Emp_Ids,
                scheduleTaskDates: scheduleTaskData.map((record: ScheduleTaskData) => ({
                    taskWorkDate: record.Task_Work_Date,
                    taskStartTime: record.Task_Start_Time,
                    taskEndTime: record.Task_End_Time
                })),
                anNoValuesUsed: insertedAN_NoValues,
                duplicateSkipped: duplicateRecords.length > 0 ? {
                    count: duplicateRecords.length,
                    details: duplicateRecords
                } : undefined,
                successfulRecords: successfulRecords
            }
        });

    } catch (error: any) {
        await transaction.rollback();
        console.error("Error creating task details:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

export const updateTaskDetailsBulk = async (req: Request, res: Response) => {
    const companyDB = getCompanyDB(req);
    const transaction = await companyDB.transaction();

    try {
        const { projectId, schId, taskId, empId, Ord_By, Invovled_Stat } = req.body;

        if (!projectId || !schId || !taskId || !empId) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: "Missing required fields: projectId, schId, taskId, empId"
            });
        }

        // Fetch data from tbl_Project_Sch_Task_DT based on schId
        const scheduleTaskData: any[] = await companyDB.query(
            `SELECT 
                Task_Work_Date,
                Task_Start_Time,
                Task_End_Time
             FROM tbl_Project_Sch_Task_DT 
             WHERE Sch_Id = :schId
             ORDER BY Task_Work_Date ASC`,
            {
                replacements: { schId },
                type: 'SELECT',
                transaction
            }
        );

        if (!scheduleTaskData || scheduleTaskData.length === 0) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: `No schedule task data found for Sch_Id: ${schId}`
            });
        }

        // Get existing records for this combination
        const existingRecords: any[] = await companyDB.query(
            `SELECT Id, Task_Assign_dt FROM tbl_Task_Details 
             WHERE Sch_Id = :schId AND Emp_Id = :empId AND Task_Id = :taskId AND Project_Id = :projectId`,
            {
                replacements: { schId, empId, taskId, projectId },
                transaction,
                type: 'SELECT'
            }
        );

        // Create a map of existing Task_Assign_dt dates
        const existingDatesMap = new Map();
        existingRecords.forEach(record => {
            const dateKey = new Date(record.Task_Assign_dt).toISOString().split('T')[0];
            existingDatesMap.set(dateKey, record.Id);
        });

        // Get the current max AN_No to generate next values
        const maxAnNoResult: any = await companyDB.query(
            `SELECT ISNULL(MAX(AN_No), 0) AS maxANNo FROM tbl_Task_Details`,
            { transaction, type: 'SELECT' }
        );

        let nextANNo = (maxAnNoResult[0]?.maxANNo || 0) + 1;
        const insertedAN_NoValues: number[] = [];
        const updatedRecords: any[] = [];
        const duplicateRecords: any[] = [];
        const scheduleDates = scheduleTaskData.map((record: ScheduleTaskData) => 
            new Date(record.Task_Work_Date).toISOString().split('T')[0]
        );

        // Records to delete (dates not in new schedule)
        const recordsToDelete = existingRecords.filter(record => {
            const recordDate = new Date(record.Task_Assign_dt).toISOString().split('T')[0];
            return !scheduleDates.includes(recordDate);
        });

        if (recordsToDelete.length > 0) {
            const deleteIds = recordsToDelete.map(r => r.Id);
            const placeholders = deleteIds.map(() => '?').join(',');
            await companyDB.query(
                `DELETE FROM tbl_Task_Details WHERE Id IN (${placeholders})`,
                {
                    replacements: deleteIds,
                    transaction,
                    type: 'DELETE'
                }
            );
        }

        // Insert or update records
        for (let j = 0; j < scheduleTaskData.length; j++) {
            const taskRecord = scheduleTaskData[j] as ScheduleTaskData;
            const recordDate = new Date(taskRecord.Task_Work_Date).toISOString().split('T')[0];
            
            // Check if record already exists
            if (existingDatesMap.has(recordDate)) {
                // Update existing record
                await companyDB.query(
                    `UPDATE tbl_Task_Details 
                     SET Sch_Time = ?, EN_Time = ?, Ord_By = ?, Invovled_Stat = ?
                     WHERE Id = ?`,
                    {
                        replacements: [
                            taskRecord.Task_Start_Time,
                            taskRecord.Task_End_Time,
                            Ord_By || null,
                            Invovled_Stat || null,
                            existingDatesMap.get(recordDate)
                        ],
                        transaction,
                        type: 'UPDATE'
                    }
                );
                updatedRecords.push({
                    scheduleDate: taskRecord.Task_Work_Date,
                    action: 'updated',
                    id: existingDatesMap.get(recordDate)
                });
            } else {
                // Check for duplicate with same Sch_Id, Emp_Id, Task_Assign_dt
                const checkDuplicate: any[] = await companyDB.query(
                    `SELECT Id FROM tbl_Task_Details 
                     WHERE Sch_Id = :schId 
                       AND Emp_Id = :empId 
                       AND Task_Assign_dt >= CAST(:taskAssignDt AS DATETIME)
                   AND Task_Assign_dt < DATEADD(day, 1, CAST(:taskAssignDt AS DATETIME))`,
                    {
                        replacements: {
                            schId,
                            empId,
                            taskAssignDt: taskRecord.Task_Work_Date
                        },
                        transaction,
                        type: 'SELECT'
                    }
                );

                if (checkDuplicate && checkDuplicate.length > 0) {
                    duplicateRecords.push({
                        scheduleDate: taskRecord.Task_Work_Date,
                        existingId: checkDuplicate[0].Id
                    });
                    continue;
                }

                // Insert new record
                await companyDB.query(
                    `INSERT INTO tbl_Task_Details
                    (AN_No, Project_Id, Sch_Id, Task_Id, Emp_Id, Task_Assign_dt, Sch_Time, EN_Time, Ord_By, Invovled_Stat)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    {
                        replacements: [
                            nextANNo,
                            projectId,
                            schId,
                            taskId,
                            empId,
                            taskRecord.Task_Work_Date,
                            taskRecord.Task_Start_Time,
                            taskRecord.Task_End_Time,
                            Ord_By || null,
                            Invovled_Stat || null
                        ],
                        transaction,
                        type: 'INSERT'
                    }
                );

                insertedAN_NoValues.push(nextANNo);
                updatedRecords.push({
                    scheduleDate: taskRecord.Task_Work_Date,
                    action: 'inserted',
                    anNo: nextANNo
                });
                nextANNo++;
            }
        }

        await transaction.commit();

        let message = `Task details updated successfully for employee ${empId}`;
        if (duplicateRecords.length > 0) {
            message += `. ${duplicateRecords.length} duplicate record(s) skipped`;
        }

        return res.status(200).json({
            success: true,
            message: message,
            data: {
                totalRecords: updatedRecords.length,
                employeeId: empId,
                scheduleTaskCount: scheduleTaskData.length,
                scheduleTaskDates: scheduleTaskData.map((record: ScheduleTaskData) => ({
                    taskWorkDate: record.Task_Work_Date,
                    taskStartTime: record.Task_Start_Time,
                    taskEndTime: record.Task_End_Time
                })),
                anNoValuesUsed: insertedAN_NoValues,
                recordsDeleted: recordsToDelete.length,
                updatedRecords: updatedRecords,
                duplicateSkipped: duplicateRecords.length > 0 ? {
                    count: duplicateRecords.length,
                    details: duplicateRecords
                } : undefined
            }
        });

    } catch (error: any) {
        await transaction.rollback();
        console.error("Error updating task details bulk:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};