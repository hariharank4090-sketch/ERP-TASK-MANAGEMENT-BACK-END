"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectIdSchema = exports.ProjectEmployeeIdSchema = exports.ProjectEmployeeQuerySchema = exports.ProjectEmployeeBulkUpdateSchema = exports.ProjectEmployeeUpdateSchema = exports.ProjectEmployeeBulkCreateSchema = exports.ProjectEmployeeCreationSchema = exports.ProjectEmployee = void 0;
// models/masters/employee involved/type.model.ts
const sequelize_1 = require("sequelize");
const sequalizer_1 = require("../../../config/sequalizer");
const zod_1 = require("zod");
const type_model_1 = __importDefault(require("../project/type.model"));
const type_model_2 = __importDefault(require("../employee/type.model"));
const modelName = 'ProjectEmployee';
class ProjectEmployee extends sequelize_1.Model {
    Employee_Id;
    Project_Id;
    Emp_Id;
    Del_Flag;
    project;
    employee;
}
exports.ProjectEmployee = ProjectEmployee;
// Zod schemas for validation
exports.ProjectEmployeeCreationSchema = zod_1.z.object({
    Project_Id: zod_1.z.coerce.number()
        .int()
        .positive('Project ID must be positive')
        .nullable(),
    Emp_Id: zod_1.z.coerce.number()
        .int()
        .positive('Employee ID must be positive')
        .nullable(),
});
// BULK CREATE Schema
exports.ProjectEmployeeBulkCreateSchema = zod_1.z.object({
    Project_Id: zod_1.z.coerce.number()
        .int()
        .positive('Project ID must be positive'),
    Emp_Ids: zod_1.z.array(zod_1.z.coerce.number()
        .int()
        .positive('Employee ID must be positive')).min(1, 'At least one employee must be selected')
});
exports.ProjectEmployeeUpdateSchema = zod_1.z.object({
    Project_Id: zod_1.z.coerce.number()
        .int()
        .positive('Project ID must be positive')
        .nullable()
        .optional(),
    Emp_Id: zod_1.z.coerce.number()
        .int()
        .positive('Employee ID must be positive')
        .nullable()
        .optional(),
    Del_Flag: zod_1.z.coerce.number()
        .int()
        .min(0)
        .max(1)
        .optional()
});
// BULK UPDATE Schema
exports.ProjectEmployeeBulkUpdateSchema = zod_1.z.object({
    Project_Id: zod_1.z.coerce.number()
        .int()
        .positive('Project ID must be positive'),
    Emp_Ids: zod_1.z.array(zod_1.z.coerce.number()
        .int()
        .positive('Employee ID must be positive'))
});
exports.ProjectEmployeeQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number()
        .int()
        .positive('Page must be positive')
        .default(1)
        .optional(),
    limit: zod_1.z.coerce.number()
        .int()
        .min(1, 'Limit must be at least 1')
        .max(500, 'Limit cannot exceed 500')
        .default(50)
        .optional(),
    search: zod_1.z.string().optional(),
    Project_Id: zod_1.z.coerce.number()
        .int()
        .positive('Project ID must be positive')
        .optional(),
    Emp_Id: zod_1.z.coerce.number()
        .int()
        .positive('Employee ID must be positive')
        .optional(),
    sortBy: zod_1.z.string()
        .optional()
        .default('Project_Id'),
    sortOrder: zod_1.z.enum(['ASC', 'DESC'])
        .optional()
        .default('ASC')
});
exports.ProjectEmployeeIdSchema = zod_1.z.object({
    id: zod_1.z.coerce.number()
        .int()
        .positive('Valid ID is required')
});
exports.ProjectIdSchema = zod_1.z.object({
    projectId: zod_1.z.coerce.number()
        .int()
        .positive('Valid Project ID is required')
});
// Initialize the model
ProjectEmployee.init({
    Employee_Id: {
        type: sequelize_1.DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        field: 'Employee_Id'
    },
    Project_Id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        field: 'Project_Id'
    },
    Emp_Id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        field: 'Emp_Id'
    },
    Del_Flag: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'Del_Flag'
    }
}, {
    sequelize: sequalizer_1.sequelize,
    tableName: 'tbl_Project_Employee',
    modelName: modelName,
    timestamps: false,
    freezeTableName: true
});
// Define associations HERE - THIS IS CRITICAL
ProjectEmployee.belongsTo(type_model_1.default, {
    foreignKey: 'Project_Id',
    targetKey: 'Project_Id',
    as: 'project'
});
ProjectEmployee.belongsTo(type_model_2.default, {
    foreignKey: 'Emp_Id',
    targetKey: 'Emp_Id',
    as: 'employee'
});
exports.default = ProjectEmployee;
