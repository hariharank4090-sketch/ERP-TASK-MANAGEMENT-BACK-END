import { Request, Response } from 'express';
import { Op } from 'sequelize';
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
    initTaskParametDTModel,
    TaskParametDTCreationSchema,
    TaskParametDTUpdateSchema,
    TaskParametDTQuerySchema,
    taskParametDTIdSchema,
    TaskParametDTCreate,
    TaskParametDTUpdate,
    TaskParametDTQuery,
    TaskParametDTAtrributes,
    TaskParametDTWithDetails,
    formatTaskParametDTForResponse
} from '../../../models/masters/TaskEmployeeParameters/type.model';

// Define error type for better type safety
interface ValidationError {
    field: string;
    message: string;
}

interface ItemError {
    index: number;
    errors?: ValidationError[];
    field?: string;
    message?: string;
}

const validateWithZod = <T>(schema: any, data: any): {
    success: boolean;
    data?: T;
    errors?: ValidationError[];
} => {
    try {
        const validatedData = schema.parse(data);
        return { success: true, data: validatedData };
    } catch (error: any) {
        if (error instanceof ZodError) {
            const zodIssues = error.issues || (error as any).errors || [];
            return {
                success: false,
                errors: zodIssues.map((err: any) => ({
                    field: Array.isArray(err.path) ? err.path.join('.') : String(err.path || 'unknown'),
                    message: err.message || 'Validation error'
                }))
            };
        }
        return {
            success: false,
            errors: [{ field: 'unknown', message: 'Validation failed' }]
        };
    }
};

// Helper to get TaskParametDT model with the correct database connection
const getTaskParametDTModel = (req: Request) => {
    const sequelize = (req as any).companyDB;
    if (!sequelize) {
        throw new Error('Database connection not available');
    }
    return initTaskParametDTModel(sequelize);
};

// Enhanced error handler for 403 Forbidden
const handleForbiddenError = (res: Response, customMessage?: string) => {
    return res.status(403).json({
        success: false,
        message: customMessage || 'Access denied. You do not have permission to perform this action.',
        error: 'FORBIDDEN'
    });
};

// Check user permissions
const checkUserPermission = (req: Request, requiredPermission?: string): boolean => {
    const user = (req as any).user;
    
    if (!user) {
        return false;
    }
    
    // UserTypeId 0 = Super Admin - full access
    if (user.UserTypeId === 0) {
        return true;
    }
    
    // Add your permission logic here based on UserTypeId
    if (requiredPermission === 'create_task_parameters' && ![1, 2].includes(user.UserTypeId)) {
        return false;
    }
    if (requiredPermission === 'update_task_parameters' && ![1, 2].includes(user.UserTypeId)) {
        return false;
    }
    if (requiredPermission === 'delete_task_parameters' && user.UserTypeId !== 1) {
        return false;
    }
    if (requiredPermission === 'view_task_parameters' && ![1, 2, 3].includes(user.UserTypeId)) {
        return false;
    }
    
    return true;
};

/**
 * Get all task parameter details with filtering
 */
