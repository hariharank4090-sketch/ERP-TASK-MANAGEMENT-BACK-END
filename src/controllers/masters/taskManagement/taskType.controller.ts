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
    initTaskTypeModel,
    formatTaskTypeForResponse,
    getStatusText,
    getDelFlagText,
    getReptativeText
} from '../../../models/masters/taskType/type.model';
import {
    taskTypeCreateSchema,
    taskTypeUpdateSchema,
    taskTypeQuerySchema,
    taskTypeIdSchema,
    TaskTypeCreateInput,
    TaskTypeUpdateInput,
    TaskTypeQueryParams
} from '../../../models/masters/taskType/type.model';
import { initProjectModel } from '../../../models/masters/project/type.model';

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

// Helper to get TaskType model with the correct database connection
const getTaskTypeModel = (req: Request) => {
    const sequelize = (req as any).companyDB;
    if (!sequelize) {
        throw new Error('Database connection not available');
    }
    return initTaskTypeModel(sequelize);
};

// Helper to get Project model
const getProjectModel = (req: Request) => {
    const sequelize = (req as any).companyDB;
    if (!sequelize) {
        throw new Error('Database connection not available');
    }
    return initProjectModel(sequelize);
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
    if (requiredPermission === 'create_tasktypes' && ![1, 2, 3, 4, 5, 6, 7, 8, 9, 10].includes(user.UserTypeId)) {
        return false;
    }
    if (requiredPermission === 'update_tasktypes' && ![1, 2].includes(user.UserTypeId)) {
        return false;
    }
    if (requiredPermission === 'delete_tasktypes' && user.UserTypeId !== 1) {
        return false;
    }
    if (requiredPermission === 'view_tasktypes' && ![1, 2, 3, 4, 5, 6, 7, 8, 9, 10].includes(user.UserTypeId)) {
        return false;
    }
    
    return true;
};

/**
 * Get all task types without pagination
 */
export const getAllTaskTypes = async (req: Request, res: Response) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_tasktypes')) {
            return handleForbiddenError(res, 'You do not have permission to view task types');
        }
        
        // Get the TaskType model for this company's database
        const TaskType = getTaskTypeModel(req);
        const Project = getProjectModel(req);
        
        // Validate query parameters
        const validation = validateWithZod<TaskTypeQueryParams>(taskTypeQuerySchema, req.query);
        
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const {
            search,
            Task_Type,
            Project_Id,
            Status,
            TT_Del_Flag = 0,
            Is_Reptative,
            sortBy = 'Task_Type_Id',
            sortOrder = 'DESC'
        } = validation.data!;

        // Build where clause
        const whereClause: any = {};
        
        if (Project_Id !== undefined && Project_Id !== null) whereClause.Project_Id = Project_Id;
        if (Status !== undefined && Status !== null) whereClause.Status = Status;
        if (TT_Del_Flag !== undefined && TT_Del_Flag !== null) whereClause.TT_Del_Flag = TT_Del_Flag;
        if (Is_Reptative !== undefined && Is_Reptative !== null) whereClause.Is_Reptative = Is_Reptative;
        
        if (Task_Type) {
            whereClause.Task_Type = { [Op.like]: `%${Task_Type}%` };
        }
        
        // Search functionality
        if (search) {
            whereClause[Op.or] = [
                { Task_Type: { [Op.like]: `%${search}%` } }
            ];
        }

        // Validate sort parameters
        const validSortFields = ['Task_Type_Id', 'Task_Type', 'Project_Id', 'Status'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'Task_Type_Id';
        const sortDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        const taskTypes = await TaskType.findAll({
            where: whereClause,
            order: [[sortField, sortDirection]]
        });

        // Get project names for task types
        const projectIds = taskTypes
            .map(tt => tt.Project_Id)
            .filter((id): id is number => id !== null && id !== undefined)
            .filter((id, index, self) => self.indexOf(id) === index);

        const projectsMap = new Map<number, string>();
        if (projectIds.length > 0) {
            const projects = await Project.findAll({
                where: {
                    Project_Id: projectIds
                },
                attributes: ['Project_Id', 'Project_Name']
            });
            
            projects.forEach(project => {
                const projectId = project.Project_Id;
                const projectName = project.Project_Name;
                if (projectName !== null) {
                    projectsMap.set(projectId, projectName);
                }
            });
        }

        // Format task types with additional data
        const formattedTaskTypes = taskTypes.map(taskType => {
            const formatted = formatTaskTypeForResponse(taskType);
            const projectId = taskType.Project_Id;
            return {
                ...formatted,
                Project_Name: projectId ? projectsMap.get(projectId) || null : null
            };
        });

        return res.status(200).json({
            success: true,
            message: 'Task types retrieved successfully',
            data: formattedTaskTypes,
            totalRecords: formattedTaskTypes.length
        });

    } catch (error: any) {
        console.error('Error fetching task types:', error);
        return servError(error, res);
    }
};

