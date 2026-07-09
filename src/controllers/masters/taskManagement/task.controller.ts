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
    initTaskModel,
    initProjectScheduleModel,
    defineTaskAssociations,
    taskCreateSchema,
    taskUpdateSchema,
    taskQuerySchema,
    taskIdSchema,
    TaskCreateInput,
    TaskUpdateInput,
    TaskQueryParams,
    formatTaskForResponse
} from '../../../models/masters/task/type.model';

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

// Helper to get Task model with the correct database connection
const getTaskModel = (req: Request) => {
    const sequelize = (req as any).companyDB;
    if (!sequelize) {
        throw new Error('Database connection not available');
    }
    return initTaskModel(sequelize);
};

// Helper to get ProjectSchedule model with the correct database connection
const getProjectScheduleModel = (req: Request) => {
    const sequelize = (req as any).companyDB;
    if (!sequelize) {
        throw new Error('Database connection not available');
    }
    return initProjectScheduleModel(sequelize);
};

// Helper to setup associations for the current connection
const setupTaskAssociations = (req: Request) => {
    const sequelize = (req as any).companyDB;
    if (!sequelize) {
        throw new Error('Database connection not available');
    }
    
    const Task = initTaskModel(sequelize);
    const ProjectSchedule = initProjectScheduleModel(sequelize);
    
    Task.hasMany(ProjectSchedule, {
        foreignKey: 'Task_Id',
        as: 'Schedules'
    });
    
    ProjectSchedule.belongsTo(Task, {
        foreignKey: 'Task_Id',
        as: 'Task'
    });
    
    return { Task, ProjectSchedule };
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
    if (requiredPermission === 'create_tasks' && ![1, 2, 3, 4, 5, 6, 7, 8, 9, 10].includes(user.UserTypeId)) {
        return false;
    }
    if (requiredPermission === 'update_tasks' && ![1, 2].includes(user.UserTypeId)) {
        return false;
    }
    if (requiredPermission === 'delete_tasks' && user.UserTypeId !== 1) {
        return false;
    }
    if (requiredPermission === 'view_tasks' && ![1, 2, 3, 4, 5, 6, 7, 8, 9, 10].includes(user.UserTypeId)) {
        return false;
    }
    
    return true;
};

/**
 * Get all tasks with filtering (NO PAGINATION)
 * Optional inclusion of schedule data
 */
export const getAllTasks = async (req: Request, res: Response) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_tasks')) {
            return handleForbiddenError(res, 'You do not have permission to view tasks');
        }
        
        // Get the Task model for this company's database
        const { Task, ProjectSchedule } = setupTaskAssociations(req);
        
        // Validate query parameters
        const validation = validateWithZod<TaskQueryParams>(taskQuerySchema, req.query);
        
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const {
            Company_Id,
            Task_Type_Id,
            Project_Id,
            search,
            sortBy = 'Task_Id',
            sortOrder = 'DESC',
            includeSchedules = false
        } = validation.data!;

        // Build where clause
        const whereClause: any = {};
        
        // Add company filter if user has company restriction
        const user = (req as any).user;
        if (user && user.currentCompanyId) {
            whereClause.Company_Id = user.currentCompanyId;
        } else if (Company_Id !== undefined && Company_Id !== null) {
            whereClause.Company_Id = Company_Id;
        }
        
        if (Task_Type_Id !== undefined) whereClause.Task_Type_Id = Task_Type_Id;
        if (Project_Id !== undefined && Project_Id !== null) whereClause.Project_Id = Project_Id;
        
        // Search functionality
        if (search) {
            whereClause[Op.or] = [
                { Task_Name: { [Op.like]: `%${search}%` } },
                { Task_Desc: { [Op.like]: `%${search}%` } }
            ];
        }

        // Validate sort parameters
        const validSortFields = ['Task_Id', 'Task_Name', 'Entry_Date', 'Update_Date', 'Task_Type_Id'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'Task_Id';
        const sortDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        // Build include options
        const includeOptions: any[] = [];
        
        if (includeSchedules) {
            includeOptions.push({
                model: ProjectSchedule,
                as: 'Schedules',
                required: false,
                where: {
                    Sch_Del_Flag: false
                },
                order: [['Sch_Date', 'DESC']]
            });
        }

        // Get all tasks without pagination
        const tasks = await Task.findAll({
            where: whereClause,
            include: includeOptions,
            order: [[sortField, sortDirection]]
        });

        // Format tasks for response
        const formattedTasks = tasks.map(task => formatTaskForResponse(task));

        return res.status(200).json({
            success: true,
            message: 'Tasks retrieved successfully',
            data: formattedTasks,
            total: tasks.length
        });

    } catch (error: any) {
        console.error('Error fetching tasks:', error);
        return servError(error, res, 'Internal server error');
    }
};

