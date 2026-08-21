import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { getDefaultConnection } from '../../../config/database.config';
import { initUserModel } from '../../../models/masters/users/users.model';
import { initEmployeeModel } from '../../../models/masters/employee/type.model';
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
    initTicketTaskModel,
    ticketTaskCreateSchema,
    ticketTaskUpdateSchema,
    ticketTaskIdSchema,
    ticketTaskQuerySchema,
    TicketTaskCreateInput,
    TicketTaskUpdateInput,
    TicketTaskQueryInput
} from '../../../models/masters/ticketTask/ticketTask.model';

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

const getTicketTaskModel = (req: Request) => {
    const sequelize = (req as any).companyDB;
    if (!sequelize) {
        throw new Error('Database connection not available');
    }
    return initTicketTaskModel(sequelize);
};

const handleForbiddenError = (res: Response, customMessage?: string) => {
    return res.status(403).json({
        success: false,
        message: customMessage || 'Access denied. You do not have permission to perform this action.',
        error: 'FORBIDDEN'
    });
};

const checkUserPermission = (req: Request, requiredPermission?: string): boolean => {
    const user = (req as any).user;
    if (!user) return false;
    if (user.UserTypeId === 0) return true;
    
    if (requiredPermission === 'create' && ![1, 2, 3, 4, 5, 6, 7, 8, 9, 10].includes(user.UserTypeId)) return false;
    if (requiredPermission === 'update' && ![1, 2].includes(user.UserTypeId)) return false;
    if (requiredPermission === 'delete' && user.UserTypeId !== 1) return false;
    if (requiredPermission === 'view' && ![1, 2, 3, 4, 5, 6, 7, 8, 9, 10].includes(user.UserTypeId)) return false;
    
    return true;
};

export const getAllTicketTasks = async (req: Request, res: Response) => {
    try {
        if (!checkUserPermission(req, 'view')) {
            return handleForbiddenError(res, 'You do not have permission to view ticket tasks');
        }

        const TicketTaskModel = getTicketTaskModel(req);
        const validation = validateWithZod<TicketTaskQueryInput>(ticketTaskQuerySchema, req.query);

        if (!validation.success) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors: validation.errors });
        }

        const { project_id, Ticket_Id, Employee_Involved_Id, From_CompanyId, To_CompanyId, Task_Id } = validation.data!;
        
        const whereClause: any = {};
        
        const user = (req as any).user;
        if (user && user.currentCompanyId) {
            whereClause[Op.or] = [
                { From_CompanyId: user.currentCompanyId },
                { To_CompanyId: user.currentCompanyId }
            ];
        }

        if (project_id !== undefined) whereClause.project_id = project_id;
        if (Ticket_Id !== undefined) whereClause.Ticket_Id = Ticket_Id;
        if (Employee_Involved_Id !== undefined) whereClause.Employee_Involved_Id = Employee_Involved_Id;
        if (From_CompanyId !== undefined) whereClause.From_CompanyId = From_CompanyId;
        if (To_CompanyId !== undefined) whereClause.To_CompanyId = To_CompanyId;
        if (Task_Id !== undefined) whereClause.Task_Id = Task_Id;

        const rows = await TicketTaskModel.findAll({
            where: whereClause,
            order: [['id', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            message: 'Ticket tasks retrieved successfully',
            data: rows,
            total: rows.length
        });

    } catch (error: any) {
        console.error('Error fetching ticket tasks:', error);
        return servError(error, res, 'Internal server error');
    }
};

export const getTicketTaskById = async (req: Request, res: Response) => {
    try {
        if (!checkUserPermission(req, 'view')) {
            return handleForbiddenError(res, 'You do not have permission to view ticket tasks');
        }

        const TicketTaskModel = getTicketTaskModel(req);
        const validation = validateWithZod<{ id: number }>(ticketTaskIdSchema, { id: parseInt(req.params.id) });
        
        if (!validation.success) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors: validation.errors });
        }

        const { id } = validation.data!;
        const ticketTask = await TicketTaskModel.findByPk(id);
        
        if (!ticketTask) {
            return notFound(res, 'Ticket task not found');
        }

        const user = (req as any).user;
        if (user && user.currentCompanyId) {
            if (ticketTask.From_CompanyId !== user.currentCompanyId && ticketTask.To_CompanyId !== user.currentCompanyId) {
                return handleForbiddenError(res, 'You do not have permission to access this ticket task');
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Ticket task retrieved successfully',
            data: ticketTask
        });

    } catch (error: any) {
        console.error('Error fetching ticket task:', error);
        return servError(error, res, 'Internal server error');
    }
};

export const createTicketTask = async (req: Request, res: Response) => {
    const sequelize = (req as any).companyDB;
    if (!sequelize) {
        return res.status(500).json({ success: false, message: 'Database connection not available' });
    }
    const transaction = await sequelize.transaction();

    try {
        if (!checkUserPermission(req, 'create')) {
            await transaction.rollback();
            return handleForbiddenError(res, 'You do not have permission to create ticket tasks');
        }

        const validation = validateWithZod<TicketTaskCreateInput>(ticketTaskCreateSchema, req.body);
        if (!validation.success) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: 'Validation failed', errors: validation.errors });
        }

        const data = validation.data!;
        const user = (req as any).user;
        
        if (user && user.currentCompanyId && !data.From_CompanyId) {
            data.From_CompanyId = user.currentCompanyId;
        }

        const TicketTaskModel = getTicketTaskModel(req);
        
        const newTicketTask = await TicketTaskModel.create(data, { transaction });

        await transaction.commit();
        return created(res, newTicketTask, 'Ticket task created successfully');

    } catch (error: any) {
        await transaction.rollback().catch(() => {});
        console.error('Create ticket task error:', error);
        return servError(error, res, 'Internal server error');
    }
};