/**
 * Get task type by ID
 */
export const getTaskTypeById = async (req: Request, res: Response) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_tasktypes')) {
            return handleForbiddenError(res, 'You do not have permission to view task types');
        }
        
        // Get the TaskType model for this company's database
        const TaskType = getTaskTypeModel(req);
        const Project = getProjectModel(req);
        
        // Validate ID parameter
        const validation = validateWithZod<{ id: number }>(taskTypeIdSchema, { id: parseInt(req.params.id) });
        
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const { id } = validation.data!;

        const taskType = await TaskType.findByPk(id);
        
        if (!taskType) {
            return notFound(res, 'Task type not found');
        }

        // Get project name
        let projectName: string | null = null;
        if (taskType.Project_Id) {
            const project = await Project.findByPk(taskType.Project_Id, {
                attributes: ['Project_Id', 'Project_Name']
            });
            projectName = project ? project.Project_Name : null;
        }

        // Format task type with status text
        const formattedTaskType = formatTaskTypeForResponse(taskType);

        return res.status(200).json({
            success: true,
            message: 'Task type retrieved successfully',
            data: {
                ...formattedTaskType,
                Project_Name: projectName
            }
        });

    } catch (error: any) {
        console.error('Error fetching task type:', error);
        return servError(error, res);
    }
};

/**
 * Get task types by project ID
 */
export const getTaskTypesByProjectId = async (req: Request, res: Response) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_tasktypes')) {
            return handleForbiddenError(res, 'You do not have permission to view task types');
        }
        
        // Get the TaskType model for this company's database
        const TaskType = getTaskTypeModel(req);
        
        const { projectId } = req.params;
        
        if (!projectId || isNaN(parseInt(projectId))) {
            return res.status(400).json({
                success: false,
                message: 'Valid project ID is required'
            });
        }

        const taskTypes = await TaskType.findAll({
            where: { 
                Project_Id: parseInt(projectId),
                TT_Del_Flag: 0,
                Status: 1 
            },
            order: [['Task_Type', 'ASC']]
        });

        // Format task types with status text
        const formattedTaskTypes = taskTypes.map(taskType => formatTaskTypeForResponse(taskType));

        return res.status(200).json({
            success: true,
            message: 'Task types retrieved successfully',
            data: formattedTaskTypes,
            totalRecords: formattedTaskTypes.length
        });

    } catch (error: any) {
        console.error('Error fetching task types by project:', error);
        return servError(error, res);
    }
};

/**
 * Get active task types
 */
export const getActiveTaskTypes = async (req: Request, res: Response) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_tasktypes')) {
            return handleForbiddenError(res, 'You do not have permission to view task types');
        }
        
        // Get the TaskType model for this company's database
        const TaskType = getTaskTypeModel(req);
        
        const { projectId } = req.query;

        const whereClause: any = {
            TT_Del_Flag: 0,
            Status: 1
        };

        if (projectId && !isNaN(Number(projectId))) {
            whereClause.Project_Id = Number(projectId);
        }

        const taskTypes = await TaskType.findAll({
            where: whereClause,
            order: [['Task_Type', 'ASC']]
        });

        // Format task types with status text
        const formattedTaskTypes = taskTypes.map(taskType => formatTaskTypeForResponse(taskType));

        return res.status(200).json({
            success: true,
            message: 'Active task types retrieved successfully',
            data: formattedTaskTypes,
            totalRecords: formattedTaskTypes.length
        });

    } catch (error: any) {
        console.error('Error fetching active task types:', error);
        return servError(error, res);
    }
};

/**
 * Create new task type
 */