export const getAllTaskParametDTs = async (req: Request, res: Response) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_task_parameters')) {
            return handleForbiddenError(res, 'You do not have permission to view task parameters');
        }
        
        // Get the TaskParametDT model for this company's database
        const TaskParametDT = getTaskParametDTModel(req);
        
        const queryData = {
            ...req.query
        };

        const validation = validateWithZod<TaskParametDTQuery>(TaskParametDTQuerySchema, queryData);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid query parameters',
                errors: validation.errors
            });
        }

        const queryParams = validation.data!;

        // Build WHERE conditions
        const whereConditions: any = {};

        if (queryParams.Task_Id) {
            whereConditions.Task_Id = queryParams.Task_Id;
        }

        if (queryParams.Param_Id) {
            whereConditions.Param_Id = queryParams.Param_Id;
        }

        // Build order
        const orderField = queryParams.sortBy || 'PA_Id';
        const orderDirection = queryParams.sortOrder || 'ASC';

        // Fetch records with Sequelize
        const taskParametDTs = await TaskParametDT.findAll({
            where: whereConditions,
            order: [[orderField, orderDirection]],
            raw: true
        });

        // If we need joined data from Paramet_Master and Paramet_Data_Type tables,
        // we need to use raw queries or associations. Here we'll use raw queries for joined data
        if (taskParametDTs.length > 0) {
            const sequelize = (req as any).companyDB;
            if (sequelize) {
                // Get joined data with parameter names
                const ids = taskParametDTs.map(t => t.PA_Id);
                const joinedQuery = `
                    SELECT 
                        td.PA_Id,
                        td.Task_Id,
                        td.Param_Id,
                        td.Paramet_Data_Type,
                        pm.Paramet_Name,
                        pdt.Para_Display_Name
                    FROM tbl_Task_Paramet_DT td
                    LEFT JOIN tbl_Paramet_Master pm ON td.Param_Id = pm.Paramet_Id AND (pm.Del_Flag = 0 OR pm.Del_Flag IS NULL)
                    LEFT JOIN tbl_Paramet_Data_Type pdt ON td.Paramet_Data_Type = pdt.Para_Data_Type_Id
                    WHERE td.PA_Id IN (${ids.join(',')})
                    ORDER BY 
                        CASE 
                            WHEN ? = 'Paramet_Name' THEN pm.Paramet_Name
                            WHEN ? = 'Para_Display_Name' THEN pdt.Para_Display_Name
                            ELSE 
                                CASE ?
                                    WHEN 'PA_Id' THEN td.PA_Id
                                    WHEN 'Task_Id' THEN td.Task_Id
                                    WHEN 'Param_Id' THEN td.Param_Id
                                    ELSE td.PA_Id
                                END
                        END ${orderDirection}
                `;
                
                const joinedResults = await sequelize.query(joinedQuery, {
                    replacements: [orderField, orderField, orderField],
                    type: 'SELECT'
                }) as TaskParametDTWithDetails[];
                
                return sentData(res, joinedResults);
            }
        }

        return sentData(res, taskParametDTs);

    } catch (err) {
        console.error('Error fetching task parameter details:', err);
        servError(err, res);
    }
};

/**
 * Get task parameter detail by ID
 */
export const getTaskParametDTById = async (req: Request, res: Response) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_task_parameters')) {
            return handleForbiddenError(res, 'You do not have permission to view task parameters');
        }
        
        // Get the TaskParametDT model for this company's database
        const TaskParametDT = getTaskParametDTModel(req);
        
        const validation = validateWithZod<{ id: number }>(taskParametDTIdSchema, req.params);
        
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID parameter',
                errors: validation.errors
            });
        }

        const { id } = validation.data!;

        const taskParametDT = await TaskParametDT.findByPk(id, { raw: true });
        
        if (!taskParametDT) {
            return notFound(res, 'Task Parameter Detail not found');
        }

        // Get joined data with parameter names
        const sequelize = (req as any).companyDB;
        if (sequelize) {
            const joinedQuery = `
                SELECT 
                    td.PA_Id,
                    td.Task_Id,
                    td.Param_Id,
                    td.Paramet_Data_Type,
                    pm.Paramet_Name,
                    pdt.Para_Display_Name
                FROM tbl_Task_Paramet_DT td
                LEFT JOIN tbl_Paramet_Master pm ON td.Param_Id = pm.Paramet_Id AND (pm.Del_Flag = 0 OR pm.Del_Flag IS NULL)
                LEFT JOIN tbl_Paramet_Data_Type pdt ON td.Paramet_Data_Type = pdt.Para_Data_Type_Id
                WHERE td.PA_Id = ?
            `;
            
            const joinedResult = await sequelize.query(joinedQuery, {
                replacements: [id],
                type: 'SELECT'
            }) as TaskParametDTWithDetails[];
            
            if (joinedResult.length > 0) {
                return res.status(200).json({
                    success: true,
                    message: 'Task Parameter Detail retrieved successfully',
                    data: joinedResult[0]
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Task Parameter Detail retrieved successfully',
            data: taskParametDT
        });

    } catch (e) {
        console.error('Error fetching task parameter detail by ID:', e);
        servError(e, res);
    }
};

