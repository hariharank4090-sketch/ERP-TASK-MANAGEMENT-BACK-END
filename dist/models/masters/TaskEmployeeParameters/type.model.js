"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskParametDTAccKey = exports.TaskParametDTModel = exports.getTaskParametDTModel = exports.formatTaskParametDTForResponse = exports.TaskParametDT = exports.taskParametDTIdSchema = exports.TaskParametDTQuerySchema = exports.TaskParametDTUpdateSchema = exports.TaskParametDTCreationSchema = void 0;
exports.initTaskParametDTModel = initTaskParametDTModel;
const sequelize_1 = require("sequelize");
const zod_1 = require("zod");
const sequalizer_1 = require("../../../config/sequalizer");
const modelName = 'Task_Paramet_DT';
// Zod schemas for validation
exports.TaskParametDTCreationSchema = zod_1.z.object({
    Task_Id: zod_1.z.number()
        .int('Task_Id must be an integer')
        .positive('Task_Id must be positive'),
    Param_Id: zod_1.z.number()
        .int('Param_Id must be an integer')
        .positive('Param_Id must be positive'),
    Paramet_Data_Type: zod_1.z.union([zod_1.z.string(), zod_1.z.number()])
        .nullable()
        .optional()
        .transform(val => (val === undefined || val === null || val === '') ? null : String(val))
});
exports.TaskParametDTUpdateSchema = zod_1.z.object({
    Task_Id: zod_1.z.number()
        .int('Task_Id must be an integer')
        .positive('Task_Id must be positive')
        .optional(),
    Param_Id: zod_1.z.number()
        .int('Param_Id must be an integer')
        .positive('Param_Id must be positive')
        .optional(),
    Paramet_Data_Type: zod_1.z.union([zod_1.z.string(), zod_1.z.number()])
        .nullable()
        .optional()
        .transform(val => (val === undefined || val === null || val === '') ? null : String(val))
});
exports.TaskParametDTQuerySchema = zod_1.z.object({
    Task_Id: zod_1.z.coerce.number().int().positive().optional(),
    Param_Id: zod_1.z.coerce.number().int().positive().optional(),
    sortBy: zod_1.z.enum(['PA_Id', 'Task_Id', 'Param_Id', 'Paramet_Name', 'Para_Display_Name'])
        .default('PA_Id'),
    sortOrder: zod_1.z.enum(['ASC', 'DESC'])
        .default('ASC')
});
exports.taskParametDTIdSchema = zod_1.z.object({
    id: zod_1.z.coerce.number()
        .int()
        .positive('Valid PA_Id is required')
});
// Model class definition (without initialization)
class TaskParametDT extends sequelize_1.Model {
}
exports.TaskParametDT = TaskParametDT;
// Function to initialize TaskParametDT model with a specific Sequelize instance
function initTaskParametDTModel(sequelize) {
    TaskParametDT.init({
        PA_Id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            field: 'PA_Id'
        },
        Task_Id: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            field: 'Task_Id',
            validate: {
                notEmpty: true
            }
        },
        Param_Id: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            field: 'Param_Id',
            validate: {
                notEmpty: true
            }
        },
        Paramet_Data_Type: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            field: 'Paramet_Data_Type'
        }
    }, {
        sequelize,
        tableName: 'tbl_Task_Paramet_DT',
        modelName: modelName,
        timestamps: false,
        freezeTableName: true,
        indexes: [
            {
                unique: true,
                fields: ['Task_Id', 'Param_Id']
            }
        ]
    });
    return TaskParametDT;
}
// Helper function to format task parameter detail for response with joined data
const formatTaskParametDTForResponse = (record) => {
    const recordData = record.get ? record.get({ plain: true }) : record;
    return recordData;
};
exports.formatTaskParametDTForResponse = formatTaskParametDTForResponse;
// Helper to get TaskParametDT model with the correct database connection
const getTaskParametDTModel = (req) => {
    const sequelize = req.companyDB;
    if (!sequelize) {
        throw new Error('Database connection not available');
    }
    return initTaskParametDTModel(sequelize);
};
exports.getTaskParametDTModel = getTaskParametDTModel;
// Export default initialized model
exports.TaskParametDTModel = initTaskParametDTModel(sequalizer_1.sequelize);
exports.default = exports.TaskParametDTModel;
exports.taskParametDTAccKey = {
    PA_Id: `${modelName}.PA_Id`,
    Task_Id: `${modelName}.Task_Id`,
    Param_Id: `${modelName}.Param_Id`,
    Paramet_Data_Type: `${modelName}.Paramet_Data_Type`
};