export const createTaskType = async (req: Request, res: Response) => {
    try {
        // Check authentication and permission
        if (!checkUserPermission(req, 'create_tasktypes')) {
            return handleForbiddenError(res, 'You do not have permission to create task types');
        }
        
        // Get the TaskType model for this company's database
        const TaskType = getTaskTypeModel(req);
        
        // Validate request body
        const validation = validateWithZod<TaskTypeCreateInput>(taskTypeCreateSchema, req.body);
        
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const taskTypeData = validation.data!;

        // Check for duplicate task type name within the same project
        const existingTaskType = await TaskType.findOne({
            where: {
                Task_Type: taskTypeData.Task_Type.trim(),
                Project_Id: taskTypeData.Project_Id || null,
                TT_Del_Flag: 0
            }
        });

        if (existingTaskType) {
            return res.status(409).json({
                success: false,
                message: 'Task type with this name already exists for this project'
            });
        }

        // Prepare task type data
        const finalTaskTypeData: any = {
            ...taskTypeData,
            Task_Type: taskTypeData.Task_Type.trim(),
            TT_Del_Flag: 0,
            Status: taskTypeData.Status || 1
        };

        const taskType = await TaskType.create(finalTaskTypeData);
        
        // Format task type with status text
        const formattedTaskType = formatTaskTypeForResponse(taskType);
        
        return created(res, {
            success: true,
            message: 'Task type created successfully',
            data: formattedTaskType
        });

    } catch (error: any) {
        console.error('Error creating task type:', error);
        return servError(error, res);
    }
};

/**
 * Update task type
 */
export const updateTaskType = async (req: Request, res: Response) => {
    try {
        // Check authentication and permission
        if (!checkUserPermission(req, 'update_tasktypes')) {
            return handleForbiddenError(res, 'You do not have permission to update task types');
        }
        
        // Get the TaskType model for this company's database
        const TaskType = getTaskTypeModel(req);
        
        // Validate ID parameter
        const idValidation = validateWithZod<{ id: number }>(taskTypeIdSchema, { id: parseInt(req.params.id) });
        
        if (!idValidation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: idValidation.errors
            });
        }

        const { id } = idValidation.data!;

        // Validate request body
        const bodyValidation = validateWithZod<TaskTypeUpdateInput>(taskTypeUpdateSchema, req.body);
        
        if (!bodyValidation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: bodyValidation.errors
            });
        }

        const updateData = bodyValidation.data!;

        const taskType = await TaskType.findByPk(id);
        
        if (!taskType) {
            return notFound(res, 'Task type not found');
        }

        // Check for duplicate task type name if Task_Type is being updated
        if (updateData.Task_Type && updateData.Task_Type !== taskType.Task_Type) {
            const existingTaskType = await TaskType.findOne({
                where: {
                    Task_Type_Id: { [Op.ne]: id },
                    Task_Type: updateData.Task_Type.trim(),
                    Project_Id: updateData.Project_Id !== undefined ? updateData.Project_Id : taskType.Project_Id,
                    TT_Del_Flag: 0
                }
            });

            if (existingTaskType) {
                return res.status(409).json({
                    success: false,
                    message: 'Another task type with this name already exists for this project'
                });
            }
        }

        // Prepare update data
        const finalUpdateData: any = {};
        if (updateData.Task_Type !== undefined) finalUpdateData.Task_Type = updateData.Task_Type.trim();
        if (updateData.Is_Reptative !== undefined) finalUpdateData.Is_Reptative = updateData.Is_Reptative;
        if (updateData.Hours_Duration !== undefined) finalUpdateData.Hours_Duration = updateData.Hours_Duration;
        if (updateData.Day_Duration !== undefined) finalUpdateData.Day_Duration = updateData.Day_Duration;
        if (updateData.Project_Id !== undefined) finalUpdateData.Project_Id = updateData.Project_Id;
        if (updateData.Est_StartTime !== undefined) finalUpdateData.Est_StartTime = updateData.Est_StartTime;
        if (updateData.Est_EndTime !== undefined) finalUpdateData.Est_EndTime = updateData.Est_EndTime;
        if (updateData.Status !== undefined) finalUpdateData.Status = updateData.Status;
        if (updateData.TT_Del_Flag !== undefined) finalUpdateData.TT_Del_Flag = updateData.TT_Del_Flag;

        await taskType.update(finalUpdateData);
        
        const updatedTaskType = await TaskType.findByPk(id);
        
        if (!updatedTaskType) {
            return notFound(res, 'Task type not found after update');
        }

        // Format task type with status text
        const formattedTaskType = formatTaskTypeForResponse(updatedTaskType);
        
        return updated(res, {
            success: true,
            message: 'Task type updated successfully',
            data: formattedTaskType
        });

    } catch (error: any) {
        console.error('Error updating task type:', error);
        return servError(error, res);
    }
};

