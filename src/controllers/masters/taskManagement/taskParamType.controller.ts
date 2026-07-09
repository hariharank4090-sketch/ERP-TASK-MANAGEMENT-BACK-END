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
    ParametDataTypeCreationSchema,
    ParametDataTypeUpdateSchema,
    ParametDataTypeQuerySchema,
    parametDataTypeIdSchema,
    ParametDataTypeCreate,
    ParametDataTypeUpdate,
    ParametDataTypeQuery
} from '../../../models/masters/taskParamType/type.model';
import { initParametDataTypeModel } from '../../../models/masters/taskParamType/type.model';

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

// Helper to get ParametDataType model with the correct database connection
const getParametDataTypeModel = (req: Request) => {
    const sequelize = (req as any).companyDB;
    if (!sequelize) {
        throw new Error('Database connection not available');
    }
    return initParametDataTypeModel(sequelize);
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
    if (requiredPermission === 'create_parametdatatype' && ![1, 2].includes(user.UserTypeId)) {
        return false;
    }
    if (requiredPermission === 'update_parametdatatype' && ![1, 2].includes(user.UserTypeId)) {
        return false;
    }
    if (requiredPermission === 'delete_parametdatatype' && user.UserTypeId !== 1) {
        return false;
    }
    if (requiredPermission === 'view_parametdatatype' && ![1, 2, 3].includes(user.UserTypeId)) {
        return false;
    }
    
    return true;
};

/**
 * Get all parameter data types without pagination
 */
export const getAllParametDataTypes = async (req: Request, res: Response) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_parametdatatype')) {
            return handleForbiddenError(res, 'You do not have permission to view parameter data types');
        }
        
        // Get the ParametDataType model for this company's database
        const ParametDataType = getParametDataTypeModel(req);
        
        // Validate query parameters
        const validation = validateWithZod<ParametDataTypeQuery>(ParametDataTypeQuerySchema, req.query);
        
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const {
            Para_Data_Type,
            sortBy = 'Para_Data_Type_Id',
            sortOrder = 'ASC'
        } = validation.data!;

        // Build where clause
        const whereClause: any = {};
        
        if (Para_Data_Type) {
            whereClause.Para_Data_Type = { [Op.like]: `%${Para_Data_Type}%` };
        }

        // Validate sort parameters - ONLY allow valid fields for this table
        const validSortFields = ['Para_Data_Type_Id', 'Para_Data_Type', 'Para_Display_Name'];
        
        // Check if the requested sort field is valid
        if (sortBy && !validSortFields.includes(sortBy)) {
            return res.status(400).json({
                success: false,
                message: `Invalid sort field. Allowed fields are: ${validSortFields.join(', ')}`,
                errors: [{
                    field: 'sortBy',
                    message: `sortBy must be one of: ${validSortFields.join(', ')}`
                }]
            });
        }
        
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'Para_Data_Type_Id';
        const sortDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        const parametDataTypes = await ParametDataType.findAll({
            where: whereClause,
            order: [[sortField, sortDirection]],
            attributes: ['Para_Data_Type_Id', 'Para_Data_Type', 'Para_Display_Name'],
            raw: true
        });

        // Format response - ensure we always return an array
        const formattedParametDataTypes = Array.isArray(parametDataTypes) ? parametDataTypes.map(type => ({
            Para_Data_Type_Id: type.Para_Data_Type_Id,
            Para_Data_Type: type.Para_Data_Type,
            Para_Display_Name: type.Para_Display_Name
        })) : [];

        return res.status(200).json({
            success: true,
            message: 'Parameter data types retrieved successfully',
            data: formattedParametDataTypes,
            totalRecords: formattedParametDataTypes.length
        });

    } catch (error: any) {
        console.error('Error fetching parameter data types:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            
        });
    }
};

/**
 * Get parameter data type by ID
 */
export const getParametDataTypeById = async (req: Request, res: Response) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_parametdatatype')) {
            return handleForbiddenError(res, 'You do not have permission to view parameter data types');
        }
        
        // Get the ParametDataType model for this company's database
        const ParametDataType = getParametDataTypeModel(req);
        
        // Validate ID parameter
        const validation = validateWithZod<{ id: number }>(parametDataTypeIdSchema, { id: parseInt(req.params.id) });
        
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const { id } = validation.data!;

        const parametDataType = await ParametDataType.findByPk(id, {
            attributes: ['Para_Data_Type_Id', 'Para_Data_Type', 'Para_Display_Name'],
            raw: true
        });
        
        if (!parametDataType) {
            return notFound(res, 'Parameter data type not found');
        }

        const formattedParametDataType = {
            Para_Data_Type_Id: parametDataType.Para_Data_Type_Id,
            Para_Data_Type: parametDataType.Para_Data_Type,
            Para_Display_Name: parametDataType.Para_Display_Name
        };

        return res.status(200).json({
            success: true,
            message: 'Parameter data type retrieved successfully',
            data: formattedParametDataType
        });

    } catch (error: any) {
        console.error('Error fetching parameter data type:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            
        });
    }
};

