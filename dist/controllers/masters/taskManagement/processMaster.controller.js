"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProcessStatistics = exports.getAllProcessesSimple = exports.deleteProcessMaster = exports.updateProcessMaster = exports.createProcessMaster = exports.getProcessMasterById = exports.getAllProcessMaster = void 0;
const sequelize_1 = require("sequelize");
const zod_1 = require("zod");
const type_model_1 = require("../../../models/masters/process/type.model");
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
// Helper to get Process model with the correct database connection
const getProcessModel = (req) => {
    const sequelize = req.companyDB;
    if (!sequelize) {
        throw new Error('Database connection not available');
    }
    return (0, type_model_1.initProcessModel)(sequelize);
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
    if (requiredPermission === 'create_process' && ![1, 2].includes(user.UserTypeId)) {
        return false;
    }
    if (requiredPermission === 'update_process' && ![1, 2].includes(user.UserTypeId)) {
        return false;
    }
    if (requiredPermission === 'delete_process' && user.UserTypeId !== 1) {
        return false;
    }
    if (requiredPermission === 'view_process' && ![1, 2, 3].includes(user.UserTypeId)) {
        return false;
    }
    return true;
};
/**
 * Get all processes with pagination and filtering
 */
const getAllProcessMaster = async (req, res) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_process')) {
            return handleForbiddenError(res, 'You do not have permission to view processes');
        }
        // Get the Process model for this company's database
        const Process = getProcessModel(req);
        // Validate query parameters
        const validation = validateWithZod(type_model_1.processMasterQuerySchema, req.query);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }
        const { page = 1, limit = 20, search, sortBy = 'Id', sortOrder = 'ASC' } = validation.data;
        const pageNum = Math.max(1, page);
        const limitNum = Math.min(Math.max(1, limit), 100);
        const offset = (pageNum - 1) * limitNum;
        // Build where clause
        const whereClause = {};
        // Search functionality
        if (search && search.trim()) {
            whereClause.Process_Name = { [sequelize_1.Op.like]: `%${search}%` };
        }
        // Validate sort parameters
        const validSortFields = ['Id', 'Process_Name'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'Id';
        const sortDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        const { count, rows: processes } = await Process.findAndCountAll({
            where: whereClause,
            limit: limitNum,
            offset: offset,
            order: [[sortField, sortDirection]]
        });
        // Format processes
        const formattedProcesses = processes.map(process => (0, type_model_1.formatProcessForResponse)(process));
        return res.status(200).json({
            success: true,
            message: 'Processes retrieved successfully',
            data: formattedProcesses,
            metadata: {
                totalRecords: count,
                currentPage: pageNum,
                totalPages: Math.ceil(count / limitNum),
                pageSize: limitNum,
                hasNextPage: pageNum < Math.ceil(count / limitNum),
                hasPreviousPage: pageNum > 1
            }
        });
    }
    catch (error) {
        console.error('Error fetching processes:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};
exports.getAllProcessMaster = getAllProcessMaster;
/**
 * Get process by ID
 */
const getProcessMasterById = async (req, res) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_process')) {
            return handleForbiddenError(res, 'You do not have permission to view processes');
        }
        // Get the Process model for this company's database
        const Process = getProcessModel(req);
        // Validate ID parameter
        const validation = validateWithZod(type_model_1.processMasterIdSchema, { id: parseInt(req.params.id) });
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }
        const { id } = validation.data;
        const process = await Process.findByPk(id);
        if (!process) {
            return res.status(404).json({
                success: false,
                message: 'Process not found'
            });
        }
        // Format process
        const formattedProcess = (0, type_model_1.formatProcessForResponse)(process);
        return res.status(200).json({
            success: true,
            message: 'Process retrieved successfully',
            data: formattedProcess
        });
    }
    catch (error) {
        console.error('Error fetching process:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};
exports.getProcessMasterById = getProcessMasterById;
/**
 * Create new process
 */
const createProcessMaster = async (req, res) => {
    try {
        // Check authentication and permission
        if (!checkUserPermission(req, 'create_process')) {
            return handleForbiddenError(res, 'You do not have permission to create processes');
        }
        // Get the Process model for this company's database
        const Process = getProcessModel(req);
        // Validate request body
        const validation = validateWithZod(type_model_1.processMasterCreateSchema, req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }
        const processData = validation.data;
        // Check for duplicate process name
        const existingProcess = await Process.findOne({
            where: {
                Process_Name: processData.Process_Name.trim()
            }
        });
        if (existingProcess) {
            return res.status(409).json({
                success: false,
                message: 'Process with this name already exists'
            });
        }
        // Prepare process data
        const finalProcessData = {
            Process_Name: processData.Process_Name.trim()
        };
        const process = await Process.create(finalProcessData);
        // Format process
        const formattedProcess = (0, type_model_1.formatProcessForResponse)(process);
        return res.status(201).json({
            success: true,
            message: 'Process created successfully',
            data: formattedProcess
        });
    }
    catch (error) {
        console.error('Error creating process:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
exports.createProcessMaster = createProcessMaster;
/**
 * Update process
 */
const updateProcessMaster = async (req, res) => {
    try {
        // Check authentication and permission
        if (!checkUserPermission(req, 'update_process')) {
            return handleForbiddenError(res, 'You do not have permission to update processes');
        }
        // Get the Process model for this company's database
        const Process = getProcessModel(req);
        // Validate ID parameter
        const idValidation = validateWithZod(type_model_1.processMasterIdSchema, { id: parseInt(req.params.id) });
        if (!idValidation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: idValidation.errors
            });
        }
        const { id } = idValidation.data;
        // Validate request body
        const bodyValidation = validateWithZod(type_model_1.processMasterUpdateSchema, req.body);
        if (!bodyValidation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: bodyValidation.errors
            });
        }
        const updateData = bodyValidation.data;
        const process = await Process.findByPk(id);
        if (!process) {
            return res.status(404).json({
                success: false,
                message: 'Process not found'
            });
        }
        // Check for duplicate process name if Process_Name is being updated
        if (updateData.Process_Name && updateData.Process_Name !== process.Process_Name) {
            const existingProcess = await Process.findOne({
                where: {
                    Id: { [sequelize_1.Op.ne]: id },
                    Process_Name: updateData.Process_Name.trim()
                }
            });
            if (existingProcess) {
                return res.status(409).json({
                    success: false,
                    message: 'Another process with this name already exists'
                });
            }
        }
        // Prepare update data
        const finalUpdateData = {};
        if (updateData.Process_Name !== undefined)
            finalUpdateData.Process_Name = updateData.Process_Name.trim();
        await process.update(finalUpdateData);
        const updatedProcess = await Process.findByPk(id);
        if (!updatedProcess) {
            return res.status(404).json({
                success: false,
                message: 'Process not found after update'
            });
        }
        // Format process
        const formattedProcess = (0, type_model_1.formatProcessForResponse)(updatedProcess);
        return res.status(200).json({
            success: true,
            message: 'Process updated successfully',
            data: formattedProcess
        });
    }
    catch (error) {
        console.error('Error updating process:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
exports.updateProcessMaster = updateProcessMaster;
/**
 * Delete process (hard delete)
 */
const deleteProcessMaster = async (req, res) => {
    try {
        // Check authentication and permission
        if (!checkUserPermission(req, 'delete_process')) {
            return handleForbiddenError(res, 'You do not have permission to delete processes');
        }
        // Get the Process model for this company's database
        const Process = getProcessModel(req);
        // Validate ID parameter
        const validation = validateWithZod(type_model_1.processMasterIdSchema, { id: parseInt(req.params.id) });
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }
        const { id } = validation.data;
        const process = await Process.findByPk(id);
        if (!process) {
            return res.status(404).json({
                success: false,
                message: 'Process not found'
            });
        }
        // Hard delete (permanent removal)
        await process.destroy();
        return res.status(200).json({
            success: true,
            message: 'Process deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting process:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
exports.deleteProcessMaster = deleteProcessMaster;
/**
 * Get all processes without pagination (for dropdowns)
 */
const getAllProcessesSimple = async (req, res) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_process')) {
            return handleForbiddenError(res, 'You do not have permission to view processes');
        }
        // Get the Process model for this company's database
        const Process = getProcessModel(req);
        const processes = await Process.findAll({
            order: [['Process_Name', 'ASC']]
        });
        const formattedProcesses = processes.map(process => (0, type_model_1.formatProcessForResponse)(process));
        return res.status(200).json({
            success: true,
            message: 'Processes retrieved successfully',
            data: formattedProcesses
        });
    }
    catch (error) {
        console.error('Error fetching processes:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};
exports.getAllProcessesSimple = getAllProcessesSimple;
/**
 * Get process statistics
 */
const getProcessStatistics = async (req, res) => {
    try {
        // Check authentication
        if (!checkUserPermission(req, 'view_process')) {
            return handleForbiddenError(res, 'You do not have permission to view process statistics');
        }
        // Get the Process model for this company's database
        const Process = getProcessModel(req);
        const totalProcesses = await Process.count();
        return res.status(200).json({
            success: true,
            message: 'Process statistics retrieved successfully',
            data: {
                totalProcesses
            }
        });
    }
    catch (error) {
        console.error('Error fetching process statistics:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};
exports.getProcessStatistics = getProcessStatistics;