/**
 * Delete task type (soft delete)
 */
export const deleteTaskType = async (req: Request, res: Response) => {
    try {
        // Check authentication and permission
        if (!checkUserPermission(req, 'delete_tasktypes')) {
            return handleForbiddenError(res, 'You do not have permission to delete task types');
        }
        
        // Get the TaskType model for this company's database
        const TaskType = getTaskTypeModel(req);
        
        // Validate ID parameter
        const validation = validateWithZod<{ id: number }>(taskTypeIdSchema, { id: parseInt(req.params.id) });
        
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const { id } = validation.data!;

        const taskType = await TaskType.findByPk(id);
        
        if (!taskType) {
            return notFound(res, 'Task type not found');
        }

        // Soft delete: Set TT_Del_Flag to 1 and Status to 0
        await taskType.update({
            TT_Del_Flag: 1,
            Status: 0
        });
        
        return res.status(200).json({
            success: true,
            message: 'Task type deactivated successfully'
        });

    } catch (error: any) {
        console.error('Error deleting task type:', error);
        return servError(error, res);
    }
};

/**
 * Restore task type (undo soft delete)
 */
export const restoreTaskType = async (req: Request, res: Response) => {
    try {
        // Check authentication and permission
        if (!checkUserPermission(req, 'update_tasktypes')) {
            return handleForbiddenError(res, 'You do not have permission to restore task types');
        }
        
        // Get the TaskType model for this company's database
        const TaskType = getTaskTypeModel(req);
        
        // Validate ID parameter
        const validation = validateWithZod<{ id: number }>(taskTypeIdSchema, { id: parseInt(req.params.id) });
        
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const { id } = validation.data!;

        const taskType = await TaskType.findByPk(id);
        
        if (!taskType) {
            return notFound(res, 'Task type not found');
        }

        // Restore: Set TT_Del_Flag to 0 and Status to 1
        await taskType.update({
            TT_Del_Flag: 0,
            Status: 1
        });

        const restoredTaskType = await TaskType.findByPk(id);
        
        if (!restoredTaskType) {
            return notFound(res, 'Task type not found after restore');
        }

        const formattedTaskType = formatTaskTypeForResponse(restoredTaskType);

        return updated(res, {
            success: true,
            message: 'Task type restored successfully',
            data: formattedTaskType
        });

    } catch (error: any) {
        console.error('Error restoring task type:', error);
        return servError(error, res);
    }
};

/**
 * Hard delete task type (permanent delete)
 */
export const hardDeleteTaskType = async (req: Request, res: Response) => {
    try {
        // Check authentication and permission (admin only)
        if (!checkUserPermission(req, 'admin_delete_tasktypes')) {
            return handleForbiddenError(res, 'You do not have permission to permanently delete task types');
        }
        
        // Get the TaskType model for this company's database
        const TaskType = getTaskTypeModel(req);
        
        // Validate ID parameter
        const validation = validateWithZod<{ id: number }>(taskTypeIdSchema, { id: parseInt(req.params.id) });
        
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const { id } = validation.data!;

        const taskType = await TaskType.findByPk(id);
        
        if (!taskType) {
            return notFound(res, 'Task type not found');
        }

        await taskType.destroy();
        
        return res.status(200).json({
            success: true,
            message: 'Task type permanently deleted successfully'
        });

    } catch (error: any) {
        console.error('Error hard deleting task type:', error);
        return servError(error, res);
    }
};

/**
 * Toggle task type status (active/inactive)
 */
export const toggleTaskTypeStatus = async (req: Request, res: Response) => {
    try {
        // Check authentication and permission
        if (!checkUserPermission(req, 'update_tasktypes')) {
            return handleForbiddenError(res, 'You do not have permission to update task types');
        }
        
        // Get the TaskType model for this company's database
        const TaskType = getTaskTypeModel(req);
        
        // Validate ID parameter
        const idValidation = validateWithZod<{ id: number }>(taskTypeIdSchema, { id: parseInt(req.params.id) });
        
        if (!idValidation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: idValidation.errors
            });
        }

        const { id } = idValidation.data!;

        const taskType = await TaskType.findByPk(id);
        
        if (!taskType) {
            return notFound(res, 'Task type not found');
        }

        // Toggle status (1 to 0, 0 to 1)
        const newStatus = taskType.Status === 1 ? 0 : 1;
        
        await taskType.update({
            Status: newStatus
        });

        const updatedTaskType = await TaskType.findByPk(id);
        
        if (!updatedTaskType) {
            return notFound(res, 'Task type not found after update');
        }

        const formattedTaskType = formatTaskTypeForResponse(updatedTaskType);

        return updated(res, {
            success: true,
            message: `Task type ${newStatus === 1 ? 'activated' : 'deactivated'} successfully`,
            data: formattedTaskType
        });

    } catch (error: any) {
        console.error('Error toggling task type status:', error);
        return servError(error, res);
    }
};