/**
 * Get task by ID with optional schedule data
 */
export const getTaskById = async (req: Request, res: Response) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_tasks')) {
            return handleForbiddenError(res, 'You do not have permission to view tasks');
        }
        
        // Get the Task model for this company's database
        const { Task, ProjectSchedule } = setupTaskAssociations(req);
        
        // Validate ID parameter
        const validation = validateWithZod<{ id: number }>(taskIdSchema, { id: parseInt(req.params.id) });
        
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const { id } = validation.data!;
        const { includeSchedules } = req.query;

        // Build include options
        const includeOptions: any[] = [];
        
        if (includeSchedules === 'true') {
            includeOptions.push({
                model: ProjectSchedule,
                as: 'Schedules',
                required: false,
                where: {
                    Sch_Del_Flag: false
                },
                order: [['Sch_Date', 'DESC']]
            });
        }

        const task = await Task.findByPk(id, {
            include: includeOptions
        });
        
        if (!task) {
            return notFound(res, 'Task not found');
        }
        
        // Check if user has access to this task's company
        const user = (req as any).user;
        if (user && user.currentCompanyId && task.Company_Id !== null && task.Company_Id !== user.currentCompanyId) {
            return handleForbiddenError(res, 'You do not have permission to access this task');
        }

        // Format task for response
        const formattedTask = formatTaskForResponse(task);

        return res.status(200).json({
            success: true,
            message: 'Task retrieved successfully',
            data: formattedTask
        });

    } catch (error: any) {
        console.error('Error fetching task:', error);
        return servError(error, res, 'Internal server error');
    }
};

/**
 * Get tasks by project ID with optional schedules
 */
export const getTasksByProject = async (req: Request, res: Response) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_tasks')) {
            return handleForbiddenError(res, 'You do not have permission to view tasks');
        }
        
        // Get the Task model for this company's database
        const { Task, ProjectSchedule } = setupTaskAssociations(req);
        
        const { projectId } = req.params;
        const { includeSchedules } = req.query;
        
        if (!projectId || isNaN(parseInt(projectId))) {
            return res.status(400).json({
                success: false,
                message: 'Valid project ID is required'
            });
        }

        // Build include options
        const includeOptions: any[] = [];
        
        if (includeSchedules === 'true') {
            includeOptions.push({
                model: ProjectSchedule,
                as: 'Schedules',
                required: false,
                where: {
                    Sch_Del_Flag: false
                },
                order: [['Sch_Date', 'DESC']]
            });
        }

        // Get all tasks for project without pagination
        const tasks = await Task.findAll({
            where: { Project_Id: parseInt(projectId) },
            include: includeOptions,
            order: [['Task_Name', 'ASC']]
        });

        // Format tasks for response
        const formattedTasks = tasks.map(task => formatTaskForResponse(task));

        return res.status(200).json({
            success: true,
            message: 'Tasks retrieved successfully',
            data: formattedTasks,
            total: tasks.length
        });

    } catch (error: any) {
        console.error('Error fetching tasks by project:', error);
        return servError(error, res, 'Internal server error');
    }
};

/**
 * Get tasks by company ID with optional schedules
 */