/**
 * Get task parameter details by Task ID
 */
export const getTaskParametDTsByTaskId = async (req: Request, res: Response) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_task_parameters')) {
            return handleForbiddenError(res, 'You do not have permission to view task parameters');
        }
        
        // Get the TaskParametDT model for this company's database
        const TaskParametDT = getTaskParametDTModel(req);
        
        const { taskId } = req.params;

        if (!taskId || isNaN(Number(taskId))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Task ID'
            });
        }

        // Get joined data with parameter names
        const sequelize = (req as any).companyDB;
        if (sequelize) {
            const joinedQuery = `
                SELECT 
                    td.PA_Id,
                    td.Task_Id,
                    td.Param_Id,
                    td.Paramet_Data_Type,
                    pm.Paramet_Name,
                    pdt.Para_Display_Name
                FROM tbl_Task_Paramet_DT td
                LEFT JOIN tbl_Paramet_Master pm ON td.Param_Id = pm.Paramet_Id AND (pm.Del_Flag = 0 OR pm.Del_Flag IS NULL)
                LEFT JOIN tbl_Paramet_Data_Type pdt ON td.Paramet_Data_Type = pdt.Para_Data_Type_Id
                WHERE td.Task_Id = ?
                ORDER BY td.Param_Id ASC
            `;
            
            const rows = await sequelize.query(joinedQuery, {
                replacements: [taskId],
                type: 'SELECT'
            }) as TaskParametDTWithDetails[];
            
            return sentData(res, rows);
        }

        // Fallback to basic query
        const taskParametDTs = await TaskParametDT.findAll({
            where: { Task_Id: taskId },
            order: [['Param_Id', 'ASC']],
            raw: true
        });

        return sentData(res, taskParametDTs);

    } catch (e) {
        console.error('Error fetching task parameter details by Task ID:', e);
        servError(e, res);
    }
};

/**
 * Create task parameter details (supports single or bulk create)
 */