/**
 * Get all active parameter data types
 */
export const getAllActiveParametDataTypes = async (req: Request, res: Response) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_parametdatatype')) {
            return handleForbiddenError(res, 'You do not have permission to view parameter data types');
        }
        
        // Get the ParametDataType model for this company's database
        const ParametDataType = getParametDataTypeModel(req);
        
        const parametDataTypes = await ParametDataType.findAll({
            order: [['Para_Data_Type', 'ASC']],
            attributes: ['Para_Data_Type_Id', 'Para_Data_Type', 'Para_Display_Name'],
            raw: true
        });

        const formattedParametDataTypes = Array.isArray(parametDataTypes) ? parametDataTypes.map(type => ({
            Para_Data_Type_Id: type.Para_Data_Type_Id,
            Para_Data_Type: type.Para_Data_Type,
            Para_Display_Name: type.Para_Display_Name
        })) : [];

        return res.status(200).json({
            success: true,
            message: 'Active parameter data types retrieved successfully',
            data: formattedParametDataTypes,
            totalRecords: formattedParametDataTypes.length
        });

    } catch (error: any) {
        console.error('Error fetching active parameter data types:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            
        });
    }
};

/**
 * Create new parameter data type
 */
export const createParametDataType = async (req: Request, res: Response) => {
    try {
        // Check authentication and permission
        if (!checkUserPermission(req, 'create_parametdatatype')) {
            return handleForbiddenError(res, 'You do not have permission to create parameter data types');
        }
        
        // Get the ParametDataType model for this company's database
        const ParametDataType = getParametDataTypeModel(req);
        
        // Validate request body
        const validation = validateWithZod<ParametDataTypeCreate>(ParametDataTypeCreationSchema, req.body);
        
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const parametDataTypeData = validation.data!;

        // Check for duplicate parameter data type
        const existingParametDataType = await ParametDataType.findOne({
            where: {
                Para_Data_Type: {
                    [Op.eq]: parametDataTypeData.Para_Data_Type.trim()
                }
            }
        });

        if (existingParametDataType) {
            return res.status(409).json({
                success: false,
                message: 'Parameter data type with this name already exists',
                field: 'Para_Data_Type'
            });
        }

        // Prepare parameter data type data
        const finalParametDataTypeData: any = {
            Para_Data_Type: parametDataTypeData.Para_Data_Type.trim(),
            Para_Display_Name: parametDataTypeData.Para_Display_Name || null
        };

        const parametDataType = await ParametDataType.create(finalParametDataTypeData);
        
        const formattedParametDataType = {
            Para_Data_Type_Id: parametDataType.Para_Data_Type_Id,
            Para_Data_Type: parametDataType.Para_Data_Type,
            Para_Display_Name: parametDataType.Para_Display_Name
        };
        
        return res.status(201).json({
            success: true,
            message: 'Parameter data type created successfully',
            data: formattedParametDataType
        });

    } catch (error: any) {
        console.error('Error creating parameter data type:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            
        });
    }
};

/**
 * Update parameter data type
 */
