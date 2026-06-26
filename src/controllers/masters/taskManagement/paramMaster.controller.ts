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
    ParamMasterCreationSchema,
    ParamMasterUpdateSchema,
    ParamMasterQuerySchema,
    paramMasterIdSchema,
    ParamMasterCreate,
    ParamMasterUpdate,
    ParamMasterQuery
} from '../../../models/masters/parametMaster/type.model';
import { initParamMasterModel } from '../../../models/masters/parametMaster/type.model';

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

// Helper to get ParamMaster model with the correct database connection
const getParamMasterModel = (req: Request) => {
    const sequelize = (req as any).companyDB;
    if (!sequelize) {
        throw new Error('Database connection not available');
    }
    return initParamMasterModel(sequelize);
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
    if (requiredPermission === 'create_parammaster' && ![1, 2].includes(user.UserTypeId)) {
        return false;
    }
    if (requiredPermission === 'update_parammaster' && ![1, 2].includes(user.UserTypeId)) {
        return false;
    }
    if (requiredPermission === 'delete_parammaster' && user.UserTypeId !== 1) {
        return false;
    }
    if (requiredPermission === 'view_parammaster' && ![1, 2, 3].includes(user.UserTypeId)) {
        return false;
    }
    
    return true;
};

/**
 * Get all parameter masters without pagination
 */
export const getAllParamMasters = async (req: Request, res: Response) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_parammaster')) {
            return handleForbiddenError(res, 'You do not have permission to view parameter masters');
        }
        
        // Get the ParamMaster model for this company's database
        const ParamMaster = getParamMasterModel(req);
        
        // Validate query parameters
        const validation = validateWithZod<ParamMasterQuery>(ParamMasterQuerySchema, req.query);
        
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const {
            search,
            companyId,
            sortBy = 'Paramet_Id',
            sortOrder = 'ASC'
        } = validation.data!;

        // Build where clause
        const whereClause: any = {
            Del_Flag: 0
        };
        
        if (companyId !== undefined && companyId !== null) {
            whereClause.Company_id = companyId;
        }
        
        // Search functionality
        if (search) {
            whereClause.Paramet_Name = { [Op.like]: `%${search}%` };
        }

        // Validate sort parameters
        const validSortFields = ['Paramet_Id', 'Paramet_Name', 'Paramet_Data_Type', 'Company_id'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'Paramet_Id';
        const sortDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        const paramMasters = await ParamMaster.findAll({
            where: whereClause,
            order: [[sortField, sortDirection]],
            attributes: ['Paramet_Id', 'Paramet_Name', 'Paramet_Data_Type', 'Company_id', 'Del_Flag']
        });

        // Format response
        const formattedParamMasters = paramMasters.map(param => ({
            Paramet_Id: param.Paramet_Id,
            Paramet_Name: param.Paramet_Name,
            Paramet_Data_Type: param.Paramet_Data_Type,
            Company_id: param.Company_id,
            Del_Flag: param.Del_Flag,
            Del_Flag_Text: param.Del_Flag === 0 ? 'Active' : 'Deleted'
        }));

        return res.status(200).json({
            success: true,
            message: 'Parameter masters retrieved successfully',
            data: formattedParamMasters,
            totalRecords: formattedParamMasters.length
        });

    } catch (error: any) {
        console.error('Error fetching parameter masters:', error);
        return servError(error, res);
    }
};

/**
 * Get parameter master by ID
 */
export const getParamMasterById = async (req: Request, res: Response) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_parammaster')) {
            return handleForbiddenError(res, 'You do not have permission to view parameter masters');
        }
        
        // Get the ParamMaster model for this company's database
        const ParamMaster = getParamMasterModel(req);
        
        // Validate ID parameter
        const validation = validateWithZod<{ id: number }>(paramMasterIdSchema, { id: parseInt(req.params.id) });
        
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const { id } = validation.data!;

        const paramMaster = await ParamMaster.findOne({
            where: {
                Paramet_Id: id,
                Del_Flag: 0
            }
        });
        
        if (!paramMaster) {
            return notFound(res, 'Parameter master not found');
        }

        const formattedParamMaster = {
            Paramet_Id: paramMaster.Paramet_Id,
            Paramet_Name: paramMaster.Paramet_Name,
            Paramet_Data_Type: paramMaster.Paramet_Data_Type,
            Company_id: paramMaster.Company_id,
            Del_Flag: paramMaster.Del_Flag,
            Del_Flag_Text: paramMaster.Del_Flag === 0 ? 'Active' : 'Deleted'
        };

        return res.status(200).json({
            success: true,
            message: 'Parameter master retrieved successfully',
            data: formattedParamMaster
        });

    } catch (error: any) {
        console.error('Error fetching parameter master:', error);
        return servError(error, res);
    }
};

