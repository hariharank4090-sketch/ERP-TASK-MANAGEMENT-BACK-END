"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkParameter = exports.workParameterIdSchema = exports.workParameterQuerySchema = exports.workParameterUpdateSchema = exports.workParameterCreateSchema = void 0;
exports.initializeWorkParameterModel = initializeWorkParameterModel;
const sequelize_1 = require("sequelize");
const zod_1 = require("zod");
// Zod schemas
exports.workParameterCreateSchema = zod_1.z.object({
    Work_Id: zod_1.z.number().positive('Work ID must be a positive number'),
    Task_Id: zod_1.z.number().positive('Task ID must be a positive number'),
    Param_Id: zod_1.z.number().positive('Parameter ID must be a positive number'),
    Default_Value: zod_1.z.string().optional().nullable(),
    Current_Value: zod_1.z.string().optional().nullable()
});
exports.workParameterUpdateSchema = zod_1.z.object({
    Work_Id: zod_1.z.number().positive().optional(),
    Task_Id: zod_1.z.number().positive().optional(),
    Param_Id: zod_1.z.number().positive().optional(),
    Default_Value: zod_1.z.string().optional().nullable(),
    Current_Value: zod_1.z.string().optional().nullable()
});
exports.workParameterQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(10),
    search: zod_1.z.string().optional(),
    workId: zod_1.z.coerce.number().positive().optional(),
    taskId: zod_1.z.coerce.number().positive().optional(),
    paramId: zod_1.z.coerce.number().positive().optional(),
    sortBy: zod_1.z.enum(['Work_Id', 'Param_Id', 'Task_Id', 'WNo']).default('Work_Id'),
    sortOrder: zod_1.z.enum(['ASC', 'DESC']).default('ASC')
});
exports.workParameterIdSchema = zod_1.z.object({
    id: zod_1.z.coerce.number().int().positive('Valid ID is required')
});
// WorkParameter Model Class
class WorkParameter extends sequelize_1.Model {
}
exports.WorkParameter = WorkParameter;
// Initialize model with specific sequelize instance
function initializeWorkParameterModel(sequelize) {
    WorkParameter.init({
        WNo: {
            type: sequelize_1.DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        Work_Id: {
            type: sequelize_1.DataTypes.BIGINT,
            allowNull: false,
            validate: {
                notNull: { msg: 'Work_Id is required' }
            }
        },
        Task_Id: {
            type: sequelize_1.DataTypes.BIGINT,
            allowNull: false,
            validate: {
                notNull: { msg: 'Task_Id is required' }
            }
        },
        Param_Id: {
            type: sequelize_1.DataTypes.BIGINT,
            allowNull: false,
            validate: {
                notNull: { msg: 'Param_Id is required' }
            }
        },
        Default_Value: {
            type: sequelize_1.DataTypes.STRING(500),
            allowNull: true,
        },
        Current_Value: {
            type: sequelize_1.DataTypes.STRING(500),
            allowNull: true,
        },
    }, {
        sequelize,
        tableName: 'tbl_Work_Paramet_DT',
        modelName: 'WorkParameter',
        timestamps: false,
        freezeTableName: true,
        indexes: [
            { unique: true, fields: ['Work_Id', 'Param_Id'] },
            { fields: ['Task_Id'] },
            { fields: ['Param_Id'] }
        ]
    });
    return WorkParameter;
}
