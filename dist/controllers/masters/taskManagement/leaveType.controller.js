"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeaveTypeDropdown = exports.deleteLeaveType = exports.updateLeaveType = exports.createLeaveType = exports.getLeaveTypeById = exports.getAllLeaveTypes = void 0;
const sequelize_1 = require("sequelize");
const zod_1 = require("zod");
const sequelize_2 = require("sequelize");
const leaveType_model_1 = require("../../../models/masters/Leave type/leaveType.model");
// Define the LeaveType class that extends Model
class LeaveType extends sequelize_2.Model {
    static async getNextId(sequelize) {
        try {
            const result = await sequelize.query('SELECT ISNULL(MAX(Id), 0) + 1 as nextId FROM tbl_LeaveType', {
                type: 'SELECT',
                raw: true
            });
            return result[0]?.nextId || 1;
        }
        catch (error) {
            console.error('Error getting next ID:', error);
            throw error;
        }
    }
}
// Function to initialize the model with a specific sequelize instance
function initializeLeaveTypeModel(sequelize) {
    LeaveType.init({
        Id: {
            type: sequelize_2.DataTypes.BIGINT,
            primaryKey: true,
            field: 'Id',
            allowNull: false,
        },
        LeaveType: {
            type: sequelize_2.DataTypes.STRING(100),
            allowNull: false,
            field: 'LeaveType',
            validate: {
                notEmpty: true
            }
        }
    }, {
        sequelize,
        tableName: 'tbl_LeaveType',
        modelName: 'LeaveType',
        timestamps: false,
        freezeTableName: true,
        hooks: {
            beforeCreate: async (leaveType) => {
                if (!leaveType.Id) {
                    const nextId = await LeaveType.getNextId(sequelize);
                    leaveType.Id = nextId;
                }
            }
        }
    });
    return LeaveType;
}
/* ================= ZOD VALIDATION HELPER ================= */
const validateWithZod = (schema, data) => {
    try {
        return { success: true, data: schema.parse(data) };
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            return {
                success: false,
                errors: err.issues.map(e => ({
                    field: e.path.join('.') || 'unknown',
                    message: e.message
                }))
            };
        }
        return { success: false };
    }
};
/* ================= HELPER: Get Sequelize Instance from Request ================= */
const getSequelizeFromRequest = (req) => {
    // Use companyDB from middleware
    if (req.companyDB) {
        console.log(`✅ Using companyDB from request: ${req.companyDB.config?.database || 'unknown'}`);
        return req.companyDB;
    }
    // Fallback to default connection
    console.log(`⚠️ No companyDB in request, using default connection`);
    const { getDefaultConnection } = require('../../../config/sequalizer');
    return getDefaultConnection();
};
/* ================= GET ALL ================= */
const getAllLeaveTypes = async (req, res) => {
    try {
        const sequelizeInstance = getSequelizeFromRequest(req);
        const LeaveTypeModel = initializeLeaveTypeModel(sequelizeInstance);
        const validation = validateWithZod(leaveType_model_1.leaveTypeQuerySchema, req.query);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }
        const { page = 1, limit = 20, search, sortBy = 'Id', sortOrder = 'ASC' } = validation.data;
        const where = {};
        if (search && search.trim()) {
            where.LeaveType = {
                [sequelize_1.Op.like]: `%${search}%`
            };
        }
        const offset = (page - 1) * limit;
        const { rows, count } = await LeaveTypeModel.findAndCountAll({
            where,
            limit,
            offset,
            order: [[sortBy, sortOrder]]
        });
        const totalPages = Math.ceil(count / limit);
        return res.status(200).json({
            success: true,
            message: 'Leave types retrieved successfully',
            data: rows,
            pagination: {
                totalRecords: count,
                currentPage: page,
                totalPages,
                pageSize: limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        });
    }
    catch (e) {
        console.error('Get All Error:', e);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
};
exports.getAllLeaveTypes = getAllLeaveTypes;
/* ================= GET BY ID ================= */
const getLeaveTypeById = async (req, res) => {
    try {
        const sequelizeInstance = getSequelizeFromRequest(req);
        const LeaveTypeModel = initializeLeaveTypeModel(sequelizeInstance);
        const validation = validateWithZod(leaveType_model_1.leaveTypeIdSchema, req.params);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID parameter'
            });
        }
        const leaveType = await LeaveTypeModel.findByPk(validation.data.id);
        if (!leaveType) {
            return res.status(404).json({
                success: false,
                message: 'Leave type not found'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Leave type retrieved successfully',
            data: leaveType
        });
    }
    catch (e) {
        console.error('Get By ID Error:', e);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
};
exports.getLeaveTypeById = getLeaveTypeById;
/* ================= CREATE ================= */
const createLeaveType = async (req, res) => {
    try {
        const sequelizeInstance = getSequelizeFromRequest(req);
        const LeaveTypeModel = initializeLeaveTypeModel(sequelizeInstance);
        console.log('Request Body:', req.body);
        console.log(`📊 Using database: ${sequelizeInstance.config?.database || 'unknown'}`);
        console.log(`📊 Company ID: ${req.currentCompanyId}, DB Name: ${req.currentDBName}`);
        const validation = validateWithZod(leaveType_model_1.leaveTypeCreateSchema, req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }
        const { LeaveType: leaveTypeName } = validation.data;
        // Check for duplicate leave type name
        const exists = await LeaveTypeModel.findOne({
            where: {
                LeaveType: leaveTypeName
            }
        });
        if (exists) {
            return res.status(409).json({
                success: false,
                message: 'Leave type already exists'
            });
        }
        // Get next ID
        const nextId = await LeaveTypeModel.getNextId(sequelizeInstance);
        console.log(`📝 Next available ID: ${nextId}`);
        // Create the leave type
        const leaveType = await LeaveTypeModel.create({
            LeaveType: leaveTypeName,
            Id: nextId // Explicitly set the ID
        });
        return res.status(201).json({
            success: true,
            message: 'Leave type created successfully',
            data: leaveType
        });
    }
    catch (e) {
        console.error('Create Error Details:', {
            name: e.name,
            message: e.message,
            parent: e.parent?.message,
            sql: e.sql
        });
        // Handle specific database errors
        if (e.name === 'SequelizeDatabaseError') {
            if (e.parent && e.parent.number === 515) {
                return res.status(500).json({
                    success: false,
                    message: 'Database error: ID column issue.',
                    suggestion: 'Please ensure the Id column allows NULL or remove NOT NULL constraint'
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Database error occurred',
                error: e.parent?.message || e.message
            });
        }
        // Handle validation errors
        if (e.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: e.errors.map((err) => ({
                    field: err.path,
                    message: err.message
                }))
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
};
exports.createLeaveType = createLeaveType;
/* ================= UPDATE ================= */
const updateLeaveType = async (req, res) => {
    try {
        const sequelizeInstance = getSequelizeFromRequest(req);
        const LeaveTypeModel = initializeLeaveTypeModel(sequelizeInstance);
        // Validate ID parameter
        const idValidation = validateWithZod(leaveType_model_1.leaveTypeIdSchema, req.params);
        if (!idValidation.success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID parameter'
            });
        }
        // Validate request body
        const bodyValidation = validateWithZod(leaveType_model_1.leaveTypeUpdateSchema, req.body);
        if (!bodyValidation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: bodyValidation.errors
            });
        }
        // Find the leave type
        const leaveType = await LeaveTypeModel.findByPk(idValidation.data.id);
        if (!leaveType) {
            return res.status(404).json({
                success: false,
                message: 'Leave type not found'
            });
        }
        // Check for duplicate name (excluding current record)
        if (bodyValidation.data.LeaveType) {
            const duplicate = await LeaveTypeModel.findOne({
                where: {
                    LeaveType: bodyValidation.data.LeaveType,
                    Id: { [sequelize_1.Op.ne]: leaveType.Id }
                }
            });
            if (duplicate) {
                return res.status(409).json({
                    success: false,
                    message: 'Leave type name already exists'
                });
            }
        }
        // Update the leave type
        await leaveType.update({
            LeaveType: bodyValidation.data.LeaveType
        });
        // Fetch updated record
        const updatedLeaveType = await LeaveTypeModel.findByPk(leaveType.Id);
        return res.status(200).json({
            success: true,
            message: 'Leave type updated successfully',
            data: updatedLeaveType
        });
    }
    catch (e) {
        console.error('Update Error:', e);
        if (e.name === 'SequelizeDatabaseError') {
            return res.status(500).json({
                success: false,
                message: 'Database error occurred',
                error: e.parent?.message || e.message
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
};
exports.updateLeaveType = updateLeaveType;
/* ================= DELETE ================= */
const deleteLeaveType = async (req, res) => {
    try {
        const sequelizeInstance = getSequelizeFromRequest(req);
        const LeaveTypeModel = initializeLeaveTypeModel(sequelizeInstance);
        const validation = validateWithZod(leaveType_model_1.leaveTypeIdSchema, req.params);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID parameter'
            });
        }
        const leaveType = await LeaveTypeModel.findByPk(validation.data.id);
        if (!leaveType) {
            return res.status(404).json({
                success: false,
                message: 'Leave type not found'
            });
        }
        // Hard delete (permanent removal)
        await leaveType.destroy();
        return res.status(200).json({
            success: true,
            message: 'Leave type deleted successfully'
        });
    }
    catch (e) {
        console.error('Delete Error:', e);
        if (e.name === 'SequelizeDatabaseError') {
            return res.status(500).json({
                success: false,
                message: 'Database error occurred',
                error: e.parent?.message || e.message
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
};
exports.deleteLeaveType = deleteLeaveType;
/* ================= DROPDOWN ================= */
const getLeaveTypeDropdown = async (req, res) => {
    try {
        const sequelizeInstance = getSequelizeFromRequest(req);
        const LeaveTypeModel = initializeLeaveTypeModel(sequelizeInstance);
        const leaveTypes = await LeaveTypeModel.findAll({
            attributes: [
                ['Id', 'value'],
                ['LeaveType', 'label']
            ],
            order: [['LeaveType', 'ASC']]
        });
        return res.status(200).json({
            success: true,
            message: 'Leave types for dropdown retrieved successfully',
            data: leaveTypes
        });
    }
    catch (e) {
        console.error('Dropdown Error:', e);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
};
exports.getLeaveTypeDropdown = getLeaveTypeDropdown;