export const createTaskParametDT = async (req: Request, res: Response) => {
    try {
        // Check authentication and permission
        if (!checkUserPermission(req, 'create_task_parameters')) {
            return handleForbiddenError(res, 'You do not have permission to create task parameters');
        }
        
        // Get the TaskParametDT model for this company's database
        const TaskParametDT = getTaskParametDTModel(req);
        
        // Check if request body is an array
        const isArray = Array.isArray(req.body);
        const items = isArray ? req.body : [req.body];
        
        console.log(`Processing ${items.length} task parameter details`);

        const createdRecords: TaskParametDTAtrributes[] = [];
        const errors: ItemError[] = [];

        // Process each item
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            
            const normalizedBody = {
                ...item,
                Task_Id: item.Task_Id,
                Param_Id: item.Param_Id,
                Paramet_Data_Type: item.Paramet_Data_Type?.trim() || null
            };

            // Validate with Zod
            const validation = validateWithZod<TaskParametDTCreate>(
                TaskParametDTCreationSchema,
                normalizedBody
            );

            if (!validation.success) {
                errors.push({
                    index: i,
                    errors: validation.errors
                });
                continue;
            }

            const { Task_Id, Param_Id, Paramet_Data_Type } = validation.data!;

            // Check for duplicate combination of Task_Id and Param_Id
            const existing = await TaskParametDT.findOne({
                where: { Task_Id, Param_Id },
                raw: true
            });

            if (existing) {
                errors.push({
                    index: i,
                    field: 'Task_Id,Param_Id',
                    message: `Task Parameter combination already exists for Task_Id: ${Task_Id}, Param_Id: ${Param_Id}`
                });
                continue;
            }

            // Create record using Sequelize
            const createdRecord = await TaskParametDT.create({
                Task_Id,
                Param_Id,
                Paramet_Data_Type
            });

            if (createdRecord) {
                // Get joined data with parameter names
                const sequelize = (req as any).companyDB;
                if (sequelize) {
                    const joinedQuery = `
                        SELECT 
                            td.PA_Id,
                            td.Task_Id,
                            td.Param_Id,
                            td.Paramet_Data_Type,
                            pm.Paramet_Name,
                            pdt.Para_Display_Name
                        FROM tbl_Task_Paramet_DT td
                        LEFT JOIN tbl_Paramet_Master pm ON td.Param_Id = pm.Paramet_Id AND (pm.Del_Flag = 0 OR pm.Del_Flag IS NULL)
                        LEFT JOIN tbl_Paramet_Data_Type pdt ON td.Paramet_Data_Type = pdt.Para_Data_Type_Id
                        WHERE td.PA_Id = ?
                    `;
                    
                    const joinedResult = await sequelize.query(joinedQuery, {
                        replacements: [createdRecord.PA_Id],
                        type: 'SELECT'
                    }) as TaskParametDTWithDetails[];
                    
                    if (joinedResult.length > 0) {
                        createdRecords.push(joinedResult[0]);
                    } else {
                        createdRecords.push(createdRecord.get({ plain: true }));
                    }
                } else {
                    createdRecords.push(createdRecord.get({ plain: true }));
                }
            }
        }

        // Return response based on results
        if (errors.length > 0 && createdRecords.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No records were created',
                errors: errors
            });
        }

        if (errors.length > 0) {
            return res.status(207).json({
                success: true,
                message: `Created ${createdRecords.length} records, ${errors.length} failed`,
                data: createdRecords,
                errors: errors
            });
        }

        // If single item was sent, return single object, otherwise return array
        if (!isArray && createdRecords.length === 1) {
            return res.status(201).json({
                success: true,
                message: 'Task Parameter Detail created successfully',
                data: createdRecords[0]
            });
        }

        return res.status(201).json({
            success: true,
            message: `${createdRecords.length} Task Parameter Detail(s) created successfully`,
            data: createdRecords
        });

    } catch (error) {
        console.error('Error creating task parameter details:', error);
        return servError(error, res);
    }
};

/**
 * Update a task parameter detail
 */
export const updateTaskParametDT = async (req: Request, res: Response) => {
    try {
        // Check authentication and permission
        if (!checkUserPermission(req, 'update_task_parameters')) {
            return handleForbiddenError(res, 'You do not have permission to update task parameters');
        }
        
        // Get the TaskParametDT model for this company's database
        const TaskParametDT = getTaskParametDTModel(req);
        
        const idValidation = validateWithZod<{ id: number }>(taskParametDTIdSchema, req.params);
        
        if (!idValidation.success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID parameter',
                errors: idValidation.errors
            });
        }

        const { id } = idValidation.data!;

        // Check if record exists
        const existingRecord = await TaskParametDT.findByPk(id);
        
        if (!existingRecord) {
            return notFound(res, 'Task Parameter Detail not found');
        }

        const currentRecord = existingRecord.get({ plain: true });

        // Check for duplicate combination (excluding current record)
        if (req.body.Task_Id && req.body.Param_Id) {
            if (req.body.Task_Id !== currentRecord.Task_Id || req.body.Param_Id !== currentRecord.Param_Id) {
                const duplicate = await TaskParametDT.findOne({
                    where: {
                        Task_Id: req.body.Task_Id,
                        Param_Id: req.body.Param_Id,
                        PA_Id: { [Op.ne]: id }
                    }
                });

                if (duplicate) {
                    return res.status(409).json({
                        success: false,
                        message: 'Another Task Parameter combination already exists',
                        field: 'Task_Id,Param_Id'
                    });
                }
            }
        }

        const validation = validateWithZod<TaskParametDTUpdate>(TaskParametDTUpdateSchema, req.body);
        
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const validatedBody = validation.data!;

        // Prepare update data
        const updateData: any = {};
        if (validatedBody.Task_Id !== undefined) updateData.Task_Id = validatedBody.Task_Id;
        if (validatedBody.Param_Id !== undefined) updateData.Param_Id = validatedBody.Param_Id;
        if (validatedBody.Paramet_Data_Type !== undefined) updateData.Paramet_Data_Type = validatedBody.Paramet_Data_Type;

        // If no fields to update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        await existingRecord.update(updateData);
        
        const updatedRecord = await TaskParametDT.findByPk(id);
        
        if (!updatedRecord) {
            return notFound(res, 'Task Parameter Detail not found after update');
        }

        // Get joined data with parameter names
        const sequelize = (req as any).companyDB;
        if (sequelize) {
            const joinedQuery = `
                SELECT 
                    td.PA_Id,
                    td.Task_Id,
                    td.Param_Id,
                    td.Paramet_Data_Type,
                    pm.Paramet_Name,
                    pdt.Para_Display_Name
                FROM tbl_Task_Paramet_DT td
                LEFT JOIN tbl_Paramet_Master pm ON td.Param_Id = pm.Paramet_Id AND (pm.Del_Flag = 0 OR pm.Del_Flag IS NULL)
                LEFT JOIN tbl_Paramet_Data_Type pdt ON td.Paramet_Data_Type = pdt.Para_Data_Type_Id
                WHERE td.PA_Id = ?
            `;
            
            const joinedResult = await sequelize.query(joinedQuery, {
                replacements: [id],
                type: 'SELECT'
            }) as TaskParametDTWithDetails[];
            
            if (joinedResult.length > 0) {
                return res.status(200).json({
                    success: true,
                    message: 'Task Parameter Detail updated successfully',
                    data: joinedResult[0]
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Task Parameter Detail updated successfully',
            data: updatedRecord.get({ plain: true })
        });

    } catch (e) {
        console.error('Error updating task parameter detail:', e);
        servError(e, res);
    }
};