export const getTasksByCompany = async (req: Request, res: Response) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_tasks')) {
            return handleForbiddenError(res, 'You do not have permission to view tasks');
        }
        
        // Get the Task model for this company's database
        const { Task, ProjectSchedule } = setupTaskAssociations(req);
        
        const { companyId } = req.params;
        const { includeSchedules } = req.query;
        
        if (!companyId || isNaN(parseInt(companyId))) {
            return res.status(400).json({
                success: false,
                message: 'Valid company ID is required'
            });
        }
        
        // Check if user has access to this company
        const user = (req as any).user;
        if (user && user.currentCompanyId && parseInt(companyId) !== user.currentCompanyId) {
            return handleForbiddenError(res, 'You do not have permission to view tasks for this company');
        }

        // Build include options
        const includeOptions: any[] = [];
        
        if (includeSchedules === 'true') {
            includeOptions.push({
                model: ProjectSchedule,
                as: 'Schedules',
                required: false,
                where: {
                    Sch_Del_Flag: false
                },
                order: [['Sch_Date', 'DESC']]
            });
        }

        // Get all tasks for company without pagination
        const tasks = await Task.findAll({
            where: { Company_Id: parseInt(companyId) },
            include: includeOptions,
            order: [['Task_Name', 'ASC']]
        });

        // Format tasks for response
        const formattedTasks = tasks.map(task => formatTaskForResponse(task));

        return res.status(200).json({
            success: true,
            message: 'Tasks retrieved successfully',
            data: formattedTasks,
            total: tasks.length
        });

    } catch (error: any) {
        console.error('Error fetching tasks by company:', error);
        return servError(error, res, 'Internal server error');
    }
};

/**
 * Get tasks by task group ID with optional schedules
 */
export const getTasksByTaskGroup = async (req: Request, res: Response) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_tasks')) {
            return handleForbiddenError(res, 'You do not have permission to view tasks');
        }
        
        // Get the Task model for this company's database
        const { Task, ProjectSchedule } = setupTaskAssociations(req);
        
        const { taskGroupId } = req.params;
        const { includeSchedules } = req.query;
        
        if (!taskGroupId || isNaN(parseInt(taskGroupId))) {
            return res.status(400).json({
                success: false,
                message: 'Valid task group ID is required'
            });
        }

        // Build include options
        const includeOptions: any[] = [];
        
        if (includeSchedules === 'true') {
            includeOptions.push({
                model: ProjectSchedule,
                as: 'Schedules',
                required: false,
                where: {
                    Sch_Del_Flag: false
                },
                order: [['Sch_Date', 'DESC']]
            });
        }

        // Get all tasks for task group without pagination
        const tasks = await Task.findAll({
            where: { Task_Type_Id: parseInt(taskGroupId) },
            include: includeOptions,
            order: [['Task_Name', 'ASC']]
        });

        // Format tasks for response
        const formattedTasks = tasks.map(task => formatTaskForResponse(task));

        return res.status(200).json({
            success: true,
            message: 'Tasks retrieved successfully',
            data: formattedTasks,
            total: tasks.length
        });

    } catch (error: any) {
        console.error('Error fetching tasks by task group:', error);
        return servError(error, res, 'Internal server error');
    }
};

/**
 * Get tasks with null company_id
 */
export const getTasksWithNoCompany = async (req: Request, res: Response) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_tasks')) {
            return handleForbiddenError(res, 'You do not have permission to view tasks');
        }
        
        // Get the Task model for this company's database
        const { Task, ProjectSchedule } = setupTaskAssociations(req);
        
        const { includeSchedules } = req.query;

        // Build include options
        const includeOptions: any[] = [];
        
        if (includeSchedules === 'true') {
            includeOptions.push({
                model: ProjectSchedule,
                as: 'Schedules',
                required: false,
                where: {
                    Sch_Del_Flag: false
                },
                order: [['Sch_Date', 'DESC']]
            });
        }

        // Get all tasks with no company without pagination
        const tasks = await Task.findAll({
            where: { Company_Id: null },
            include: includeOptions,
            order: [['Task_Name', 'ASC']]
        });

        // Format tasks for response
        const formattedTasks = tasks.map(task => formatTaskForResponse(task));

        return res.status(200).json({
            success: true,
            message: 'Tasks with no company retrieved successfully',
            data: formattedTasks,
            total: tasks.length
        });

    } catch (error: any) {
        console.error('Error fetching tasks with no company:', error);
        return servError(error, res, 'Internal server error');
    }
};

/**
 * Get tasks with null Project_Id
 */