/**
 * Get task types by task ID
 */
export const getTaskTypesByTaskId = async (req: Request, res: Response) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_tasktypes')) {
            return handleForbiddenError(res, 'You do not have permission to view task types');
        }
        
        // Get the TaskType model for this company's database
        const TaskType = getTaskTypeModel(req);
        
        const { taskId } = req.params;

        if (!taskId || isNaN(Number(taskId))) {
            return res.status(400).json({
                success: false,
                message: 'Valid Task ID is required'
            });
        }

        // Get all active task types
        const taskTypes = await TaskType.findAll({
            where: {
                TT_Del_Flag: 0,
                Status: 1
            },
            attributes: [
                'Task_Type_Id',
                'Task_Type',
                'Is_Reptative',
                'Hours_Duration',
                'Day_Duration'
            ],
            order: [['Task_Type', 'ASC']]
        });

        const formattedTaskTypes = taskTypes.map(taskType => formatTaskTypeForResponse(taskType));

        return res.status(200).json({
            success: true,
            message: 'Task types retrieved successfully',
            data: formattedTaskTypes,
            totalRecords: formattedTaskTypes.length
        });

    } catch (error: any) {
        console.error('Error fetching task types by task:', error);
        return servError(error, res);
    }
};

/**
 * Get task types statistics
 */
export const getTaskTypeStatistics = async (req: Request, res: Response) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_tasktypes')) {
            return handleForbiddenError(res, 'You do not have permission to view task type statistics');
        }
        
        // Get the TaskType model for this company's database
        const TaskType = getTaskTypeModel(req);
        
        const totalTaskTypes = await TaskType.count();
        const activeTaskTypes = await TaskType.count({ where: { Status: 1, TT_Del_Flag: 0 } });
        const inactiveTaskTypes = await TaskType.count({ where: { Status: 0, TT_Del_Flag: 0 } });
        const deletedTaskTypes = await TaskType.count({ where: { TT_Del_Flag: 1 } });
        
        // Count by repetitive flag
        const repetitiveCount = await TaskType.count({ where: { Is_Reptative: 1, TT_Del_Flag: 0 } });
        const nonRepetitiveCount = await TaskType.count({ where: { Is_Reptative: 0, TT_Del_Flag: 0 } });

        return res.status(200).json({
            success: true,
            message: 'Task type statistics retrieved successfully',
            data: {
                totalTaskTypes,
                activeTaskTypes: {
                    count: activeTaskTypes,
                    text: 'Active'
                },
                inactiveTaskTypes: {
                    count: inactiveTaskTypes,
                    text: 'Inactive'
                },
                deletedTaskTypes: {
                    count: deletedTaskTypes,
                    text: 'Deleted'
                },
                repetitiveCount: {
                    count: repetitiveCount,
                    text: 'Repetitive'
                },
                nonRepetitiveCount: {
                    count: nonRepetitiveCount,
                    text: 'Non-Repetitive'
                }
            }
        });

    } catch (error: any) {
        console.error('Error fetching task type statistics:', error);
        return servError(error, res);
    }
};

/**
 * Get status options for dropdown
 */
export const getStatusOptions = async (req: Request, res: Response) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_tasktypes')) {
            return handleForbiddenError(res, 'You do not have permission to view status options');
        }
        
        const statusOptions = [
            { value: 1, label: 'Active' },
            { value: 0, label: 'Inactive' }
        ];

        const delFlagOptions = [
            { value: 0, label: 'Active' },
            { value: 1, label: 'Deleted' }
        ];

        const reptativeOptions = [
            { value: 0, label: 'Non-Repetitive' },
            { value: 1, label: 'Repetitive' }
        ];

        return res.status(200).json({
            success: true,
            message: 'Status options retrieved successfully',
            data: {
                statusOptions,
                delFlagOptions,
                reptativeOptions
            }
        });

    } catch (error: any) {
        console.error('Error fetching status options:', error);
        return servError(error, res);
    }
};