export const updateParametDataType = async (req: Request, res: Response) => {
    try {
        // Check authentication and permission
        if (!checkUserPermission(req, 'update_parametdatatype')) {
            return handleForbiddenError(res, 'You do not have permission to update parameter data types');
        }
        
        // Get the ParametDataType model for this company's database
        const ParametDataType = getParametDataTypeModel(req);
        
        // Validate ID parameter
        const idValidation = validateWithZod<{ id: number }>(parametDataTypeIdSchema, { id: parseInt(req.params.id) });
        
        if (!idValidation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: idValidation.errors
            });
        }

        const { id } = idValidation.data!;

        // Validate request body
        const bodyValidation = validateWithZod<ParametDataTypeUpdate>(ParametDataTypeUpdateSchema, req.body);
        
        if (!bodyValidation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: bodyValidation.errors
            });
        }

        const updateData = bodyValidation.data!;

        const parametDataType = await ParametDataType.findByPk(id);
        
        if (!parametDataType) {
            return notFound(res, 'Parameter data type not found');
        }

        // Check for duplicate parameter data type if Para_Data_Type is being updated
        if (updateData.Para_Data_Type && updateData.Para_Data_Type !== parametDataType.Para_Data_Type) {
            const existingParametDataType = await ParametDataType.findOne({
                where: {
                    Para_Data_Type_Id: { [Op.ne]: id },
                    Para_Data_Type: {
                        [Op.eq]: updateData.Para_Data_Type.trim()
                    }
                }
            });

            if (existingParametDataType) {
                return res.status(409).json({
                    success: false,
                    message: 'Another parameter data type with this name already exists',
                    field: 'Para_Data_Type'
                });
            }
        }

        // Prepare update data
        const finalUpdateData: any = {};
        if (updateData.Para_Data_Type !== undefined) finalUpdateData.Para_Data_Type = updateData.Para_Data_Type.trim();
        if (updateData.Para_Display_Name !== undefined) finalUpdateData.Para_Display_Name = updateData.Para_Display_Name;

        await parametDataType.update(finalUpdateData);
        
        const updatedParametDataType = await ParametDataType.findByPk(id, {
            attributes: ['Para_Data_Type_Id', 'Para_Data_Type', 'Para_Display_Name'],
            raw: true
        });
        
        if (!updatedParametDataType) {
            return notFound(res, 'Parameter data type not found after update');
        }

        const formattedParametDataType = {
            Para_Data_Type_Id: updatedParametDataType.Para_Data_Type_Id,
            Para_Data_Type: updatedParametDataType.Para_Data_Type,
            Para_Display_Name: updatedParametDataType.Para_Display_Name
        };
        
        return res.status(200).json({
            success: true,
            message: 'Parameter data type updated successfully',
            data: formattedParametDataType
        });

    } catch (error: any) {
        console.error('Error updating parameter data type:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            
        });
    }
};

/**
 * Delete parameter data type (hard delete)
 */
export const deleteParametDataType = async (req: Request, res: Response) => {
    try {
        // Check authentication and permission
        if (!checkUserPermission(req, 'delete_parametdatatype')) {
            return handleForbiddenError(res, 'You do not have permission to delete parameter data types');
        }
        
        // Get the ParametDataType model for this company's database
        const ParametDataType = getParametDataTypeModel(req);
        
        // Validate ID parameter
        const validation = validateWithZod<{ id: number }>(parametDataTypeIdSchema, { id: parseInt(req.params.id) });
        
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const { id } = validation.data!;

        const parametDataType = await ParametDataType.findByPk(id);
        
        if (!parametDataType) {
            return notFound(res, 'Parameter data type not found');
        }

        // Hard delete
        await parametDataType.destroy();
        
        return res.status(200).json({
            success: true,
            message: 'Parameter data type deleted successfully'
        });

    } catch (error: any) {
        console.error('Error deleting parameter data type:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            
        });
    }
};

/**
 * Get parameter data type statistics
 */
export const getParametDataTypeStatistics = async (req: Request, res: Response) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_parametdatatype')) {
            return handleForbiddenError(res, 'You do not have permission to view parameter data type statistics');
        }
        
        // Get the ParametDataType model for this company's database
        const ParametDataType = getParametDataTypeModel(req);
        
        const totalParametDataTypes = await ParametDataType.count();

        return res.status(200).json({
            success: true,
            message: 'Parameter data type statistics retrieved successfully',
            data: {
                totalParametDataTypes,
                totalRecords: totalParametDataTypes
            }
        });

    } catch (error: any) {
        console.error('Error fetching parameter data type statistics:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            
        });
    }
};

/**
 * Get parameter data types by search
 */
export const searchParametDataTypes = async (req: Request, res: Response) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_parametdatatype')) {
            return handleForbiddenError(res, 'You do not have permission to view parameter data types');
        }
        
        // Get the ParametDataType model for this company's database
        const ParametDataType = getParametDataTypeModel(req);
        
        const { search } = req.query;

        const whereClause: any = {};

        if (search && typeof search === 'string') {
            whereClause[Op.or] = [
                { Para_Data_Type: { [Op.like]: `%${search}%` } },
                { Para_Display_Name: { [Op.like]: `%${search}%` } }
            ];
        }

        const parametDataTypes = await ParametDataType.findAll({
            where: whereClause,
            order: [['Para_Data_Type', 'ASC']],
            attributes: ['Para_Data_Type_Id', 'Para_Data_Type', 'Para_Display_Name'],
            raw: true
        });

        const formattedParametDataTypes = Array.isArray(parametDataTypes) ? parametDataTypes.map(type => ({
            Para_Data_Type_Id: type.Para_Data_Type_Id,
            Para_Data_Type: type.Para_Data_Type,
            Para_Display_Name: type.Para_Display_Name
        })) : [];

        return res.status(200).json({
            success: true,
            message: 'Parameter data types retrieved successfully',
            data: formattedParametDataTypes,
            totalRecords: formattedParametDataTypes.length
        });

    } catch (error: any) {
        console.error('Error searching parameter data types:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            
        });
    }
};