/**
 * Get parameter masters by company ID
 */
export const getParamMastersByCompanyId = async (req: Request, res: Response) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_parammaster')) {
            return handleForbiddenError(res, 'You do not have permission to view parameter masters');
        }
        
        // Get the ParamMaster model for this company's database
        const ParamMaster = getParamMasterModel(req);
        
        const { companyId } = req.params;
        
        if (!companyId || isNaN(parseInt(companyId))) {
            return res.status(400).json({
                success: false,
                message: 'Valid company ID is required'
            });
        }

        const paramMasters = await ParamMaster.findAll({
            where: { 
                Company_id: parseInt(companyId),
                Del_Flag: 0
            },
            order: [['Paramet_Name', 'ASC']],
            attributes: ['Paramet_Id', 'Paramet_Name', 'Paramet_Data_Type', 'Company_id', 'Del_Flag']
        });

        const formattedParamMasters = paramMasters.map(param => ({
            Paramet_Id: param.Paramet_Id,
            Paramet_Name: param.Paramet_Name,
            Paramet_Data_Type: param.Paramet_Data_Type,
            Company_id: param.Company_id,
            Del_Flag: param.Del_Flag,
            Del_Flag_Text: param.Del_Flag === 0 ? 'Active' : 'Deleted'
        }));

        return res.status(200).json({
            success: true,
            message: 'Parameter masters retrieved successfully',
            data: formattedParamMasters,
            totalRecords: formattedParamMasters.length
        });

    } catch (error: any) {
        console.error('Error fetching parameter masters by company:', error);
        return servError(error, res);
    }
};

/**
 * Get active parameter masters
 */
export const getAllActiveParamMasters = async (req: Request, res: Response) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_parammaster')) {
            return handleForbiddenError(res, 'You do not have permission to view parameter masters');
        }
        
        // Get the ParamMaster model for this company's database
        const ParamMaster = getParamMasterModel(req);
        
        const { companyId } = req.query;

        const whereClause: any = {
            Del_Flag: 0
        };

        if (companyId && !isNaN(Number(companyId))) {
            whereClause.Company_id = Number(companyId);
        }

        const paramMasters = await ParamMaster.findAll({
            where: whereClause,
            order: [['Paramet_Name', 'ASC']],
            attributes: ['Paramet_Id', 'Paramet_Name', 'Paramet_Data_Type', 'Company_id', 'Del_Flag']
        });

        const formattedParamMasters = paramMasters.map(param => ({
            Paramet_Id: param.Paramet_Id,
            Paramet_Name: param.Paramet_Name,
            Paramet_Data_Type: param.Paramet_Data_Type,
            Company_id: param.Company_id,
            Del_Flag: param.Del_Flag,
            Del_Flag_Text: param.Del_Flag === 0 ? 'Active' : 'Deleted'
        }));

        return res.status(200).json({
            success: true,
            message: 'Active parameter masters retrieved successfully',
            data: formattedParamMasters,
            totalRecords: formattedParamMasters.length
        });

    } catch (error: any) {
        console.error('Error fetching active parameter masters:', error);
        return servError(error, res);
    }
};

/**
 * Create new parameter master
 */
export const createParamMaster = async (req: Request, res: Response) => {
    try {
        // Check authentication and permission
        if (!checkUserPermission(req, 'create_parammaster')) {
            return handleForbiddenError(res, 'You do not have permission to create parameter masters');
        }
        
        // Get the ParamMaster model for this company's database
        const ParamMaster = getParamMasterModel(req);
        
        // Validate request body
        const validation = validateWithZod<ParamMasterCreate>(ParamMasterCreationSchema, req.body);
        
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const paramMasterData = validation.data!;

        // Check for duplicate parameter name
        const existingParamMaster = await ParamMaster.findOne({
            where: {
                Paramet_Name: paramMasterData.Paramet_Name.trim(),
                Del_Flag: 0
            }
        });

        if (existingParamMaster) {
            return res.status(409).json({
                success: false,
                message: 'Parameter master with this name already exists'
            });
        }

        // Prepare parameter master data
        const finalParamMasterData: any = {
            Paramet_Name: paramMasterData.Paramet_Name.trim(),
            Paramet_Data_Type: paramMasterData.Paramet_Data_Type || null,
            Company_id: paramMasterData.Company_id || null,
            Del_Flag: 0
        };

        const paramMaster = await ParamMaster.create(finalParamMasterData);
        
        const formattedParamMaster = {
            Paramet_Id: paramMaster.Paramet_Id,
            Paramet_Name: paramMaster.Paramet_Name,
            Paramet_Data_Type: paramMaster.Paramet_Data_Type,
            Company_id: paramMaster.Company_id,
            Del_Flag: paramMaster.Del_Flag,
            Del_Flag_Text: paramMaster.Del_Flag === 0 ? 'Active' : 'Deleted'
        };
        
        return created(res, {
            success: true,
            message: 'Parameter master created successfully',
            data: formattedParamMaster
        });

    } catch (error: any) {
        console.error('Error creating parameter master:', error);
        return servError(error, res);
    }
};

