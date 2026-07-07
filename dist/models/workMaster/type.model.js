"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkMaster = exports.workMasterIdSchema = exports.workMasterQuerySchema = exports.workMasterUpdateSchema = exports.workMasterCreateSchema = exports.workParameterSchema = void 0;
exports.initializeWorkMasterModel = initializeWorkMasterModel;
const zod_1 = require("zod");
const sequelize_1 = require("sequelize");
// ─────────────────────────────────────────────────────────────────
// ZOD SCHEMAS
// ─────────────────────────────────────────────────────────────────
exports.workParameterSchema = zod_1.z.object({
    Param_Id: zod_1.z.number(),
    Default_Value: zod_1.z.string().optional().nullable(),
    Current_Value: zod_1.z.string().optional().nullable(),
});
/**
 * CREATE schema — Work_Id is NOT accepted from the client.
 * The DB generates it automatically (IDENTITY column or sequence).
 */
exports.workMasterCreateSchema = zod_1.z.object({
    Sch_Id: zod_1.z.number().positive('Schedule ID must be a positive number'),
    Task_Id: zod_1.z.number().positive('Task ID must be a positive number'),
    Emp_Id: zod_1.z.number().positive('Employee ID must be a positive number'),
    Work_Dt: zod_1.z.string().or(zod_1.z.date()).transform(val => new Date(val)),
    Work_Done: zod_1.z.string().optional().nullable(),
    Start_Time: zod_1.z.string().or(zod_1.z.date()).optional().nullable().transform(val => val ? new Date(val) : null),
    End_Time: zod_1.z.string().or(zod_1.z.date()).optional().nullable().transform(val => val ? new Date(val) : null),
    Tot_Minutes: zod_1.z.number().min(0).optional().nullable(),
    Work_Status: zod_1.z.number().min(1).max(3).optional().default(1),
    Entry_By: zod_1.z.number().optional().nullable(),
    Process_Id: zod_1.z.number().optional().nullable(),
    Parameters: zod_1.z.array(exports.workParameterSchema).optional().default([])
});
exports.workMasterUpdateSchema = zod_1.z.object({
    Sch_Id: zod_1.z.number().positive().optional(),
    Task_Id: zod_1.z.number().positive().optional(),
    Emp_Id: zod_1.z.number().positive().optional(),
    Work_Dt: zod_1.z.string().or(zod_1.z.date()).optional().nullable().transform(val => val ? new Date(val) : undefined),
    Work_Done: zod_1.z.string().optional().nullable(),
    Start_Time: zod_1.z.string().or(zod_1.z.date()).optional().nullable().transform(val => val ? new Date(val) : null),
    End_Time: zod_1.z.string().or(zod_1.z.date()).optional().nullable().transform(val => val ? new Date(val) : null),
    Tot_Minutes: zod_1.z.number().min(0).optional().nullable(),
    Work_Status: zod_1.z.number().min(1).max(3).optional(),
    Update_By: zod_1.z.number().optional().nullable(),
    Process_Id: zod_1.z.number().optional().nullable(),
    Parameters: zod_1.z.array(exports.workParameterSchema).optional()
});
exports.workMasterQuerySchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    empId: zod_1.z.coerce.number().positive().optional(),
    taskId: zod_1.z.coerce.number().positive().optional(),
    schId: zod_1.z.coerce.number().positive().optional(),
    fromDate: zod_1.z.string().optional().transform(val => val ? new Date(val) : undefined),
    toDate: zod_1.z.string().optional().transform(val => val ? new Date(val) : undefined),
    workStatus: zod_1.z.enum(['Pending', 'In Progress', 'Completed']).optional(),
    sortBy: zod_1.z.enum(['Work_Id', 'Work_Dt', 'Work_Status', 'Emp_Id', 'Task_Id']).default('Work_Dt'),
    sortOrder: zod_1.z.enum(['ASC', 'DESC']).default('DESC')
});
exports.workMasterIdSchema = zod_1.z.object({
    id: zod_1.z.coerce.number().int().positive('Valid Work SNo is required')
});
// ─────────────────────────────────────────────────────────────────
// SEQUELIZE MODEL
// ─────────────────────────────────────────────────────────────────
class WorkMaster extends sequelize_1.Model {
}
exports.WorkMaster = WorkMaster;
function initializeWorkMasterModel(sequelize) {
    WorkMaster.init({
        SNo: {
            type: sequelize_1.DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        Work_Id: {
            type: sequelize_1.DataTypes.BIGINT,
            allowNull: false,
        },
        Sch_Id: {
            type: sequelize_1.DataTypes.BIGINT,
            allowNull: false,
        },
        Task_Id: {
            type: sequelize_1.DataTypes.BIGINT,
            allowNull: false,
        },
        Emp_Id: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
        },
        Work_Dt: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: false,
            validate: { isDate: true }
        },
        Work_Done: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
        Start_Time: { type: sequelize_1.DataTypes.DATE, allowNull: true },
        End_Time: { type: sequelize_1.DataTypes.DATE, allowNull: true },
        Tot_Minutes: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            validate: { min: { args: [0], msg: 'Tot_Minutes must be positive' } }
        },
        Work_Status: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 1,
            validate: { isIn: [[1, 2, 3]] }
        },
        Entry_By: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
        Entry_Date: { type: sequelize_1.DataTypes.DATE, allowNull: true, defaultValue: sequelize_1.DataTypes.NOW },
        Update_By: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
        Update_Date: { type: sequelize_1.DataTypes.DATE, allowNull: true },
        Process_Id: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
    }, {
        sequelize,
        tableName: 'tbl_Work_Master',
        modelName: 'WorkMaster',
        timestamps: false,
        freezeTableName: true,
        indexes: [
            { fields: ['Work_Id'] },
            { fields: ['Emp_Id'] },
            { fields: ['Task_Id'] },
            { fields: ['Work_Dt'] },
            { fields: ['Work_Status'] },
            { fields: ['Sch_Id'] }
        ]
    });
    return WorkMaster;
}