/**
 * Delete task parameter detail by ID
 */
export const deleteTaskParametDT = async (req: Request, res: Response) => {
    try {
        // Check authentication and permission
        if (!checkUserPermission(req, 'delete_task_parameters')) {
            return handleForbiddenError(res, 'You do not have permission to delete task parameters');
        }
        
        // Get the TaskParametDT model for this company's database
        const TaskParametDT = getTaskParametDTModel(req);
        
        const validation = validateWithZod<{ id: number }>(taskParametDTIdSchema, req.params);
        
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID parameter',
                errors: validation.errors
            });
        }

        const { id } = validation.data!;

        // Check if record exists
        const existingRecord = await TaskParametDT.findByPk(id);
        
        if (!existingRecord) {
            return notFound(res, 'Task Parameter Detail not found');
        }

        // Delete record
        await existingRecord.destroy();

        return res.status(200).json({
            success: true,
            message: 'Task Parameter Detail deleted successfully'
        });

    } catch (e) {
        console.error('Error deleting task parameter detail:', e);
        servError(e, res);
    }
};

/**
 * Delete all task parameter details by Task ID (bulk delete)
 */
export const deleteTaskParametDTsByTaskId = async (req: Request, res: Response) => {
    try {
        // Check authentication and permission
        if (!checkUserPermission(req, 'delete_task_parameters')) {
            return handleForbiddenError(res, 'You do not have permission to delete task parameters');
        }
        
        // Get the TaskParametDT model for this company's database
        const TaskParametDT = getTaskParametDTModel(req);
        
        const { taskId } = req.params;

        if (!taskId || isNaN(Number(taskId))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Task ID'
            });
        }

        // Check if records exist
        const count = await TaskParametDT.count({
            where: { Task_Id: taskId }
        });

        if (count === 0) {
            return res.status(200).json({
                success: true,
                message: `No Task Parameter Details found for Task ID ${taskId}`
            });
        }

        // Delete all records for the task
        await TaskParametDT.destroy({
            where: { Task_Id: taskId }
        });

        return res.status(200).json({
            success: true,
            message: `All Task Parameter Details for Task ID ${taskId} deleted successfully`
        });

    } catch (e) {
        console.error('Error deleting task parameter details by Task ID:', e);
        servError(e, res);
    }
};