/**
 * Update parameter master
 */
export const updateParamMaster = async (req: Request, res: Response) => {
    try {
        // Check authentication and permission
        if (!checkUserPermission(req, 'update_parammaster')) {
            return handleForbiddenError(res, 'You do not have permission to update parameter masters');
        }
        
        // Get the ParamMaster model for this company's database
        const ParamMaster = getParamMasterModel(req);
        
        // Validate ID parameter
        const idValidation = validateWithZod<{ id: number }>(paramMasterIdSchema, { id: parseInt(req.params.id) });
        
        if (!idValidation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: idValidation.errors
            });
        }

        const { id } = idValidation.data!;

        // Validate request body
        const bodyValidation = validateWithZod<ParamMasterUpdate>(ParamMasterUpdateSchema, req.body);
        
        if (!bodyValidation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: bodyValidation.errors
            });
        }

        const updateData = bodyValidation.data!;

        const paramMaster = await ParamMaster.findOne({
            where: {
                Paramet_Id: id,
                Del_Flag: 0
            }
        });
        
        if (!paramMaster) {
            return notFound(res, 'Parameter master not found');
        }

        // Check for duplicate parameter name if Paramet_Name is being updated
        if (updateData.Paramet_Name && updateData.Paramet_Name !== paramMaster.Paramet_Name) {
            const existingParamMaster = await ParamMaster.findOne({
                where: {
                    Paramet_Id: { [Op.ne]: id },
                    Paramet_Name: updateData.Paramet_Name.trim(),
                    Del_Flag: 0
                }
            });

            if (existingParamMaster) {
                return res.status(409).json({
                    success: false,
                    message: 'Another parameter master with this name already exists'
                });
            }
        }

        // Prepare update data
        const finalUpdateData: any = {};
        if (updateData.Paramet_Name !== undefined) finalUpdateData.Paramet_Name = updateData.Paramet_Name.trim();
        if (updateData.Paramet_Data_Type !== undefined) finalUpdateData.Paramet_Data_Type = updateData.Paramet_Data_Type;
        if (updateData.Company_id !== undefined) finalUpdateData.Company_id = updateData.Company_id;
        if (updateData.Del_Flag !== undefined) finalUpdateData.Del_Flag = updateData.Del_Flag;

        await paramMaster.update(finalUpdateData);
        
        const updatedParamMaster = await ParamMaster.findOne({
            where: {
                Paramet_Id: id,
                Del_Flag: 0
            }
        });
        
        if (!updatedParamMaster) {
            return notFound(res, 'Parameter master not found after update');
        }

        const formattedParamMaster = {
            Paramet_Id: updatedParamMaster.Paramet_Id,
            Paramet_Name: updatedParamMaster.Paramet_Name,
            Paramet_Data_Type: updatedParamMaster.Paramet_Data_Type,
            Company_id: updatedParamMaster.Company_id,
            Del_Flag: updatedParamMaster.Del_Flag,
            Del_Flag_Text: updatedParamMaster.Del_Flag === 0 ? 'Active' : 'Deleted'
        };
        
        return updated(res, {
            success: true,
            message: 'Parameter master updated successfully',
            data: formattedParamMaster
        });

    } catch (error: any) {
        console.error('Error updating parameter master:', error);
        return servError(error, res);
    }
};

/**
 * Delete parameter master (soft delete)
 */