export const getTasksWithNoProject = async (req: Request, res: Response) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_tasks')) {
            return handleForbiddenError(res, 'You do not have permission to view tasks');
        }
        
        // Get the Task model for this company's database
        const { Task, ProjectSchedule } = setupTaskAssociations(req);
        
        const { includeSchedules } = req.query;

        // Build include options
        const includeOptions: any[] = [];
        
        if (includeSchedules === 'true') {
            includeOptions.push({
                model: ProjectSchedule,
                as: 'Schedules',
                required: false,
                where: {
                    Sch_Del_Flag: false
                },
                order: [['Sch_Date', 'DESC']]
            });
        }

        // Get all tasks with no project without pagination
        const tasks = await Task.findAll({
            where: { Project_Id: null },
            include: includeOptions,
            order: [['Task_Name', 'ASC']]
        });

        // Format tasks for response
        const formattedTasks = tasks.map(task => formatTaskForResponse(task));

        return res.status(200).json({
            success: true,
            message: 'Tasks with no project retrieved successfully',
            data: formattedTasks,
            total: tasks.length
        });

    } catch (error: any) {
        console.error('Error fetching tasks with no project:', error);
        return servError(error, res, 'Internal server error');
    }
};

/**
 * Get schedules for a specific task
 */
export const getTaskSchedules = async (req: Request, res: Response) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_tasks')) {
            return handleForbiddenError(res, 'You do not have permission to view task schedules');
        }
        
        // Get the Task and ProjectSchedule models for this company's database
        const { Task, ProjectSchedule } = setupTaskAssociations(req);
        
        const { taskId } = req.params;
        
        if (!taskId || isNaN(parseInt(taskId))) {
            return res.status(400).json({
                success: false,
                message: 'Valid task ID is required'
            });
        }

        const task = await Task.findByPk(parseInt(taskId));
        
        if (!task) {
            return notFound(res, 'Task not found');
        }
        
        // Check if user has access to this task's company
        const user = (req as any).user;
        if (user && user.currentCompanyId && task.Company_Id !== null && task.Company_Id !== user.currentCompanyId) {
            return handleForbiddenError(res, 'You do not have permission to view schedules for this task');
        }

        // Get all schedules without pagination
        const schedules = await ProjectSchedule.findAll({
            where: { 
                Task_Id: parseInt(taskId),
                Sch_Del_Flag: false
            },
            order: [['Sch_Date', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            message: 'Task schedules retrieved successfully',
            data: schedules,
            total: schedules.length
        });

    } catch (error: any) {
        console.error('Error fetching task schedules:', error);
        return servError(error, res, 'Internal server error');
    }
};

/**
 * Create new task
 */
export const createTask = async (req: Request, res: Response) => {
    try {
        // Check authentication and permission
        if (!checkUserPermission(req, 'create_tasks')) {
            return handleForbiddenError(res, 'You do not have permission to create tasks');
        }
        
        // Get the Task model for this company's database
        const Task = getTaskModel(req);
        
        // Validate request body
        const validation = validateWithZod<TaskCreateInput>(taskCreateSchema, req.body);
        
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const taskData = validation.data!;

        // Check for duplicate task name in same group
        const existingTask = await Task.findOne({
            where: {
                Task_Name: taskData.Task_Name.trim(),
                Task_Type_Id: taskData.Task_Type_Id
            }
        });

        if (existingTask) {
            return res.status(409).json({
                success: false,
                message: 'Task with this name already exists in the selected group'
            });
        }

        // Get user from request (set by authentication middleware)
        const user = (req as any).user;
        
        // Prepare task data with additional fields
        const finalTaskData: any = {
            ...taskData,
            Task_Name: taskData.Task_Name.trim(),
            Task_Desc: taskData.Task_Desc ? taskData.Task_Desc.trim() : null,
            Company_Id: (req as any).currentCompanyId || taskData.Company_Id || null,
            Project_Id: taskData.Project_Id || null,
            Entry_By: user?.Global_User_ID || user?.id || 1,
            Entry_Date: new Date()
        };

        const task = await Task.create(finalTaskData);
        
        // Format task for response
        const formattedTask = formatTaskForResponse(task);
        
        return created(res, {
            success: true,
            message: 'Task created successfully',
            data: formattedTask
        });

    } catch (error: any) {
        console.error('Error creating task:', error);
        return servError(error, res, 'Internal server error');
    }
};

/**
 * Update task
 */