/**
 * Get task types for dropdown (minimal data for select inputs)
 */
export const getTaskTypeDropdown = async (req: Request, res: Response) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_tasktypes')) {
            return handleForbiddenError(res, 'You do not have permission to view task types');
        }
        
        // Get the TaskType model for this company's database
        const TaskType = getTaskTypeModel(req);
        const Project = getProjectModel(req);
        
        // Get query parameters for filtering
        const { projectId, includeInactive = 'false' } = req.query;
        
        // Build where clause
        const whereClause: any = {};
        
        // Always filter by TT_Del_Flag = 0 for dropdown by default
        whereClause.TT_Del_Flag = 0;
        
        // Add status filter (active only by default)
        if (includeInactive !== 'true') {
            whereClause.Status = 1;
        }
        
        // Filter by project ID if provided
        if (projectId && !isNaN(Number(projectId))) {
            whereClause.Project_Id = Number(projectId);
        }
        
        const taskTypes = await TaskType.findAll({
            where: whereClause,
            attributes: [
                'Task_Type_Id',
                'Task_Type',
                'Is_Reptative',
                'Hours_Duration',
                'Day_Duration',
                'TT_Del_Flag',
                'Project_Id',
                'Est_StartTime',
                'Est_EndTime',
                'Status'
            ],
            order: [['Task_Type', 'ASC']]
        });
        
        // Get project names for task types
        const projectIds: number[] = [];
        taskTypes.forEach(tt => {
            if (tt.Project_Id !== null && tt.Project_Id !== undefined) {
                projectIds.push(tt.Project_Id);
            }
        });
        
        const uniqueProjectIds = [...new Set(projectIds)];
        
        const projectsMap = new Map<number, string>();
        if (uniqueProjectIds.length > 0) {
            const projects = await Project.findAll({
                where: {
                    Project_Id: uniqueProjectIds
                },
                attributes: ['Project_Id', 'Project_Name']
            });
            
            projects.forEach(project => {
                const projectIdValue = project.Project_Id;
                const projectName = project.Project_Name;
                if (projectName !== null && projectName !== undefined) {
                    projectsMap.set(projectIdValue, projectName);
                }
            });
        }
        
        // Format task types for dropdown response with proper null/undefined handling
        const formattedTaskTypes = taskTypes.map(taskType => {
            const plainTaskType = taskType.get({ plain: true });
            
            // Safely extract values with defaults
            const isReptativeValue = (plainTaskType.Is_Reptative !== null && plainTaskType.Is_Reptative !== undefined) ? plainTaskType.Is_Reptative : 0;
            const ttDelFlagValue = (plainTaskType.TT_Del_Flag !== null && plainTaskType.TT_Del_Flag !== undefined) ? plainTaskType.TT_Del_Flag : 0;
            const statusValue = (plainTaskType.Status !== null && plainTaskType.Status !== undefined) ? plainTaskType.Status : 1;
            
            return {
                Task_Type_Id: plainTaskType.Task_Type_Id,
                Task_Type: plainTaskType.Task_Type,
                Is_Reptative: isReptativeValue,
                Hours_Duration: plainTaskType.Hours_Duration !== undefined ? plainTaskType.Hours_Duration : null,
                Day_Duration: plainTaskType.Day_Duration !== undefined ? plainTaskType.Day_Duration : null,
                TT_Del_Flag: ttDelFlagValue,
                Project_Id: plainTaskType.Project_Id !== undefined ? plainTaskType.Project_Id : null,
                Est_StartTime: plainTaskType.Est_StartTime !== undefined ? plainTaskType.Est_StartTime : null,
                Est_EndTime: plainTaskType.Est_EndTime !== undefined ? plainTaskType.Est_EndTime : null,
                Status: statusValue,
                statusText: getStatusText(statusValue),
                delFlagText: getDelFlagText(ttDelFlagValue),
                isReptativeText: getReptativeText(isReptativeValue),
                Project_Name: plainTaskType.Project_Id ? projectsMap.get(plainTaskType.Project_Id) || null : null
            };
        });
        
        return res.status(200).json({
            success: true,
            message: 'Task types retrieved successfully for dropdown',
            data: formattedTaskTypes,
            totalRecords: formattedTaskTypes.length
        });
        
    } catch (error: any) {
        console.error('Error fetching task types for dropdown:', error);
        return servError(error, res);
    }
};