export const updateTicketTask = async (req: Request, res: Response) => {
    const sequelize = (req as any).companyDB;
    if (!sequelize) {
        return res.status(500).json({ success: false, message: 'Database connection not available' });
    }
    const transaction = await sequelize.transaction();

    try {
        if (!checkUserPermission(req, 'update')) {
            await transaction.rollback();
            return handleForbiddenError(res, 'You do not have permission to update ticket tasks');
        }

        const idValidation = validateWithZod<{ id: number }>(ticketTaskIdSchema, { id: parseInt(req.params.id) });
        if (!idValidation.success) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: 'Invalid ID parameter' });
        }

        const { id } = idValidation.data!;
        const TicketTaskModel = getTicketTaskModel(req);
        
        const existing = await TicketTaskModel.findByPk(id, { transaction });
        if (!existing) {
            await transaction.rollback();
            return notFound(res, 'Ticket task not found');
        }

        const user = (req as any).user;
        if (user && user.currentCompanyId) {
            if (existing.From_CompanyId !== user.currentCompanyId && existing.To_CompanyId !== user.currentCompanyId) {
                await transaction.rollback();
                return handleForbiddenError(res, 'You do not have permission to modify this ticket task');
            }
        }

        const bodyValidation = validateWithZod<TicketTaskUpdateInput>(ticketTaskUpdateSchema, req.body);
        if (!bodyValidation.success) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: 'Validation failed', errors: bodyValidation.errors });
        }

        const data = bodyValidation.data!;

        await existing.update(data, { transaction });

        await transaction.commit();
        return updated(res, existing, 'Ticket task updated successfully');

    } catch (error: any) {
        await transaction.rollback().catch(() => {});
        console.error('Update ticket task error:', error);
        return servError(error, res, 'Internal server error');
    }
};

export const deleteTicketTask = async (req: Request, res: Response) => {
    const sequelize = (req as any).companyDB;
    if (!sequelize) {
        return res.status(500).json({ success: false, message: 'Database connection not available' });
    }
    const transaction = await sequelize.transaction();

    try {
        if (!checkUserPermission(req, 'delete')) {
            await transaction.rollback();
            return handleForbiddenError(res, 'You do not have permission to delete ticket tasks');
        }

        const idValidation = validateWithZod<{ id: number }>(ticketTaskIdSchema, { id: parseInt(req.params.id) });
        if (!idValidation.success) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: 'Invalid ID parameter' });
        }

        const { id } = idValidation.data!;
        const TicketTaskModel = getTicketTaskModel(req);
        
        const existing = await TicketTaskModel.findByPk(id, { transaction });
        if (!existing) {
            await transaction.rollback();
            return notFound(res, 'Ticket task not found');
        }

        const user = (req as any).user;
        if (user && user.currentCompanyId) {
            if (existing.From_CompanyId !== user.currentCompanyId && existing.To_CompanyId !== user.currentCompanyId) {
                await transaction.rollback();
                return handleForbiddenError(res, 'You do not have permission to delete this ticket task');
            }
        }

        await existing.destroy({ transaction });

        await transaction.commit();
        return deleted(res, 'Ticket task deleted successfully');

    } catch (error: any) {
        await transaction.rollback().catch(() => {});
        console.error('Delete ticket task error:', error);
        return servError(error, res, 'Internal server error');
    }
};

export const getEmpIdByGlobalUserId = async (req: Request, res: Response) => {
    try {
        const globalUserId = parseInt(req.params.globalUserId);
        if (isNaN(globalUserId)) {
            return res.status(400).json({ success: false, message: 'Invalid Global User ID' });
        }

        const defaultConn = getDefaultConnection();
        const UserModel = initUserModel(defaultConn);
        
        const user = await UserModel.findOne({
            attributes: ['Local_User_ID'],
            where: { Global_User_ID: globalUserId }
        });

        if (!user || user.Local_User_ID === null || user.Local_User_ID === undefined) {
            return res.status(404).json({ success: false, message: 'User not found or has no local user ID mapping' });
        }

        const companyDB = (req as any).companyDB;
        if (!companyDB) {
            return res.status(500).json({ success: false, message: 'Database connection not available' });
        }

        const EmployeeModel = initEmployeeModel(companyDB);
        const employee = await EmployeeModel.findOne({
            attributes: ['Emp_Id'],
            where: { User_Mgt_Id: user.Local_User_ID }
        });

        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found in Employee Master for this local user ID' });
        }

        return res.status(200).json({
            success: true,
            data: { Emp_Id: Number(employee.get('Emp_Id')) }
        });
    } catch (error: any) {
        console.error('getEmpIdByGlobalUserId error:', error);
        return servError(error, res, 'Internal server error');
    }
};