export const updateTask = async (req: Request, res: Response) => {
    try {
        // Check authentication and permission
        if (!checkUserPermission(req, 'update_tasks')) {
            return handleForbiddenError(res, 'You do not have permission to update tasks');
        }
        
        // Get the Task model for this company's database
        const Task = getTaskModel(req);
        
        // Validate ID parameter
        const idValidation = validateWithZod<{ id: number }>(taskIdSchema, { id: parseInt(req.params.id) });
        
        if (!idValidation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: idValidation.errors
            });
        }

        const { id } = idValidation.data!;

        // Validate request body
        const bodyValidation = validateWithZod<TaskUpdateInput>(taskUpdateSchema, req.body);
        
        if (!bodyValidation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: bodyValidation.errors
            });
        }

        const updateData = bodyValidation.data!;

        const task = await Task.findByPk(id);
        
        if (!task) {
            return notFound(res, 'Task not found');
        }
        
        // Check if user has access to this task's company
        const user = (req as any).user;
        if (user && user.currentCompanyId && task.Company_Id !== null && task.Company_Id !== user.currentCompanyId) {
            return handleForbiddenError(res, 'You do not have permission to update this task');
        }

        // Check for duplicate task name if Task_Name or Task_Type_Id is being updated
        if ((updateData.Task_Name && updateData.Task_Name !== task.Task_Name) || 
            (updateData.Task_Type_Id && updateData.Task_Type_Id !== task.Task_Type_Id)) {
            
            const checkTaskName = updateData.Task_Name || task.Task_Name;
            const checkTaskGroupId = updateData.Task_Type_Id || task.Task_Type_Id;
            
            const existingTask = await Task.findOne({
                where: {
                    Task_Id: { [Op.ne]: id },
                    Task_Name: checkTaskName.trim(),
                    Task_Type_Id: checkTaskGroupId
                }
            });

            if (existingTask) {
                return res.status(409).json({
                    success: false,
                    message: 'Another task with this name already exists in the selected group'
                });
            }
        }

        // Prepare update data
        const finalUpdateData: any = {};
        if (updateData.Task_Name !== undefined) finalUpdateData.Task_Name = updateData.Task_Name.trim();
        if (updateData.Task_Desc !== undefined) finalUpdateData.Task_Desc = updateData.Task_Desc ? updateData.Task_Desc.trim() : null;
        if (updateData.Company_Id !== undefined) finalUpdateData.Company_Id = updateData.Company_Id;
        if (updateData.Task_Type_Id !== undefined) finalUpdateData.Task_Type_Id = updateData.Task_Type_Id;
        if (updateData.Project_Id !== undefined) finalUpdateData.Project_Id = updateData.Project_Id;
        
        // Add update metadata
        finalUpdateData.Update_By = user?.Global_User_ID || user?.id || 1;
        finalUpdateData.Update_Date = new Date();

        await task.update(finalUpdateData);
        
        const updatedTask = await Task.findByPk(id);
        
        if (!updatedTask) {
            return notFound(res, 'Task not found after update');
        }

        // Format task for response
        const formattedTask = formatTaskForResponse(updatedTask);
        
        return updated(res, {
            success: true,
            message: 'Task updated successfully',
            data: formattedTask
        });

    } catch (error: any) {
        console.error('Error updating task:', error);
        return servError(error, res, 'Internal server error');
    }
};

/**
 * Delete task (soft delete - check schedules first)
 */
export const deleteTask = async (req: Request, res: Response) => {
    try {
        // Check authentication and permission
        if (!checkUserPermission(req, 'delete_tasks')) {
            return handleForbiddenError(res, 'You do not have permission to delete tasks');
        }
        
        // Get the Task and ProjectSchedule models for this company's database
        const { Task, ProjectSchedule } = setupTaskAssociations(req);
        
        // Validate ID parameter
        const validation = validateWithZod<{ id: number }>(taskIdSchema, { id: parseInt(req.params.id) });
        
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const { id } = validation.data!;

        const task = await Task.findByPk(id);
        
        if (!task) {
            return notFound(res, 'Task not found');
        }
        
        // Check if user has access to this task's company
        const user = (req as any).user;
        if (user && user.currentCompanyId && task.Company_Id !== null && task.Company_Id !== user.currentCompanyId) {
            return handleForbiddenError(res, 'You do not have permission to delete this task');
        }

        // Check if task has any schedules before deleting
        const scheduleCount = await ProjectSchedule.count({
            where: { Task_Id: id }
        });

        if (scheduleCount > 0) {
            return res.status(409).json({
                success: false,
                message: 'Cannot delete task because it has associated schedules. Please delete the schedules first.'
            });
        }

        await task.destroy();
        
        return res.status(200).json({
            success: true,
            message: 'Task deleted successfully'
        });

    } catch (error: any) {
        console.error('Error deleting task:', error);
        return servError(error, res, 'Internal server error');
    }
};