export const deleteParamMaster = async (req: Request, res: Response) => {
    try {
        // Check authentication and permission
        if (!checkUserPermission(req, 'delete_parammaster')) {
            return handleForbiddenError(res, 'You do not have permission to delete parameter masters');
        }
        
        // Get the ParamMaster model for this company's database
        const ParamMaster = getParamMasterModel(req);
        
        // Validate ID parameter
        const validation = validateWithZod<{ id: number }>(paramMasterIdSchema, { id: parseInt(req.params.id) });
        
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const { id } = validation.data!;

        const paramMaster = await ParamMaster.findOne({
            where: {
                Paramet_Id: id,
                Del_Flag: 0
            }
        });
        
        if (!paramMaster) {
            return notFound(res, 'Parameter master not found');
        }

        // Soft delete: Set Del_Flag to 1
        await paramMaster.update({
            Del_Flag: 1
        });
        
        return res.status(200).json({
            success: true,
            message: 'Parameter master deactivated successfully'
        });

    } catch (error: any) {
        console.error('Error deleting parameter master:', error);
        return servError(error, res);
    }
};

/**
 * Restore parameter master (undo soft delete)
 */
export const restoreParamMaster = async (req: Request, res: Response) => {
    try {
        // Check authentication and permission
        if (!checkUserPermission(req, 'update_parammaster')) {
            return handleForbiddenError(res, 'You do not have permission to restore parameter masters');
        }
        
        // Get the ParamMaster model for this company's database
        const ParamMaster = getParamMasterModel(req);
        
        // Validate ID parameter
        const validation = validateWithZod<{ id: number }>(paramMasterIdSchema, { id: parseInt(req.params.id) });
        
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const { id } = validation.data!;

        const paramMaster = await ParamMaster.findByPk(id);
        
        if (!paramMaster) {
            return notFound(res, 'Parameter master not found');
        }

        // Restore: Set Del_Flag to 0
        await paramMaster.update({
            Del_Flag: 0
        });

        const restoredParamMaster = await ParamMaster.findOne({
            where: {
                Paramet_Id: id,
                Del_Flag: 0
            }
        });
        
        if (!restoredParamMaster) {
            return notFound(res, 'Parameter master not found after restore');
        }

        const formattedParamMaster = {
            Paramet_Id: restoredParamMaster.Paramet_Id,
            Paramet_Name: restoredParamMaster.Paramet_Name,
            Paramet_Data_Type: restoredParamMaster.Paramet_Data_Type,
            Company_id: restoredParamMaster.Company_id,
            Del_Flag: restoredParamMaster.Del_Flag,
            Del_Flag_Text: restoredParamMaster.Del_Flag === 0 ? 'Active' : 'Deleted'
        };

        return updated(res, {
            success: true,
            message: 'Parameter master restored successfully',
            data: formattedParamMaster
        });

    } catch (error: any) {
        console.error('Error restoring parameter master:', error);
        return servError(error, res);
    }
};

/**
 * Hard delete parameter master (permanent delete)
 */
export const hardDeleteParamMaster = async (req: Request, res: Response) => {
    try {
        // Check authentication and permission (admin only)
        if (!checkUserPermission(req, 'admin_delete_parammaster')) {
            return handleForbiddenError(res, 'You do not have permission to permanently delete parameter masters');
        }
        
        // Get the ParamMaster model for this company's database
        const ParamMaster = getParamMasterModel(req);
        
        // Validate ID parameter
        const validation = validateWithZod<{ id: number }>(paramMasterIdSchema, { id: parseInt(req.params.id) });
        
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const { id } = validation.data!;

        const paramMaster = await ParamMaster.findByPk(id);
        
        if (!paramMaster) {
            return notFound(res, 'Parameter master not found');
        }

        await paramMaster.destroy();
        
        return res.status(200).json({
            success: true,
            message: 'Parameter master permanently deleted successfully'
        });

    } catch (error: any) {
        console.error('Error hard deleting parameter master:', error);
        return servError(error, res);
    }
};

/**
 * Get parameter master statistics
 */
export const getParamMasterStatistics = async (req: Request, res: Response) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_parammaster')) {
            return handleForbiddenError(res, 'You do not have permission to view parameter master statistics');
        }
        
        // Get the ParamMaster model for this company's database
        const ParamMaster = getParamMasterModel(req);
        
        const totalParamMasters = await ParamMaster.count();
        const activeParamMasters = await ParamMaster.count({ where: { Del_Flag: 0 } });
        const deletedParamMasters = await ParamMaster.count({ where: { Del_Flag: 1 } });

        return res.status(200).json({
            success: true,
            message: 'Parameter master statistics retrieved successfully',
            data: {
                totalParamMasters,
                activeParamMasters: {
                    count: activeParamMasters,
                    text: 'Active'
                },
                deletedParamMasters: {
                    count: deletedParamMasters,
                    text: 'Deleted'
                }
            }
        });

    } catch (error: any) {
        console.error('Error fetching parameter master statistics:', error);
        return servError(error, res);
    }
};