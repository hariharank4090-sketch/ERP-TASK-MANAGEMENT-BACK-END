// controllers/masters/taskManagement/branchMaster.controller.ts
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
import { initBranchModel } from '../../../models/masters/branchMaster/type.model';
import {
    branchCreateSchema,
    branchUpdateSchema,
    branchIdSchema,
    BranchCreateInput,
    BranchUpdateInput,
    branchQuerySchema,
    BranchQueryParams
} from '../../../models/masters/branchMaster/type.model';

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

const getBranchModel = (req: Request) => {
    const sequelize = (req as any).companyDB;
    if (!sequelize) {
        throw new Error('Database connection not available');
    }
    return initBranchModel(sequelize);
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

export const getAllBranches = async (req: Request, res: Response) => {
    try {
        if (!checkUserPermission(req, 'view')) {
            return handleForbiddenError(res, 'You do not have permission to view branches');
        }

        const sequelize = (req as any).companyDB;
        const validation = validateWithZod<BranchQueryParams>(branchQuerySchema, req.query);

        if (!validation.success) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors: validation.errors });
        }

        const { search, sortBy = 'BranchId', sortOrder = 'DESC', page = 1, limit = 20 } = validation.data!;
        
        let whereStr = 'Del_Flag = 0';
        const replacements: any = {};
        
        const user = (req as any).user;
        if (user && user.currentCompanyId) {
            whereStr += ' AND Company_Id = :companyId';
            replacements.companyId = user.currentCompanyId;
        }

        if (search) {
            whereStr += ' AND (BranchCode LIKE :search OR BranchName LIKE :search)';
            replacements.search = `%${search}%`;
        }

        const offset = (page - 1) * limit;

        const countQuery = `SELECT COUNT(*) as total FROM tbl_Branch_Master WITH (NOLOCK) WHERE ${whereStr}`;
        const countResult = await sequelize.query(countQuery, { replacements, type: sequelize.QueryTypes?.SELECT || 'SELECT' }) as any[];
        const totalRecords = countResult[0]?.total || 0;

        const rawQuery = `
            SELECT * FROM tbl_Branch_Master WITH (NOLOCK)
            WHERE ${whereStr}
            ORDER BY ${sortBy} ${sortOrder}
            OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
        `;
        replacements.offset = offset;
        replacements.limit = limit;

        const rows = await sequelize.query(rawQuery, {
            replacements,
            type: sequelize.QueryTypes?.SELECT || 'SELECT'
        });

        // Add custom pagination structure manually or rely on sentData
        return res.status(200).json({ 
            success: true, 
            message: 'Branches retrieved successfully', 
            data: rows,
            pagination: {
                page,
                limit,
                total: totalRecords,
                totalPages: Math.ceil(totalRecords / limit)
            }
        });

    } catch (error: any) {
        console.error('Error fetching branches:', error);
        return servError(error, res, 'Internal server error');
    }
};

export const getBranchById = async (req: Request, res: Response) => {
    try {
        if (!checkUserPermission(req, 'view')) {
            return handleForbiddenError(res, 'You do not have permission to view branches');
        }

        const Branch = getBranchModel(req);
        const validation = validateWithZod<{ id: number }>(branchIdSchema, { id: parseInt(req.params.id) });
        
        if (!validation.success) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors: validation.errors });
        }

        const { id } = validation.data!;
        const branch = await Branch.findByPk(id);
        
        if (!branch || branch.Del_Flag === 1) {
            return notFound(res, 'Branch not found');
        }

        const user = (req as any).user;
        if (user && user.currentCompanyId && branch.Company_id !== user.currentCompanyId) {
            return handleForbiddenError(res, 'You do not have permission to access this branch');
        }

        return res.status(200).json({
            success: true,
            message: 'Branch retrieved successfully',
            data: branch
        });

    } catch (error: any) {
        console.error('Error fetching branch:', error);
        return servError(error, res, 'Internal server error');
    }
};

export const createBranch = async (req: Request, res: Response) => {
    const sequelize = (req as any).companyDB;
    const transaction = await sequelize.transaction();

    try {
        if (!checkUserPermission(req, 'create')) {
            await transaction.rollback();
            return handleForbiddenError(res, 'You do not have permission to create branches');
        }

        const validation = validateWithZod<BranchCreateInput>(branchCreateSchema, req.body);
        if (!validation.success) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: 'Validation failed', errors: validation.errors });
        }

        const data = validation.data!;
        const user = (req as any).user;
        
        if (user && user.currentCompanyId && !data.Company_id) {
            data.Company_id = user.currentCompanyId;
        }

        const Branch = getBranchModel(req);
        
        const newBranch = await Branch.create({
            ...data,
            Entry_Date: new Date(),
            Entry_By: user ? user.Global_User_ID : null
        }, { transaction });

        await transaction.commit();
        return created(res, newBranch, 'Branch created successfully');

    } catch (error: any) {
        await transaction.rollback().catch(() => {});
        console.error('Create Error:', error);
        return servError(error, res, 'Internal server error');
    }
};

export const updateBranch = async (req: Request, res: Response) => {
    const sequelize = (req as any).companyDB;
    const transaction = await sequelize.transaction();

    try {
        if (!checkUserPermission(req, 'update')) {
            await transaction.rollback();
            return handleForbiddenError(res, 'You do not have permission to update branches');
        }

        const idValidation = validateWithZod<{ id: number }>(branchIdSchema, { id: parseInt(req.params.id) });
        if (!idValidation.success) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: 'Invalid ID parameter' });
        }

        const { id } = idValidation.data!;
        const Branch = getBranchModel(req);
        
        const existing = await Branch.findByPk(id, { transaction });
        if (!existing || existing.Del_Flag === 1) {
            await transaction.rollback();
            return notFound(res, 'Branch not found');
        }

        const bodyValidation = validateWithZod<BranchUpdateInput>(branchUpdateSchema, req.body);
        if (!bodyValidation.success) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: 'Validation failed', errors: bodyValidation.errors });
        }

        const data = bodyValidation.data!;
        const user = (req as any).user;

        await existing.update({
            ...data,
            Modified_Date: new Date(),
            Modified_By: user ? user.Global_User_ID : null
        }, { transaction });

        await transaction.commit();
        return updated(res, existing, 'Branch updated successfully');

    } catch (error: any) {
        await transaction.rollback().catch(() => {});
        console.error('Update Error:', error);
        return servError(error, res, 'Internal server error');
    }
};

export const deleteBranch = async (req: Request, res: Response) => {
    const sequelize = (req as any).companyDB;
    const transaction = await sequelize.transaction();

    try {
        if (!checkUserPermission(req, 'delete')) {
            await transaction.rollback();
            return handleForbiddenError(res, 'You do not have permission to delete branches');
        }

        const idValidation = validateWithZod<{ id: number }>(branchIdSchema, { id: parseInt(req.params.id) });
        if (!idValidation.success) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: 'Invalid ID parameter' });
        }

        const { id } = idValidation.data!;
        const Branch = getBranchModel(req);
        
        const existing = await Branch.findByPk(id, { transaction });
        if (!existing || existing.Del_Flag === 1) {
            await transaction.rollback();
            return notFound(res, 'Branch not found');
        }

        const user = (req as any).user;
        await existing.update({
            Del_Flag: 1,
            Deleted_Date: new Date(),
            Deleted_By: user ? user.Global_User_ID : null
        }, { transaction });

        await transaction.commit();
        return deleted(res, 'Branch deleted successfully');

    } catch (error: any) {
        await transaction.rollback().catch(() => {});
        console.error('Delete Error:', error);
        return servError(error, res, 'Internal server error');
    }
};
