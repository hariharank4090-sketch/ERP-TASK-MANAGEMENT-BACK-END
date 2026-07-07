"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchParametDataTypes = exports.getParametDataTypeStatistics = exports.deleteParametDataType = exports.updateParametDataType = exports.createParametDataType = exports.getAllActiveParametDataTypes = exports.getParametDataTypeById = exports.getAllParametDataTypes = void 0;
const sequelize_1 = require("sequelize");
const zod_1 = require("zod");
const responseObject_1 = require("../../../responseObject");
const type_model_1 = require("../../../models/masters/taskParamType/type.model");
const type_model_2 = require("../../../models/masters/taskParamType/type.model");
const validateWithZod = (schema, data) => {
    try {
        const validatedData = schema.parse(data);
        return { success: true, data: validatedData };
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            const zodIssues = error.issues || error.errors || [];
            return {
                success: false,
                errors: zodIssues.map((err) => ({
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
const getParametDataTypeModel = (req) => {
    const sequelize = req.companyDB;
    if (!sequelize) {
        throw new Error('Database connection not available');
    }
    return (0, type_model_2.initParametDataTypeModel)(sequelize);
};
// Enhanced error handler for 403 Forbidden
const handleForbiddenError = (res, customMessage) => {
    return res.status(403).json({
        success: false,
        message: customMessage || 'Access denied. You do not have permission to perform this action.',
        error: 'FORBIDDEN'
    });
};
// Check user permissions
const checkUserPermission = (req, requiredPermission) => {
    const user = req.user;
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
const getAllParametDataTypes = async (req, res) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_parametdatatype')) {
            return handleForbiddenError(res, 'You do not have permission to view parameter data types');
        }
        // Get the ParametDataType model for this company's database
        const ParametDataType = getParametDataTypeModel(req);
        // Validate query parameters
        const validation = validateWithZod(type_model_1.ParametDataTypeQuerySchema, req.query);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }
        const { Para_Data_Type, sortBy = 'Para_Data_Type_Id', sortOrder = 'ASC' } = validation.data;
        // Build where clause
        const whereClause = {};
        if (Para_Data_Type) {
            whereClause.Para_Data_Type = { [sequelize_1.Op.like]: `%${Para_Data_Type}%` };
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
    }
    catch (error) {
        console.error('Error fetching parameter data types:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
exports.getAllParametDataTypes = getAllParametDataTypes;
/**
 * Get parameter data type by ID
 */
const getParametDataTypeById = async (req, res) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_parametdatatype')) {
            return handleForbiddenError(res, 'You do not have permission to view parameter data types');
        }
        // Get the ParametDataType model for this company's database
        const ParametDataType = getParametDataTypeModel(req);
        // Validate ID parameter
        const validation = validateWithZod(type_model_1.parametDataTypeIdSchema, { id: parseInt(req.params.id) });
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }
        const { id } = validation.data;
        const parametDataType = await ParametDataType.findByPk(id, {
            attributes: ['Para_Data_Type_Id', 'Para_Data_Type', 'Para_Display_Name'],
            raw: true
        });
        if (!parametDataType) {
            return (0, responseObject_1.notFound)(res, 'Parameter data type not found');
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
    }
    catch (error) {
        console.error('Error fetching parameter data type:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
exports.getParametDataTypeById = getParametDataTypeById;
/**
 * Get all active parameter data types
 */
const getAllActiveParametDataTypes = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error fetching active parameter data types:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
exports.getAllActiveParametDataTypes = getAllActiveParametDataTypes;
/**
 * Create new parameter data type
 */
const createParametDataType = async (req, res) => {
    try {
        // Check authentication and permission
        if (!checkUserPermission(req, 'create_parametdatatype')) {
            return handleForbiddenError(res, 'You do not have permission to create parameter data types');
        }
        // Get the ParametDataType model for this company's database
        const ParametDataType = getParametDataTypeModel(req);
        // Validate request body
        const validation = validateWithZod(type_model_1.ParametDataTypeCreationSchema, req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }
        const parametDataTypeData = validation.data;
        // Check for duplicate parameter data type
        const existingParametDataType = await ParametDataType.findOne({
            where: {
                Para_Data_Type: {
                    [sequelize_1.Op.eq]: parametDataTypeData.Para_Data_Type.trim()
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
        const finalParametDataTypeData = {
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
    }
    catch (error) {
        console.error('Error creating parameter data type:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
exports.createParametDataType = createParametDataType;
/**
 * Update parameter data type
 */
const updateParametDataType = async (req, res) => {
    try {
        // Check authentication and permission
        if (!checkUserPermission(req, 'update_parametdatatype')) {
            return handleForbiddenError(res, 'You do not have permission to update parameter data types');
        }
        // Get the ParametDataType model for this company's database
        const ParametDataType = getParametDataTypeModel(req);
        // Validate ID parameter
        const idValidation = validateWithZod(type_model_1.parametDataTypeIdSchema, { id: parseInt(req.params.id) });
        if (!idValidation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: idValidation.errors
            });
        }
        const { id } = idValidation.data;
        // Validate request body
        const bodyValidation = validateWithZod(type_model_1.ParametDataTypeUpdateSchema, req.body);
        if (!bodyValidation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: bodyValidation.errors
            });
        }
        const updateData = bodyValidation.data;
        const parametDataType = await ParametDataType.findByPk(id);
        if (!parametDataType) {
            return (0, responseObject_1.notFound)(res, 'Parameter data type not found');
        }
        // Check for duplicate parameter data type if Para_Data_Type is being updated
        if (updateData.Para_Data_Type && updateData.Para_Data_Type !== parametDataType.Para_Data_Type) {
            const existingParametDataType = await ParametDataType.findOne({
                where: {
                    Para_Data_Type_Id: { [sequelize_1.Op.ne]: id },
                    Para_Data_Type: {
                        [sequelize_1.Op.eq]: updateData.Para_Data_Type.trim()
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
        const finalUpdateData = {};
        if (updateData.Para_Data_Type !== undefined)
            finalUpdateData.Para_Data_Type = updateData.Para_Data_Type.trim();
        if (updateData.Para_Display_Name !== undefined)
            finalUpdateData.Para_Display_Name = updateData.Para_Display_Name;
        await parametDataType.update(finalUpdateData);
        const updatedParametDataType = await ParametDataType.findByPk(id, {
            attributes: ['Para_Data_Type_Id', 'Para_Data_Type', 'Para_Display_Name'],
            raw: true
        });
        if (!updatedParametDataType) {
            return (0, responseObject_1.notFound)(res, 'Parameter data type not found after update');
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
    }
    catch (error) {
        console.error('Error updating parameter data type:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
exports.updateParametDataType = updateParametDataType;
/**
 * Delete parameter data type (hard delete)
 */
const deleteParametDataType = async (req, res) => {
    try {
        // Check authentication and permission
        if (!checkUserPermission(req, 'delete_parametdatatype')) {
            return handleForbiddenError(res, 'You do not have permission to delete parameter data types');
        }
        // Get the ParametDataType model for this company's database
        const ParametDataType = getParametDataTypeModel(req);
        // Validate ID parameter
        const validation = validateWithZod(type_model_1.parametDataTypeIdSchema, { id: parseInt(req.params.id) });
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }
        const { id } = validation.data;
        const parametDataType = await ParametDataType.findByPk(id);
        if (!parametDataType) {
            return (0, responseObject_1.notFound)(res, 'Parameter data type not found');
        }
        // Hard delete
        await parametDataType.destroy();
        return res.status(200).json({
            success: true,
            message: 'Parameter data type deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting parameter data type:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
exports.deleteParametDataType = deleteParametDataType;
/**
 * Get parameter data type statistics
 */
const getParametDataTypeStatistics = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error fetching parameter data type statistics:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
exports.getParametDataTypeStatistics = getParametDataTypeStatistics;
/**
 * Get parameter data types by search
 */
const searchParametDataTypes = async (req, res) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_parametdatatype')) {
            return handleForbiddenError(res, 'You do not have permission to view parameter data types');
        }
        // Get the ParametDataType model for this company's database
        const ParametDataType = getParametDataTypeModel(req);
        const { search } = req.query;
        const whereClause = {};
        if (search && typeof search === 'string') {
            whereClause[sequelize_1.Op.or] = [
                { Para_Data_Type: { [sequelize_1.Op.like]: `%${search}%` } },
                { Para_Display_Name: { [sequelize_1.Op.like]: `%${search}%` } }
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
    }
    catch (error) {
        console.error('Error searching parameter data types:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
exports.searchParametDataTypes = searchParametDataTypes;
