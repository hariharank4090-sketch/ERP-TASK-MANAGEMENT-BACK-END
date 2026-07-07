"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessMasterModel = exports.Process_Master = exports.formatProcessForResponse = exports.processMasterQuerySchema = exports.processMasterIdSchema = exports.processMasterUpdateSchema = exports.processMasterCreateSchema = void 0;
exports.initProcessModel = initProcessModel;
const sequelize_1 = require("sequelize");
const zod_1 = require("zod");
const sequalizer_1 = require("../../../config/sequalizer");
// Zod schemas for validation
exports.processMasterCreateSchema = zod_1.z.object({
    Process_Name: zod_1.z.string()
        .min(1, 'Process name is required')
        .max(250, 'Process name must be 250 characters or less')
        .trim()
});
exports.processMasterUpdateSchema = zod_1.z.object({
    Process_Name: zod_1.z.string()
        .min(1, 'Process name is required')
        .max(250, 'Process name must be 250 characters or less')
        .trim()
        .optional()
});
exports.processMasterIdSchema = zod_1.z.object({
    id: zod_1.z.coerce.number()
        .int('Process ID must be an integer')
        .positive('Valid process ID is required')
});
exports.processMasterQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number()
        .int('Page must be an integer')
        .positive('Page must be positive')
        .default(1)
        .optional(),
    limit: zod_1.z.coerce.number()
        .int('Limit must be an integer')
        .min(1, 'Limit must be at least 1')
        .max(100, 'Limit cannot exceed 100')
        .default(20)
        .optional(),
    search: zod_1.z.string()
        .optional()
        .nullable(),
    sortBy: zod_1.z.enum(['Id', 'Process_Name'])
        .default('Id')
        .optional(),
    sortOrder: zod_1.z.enum(['ASC', 'DESC'])
        .default('ASC')
        .optional(),
});
// Helper function to format process for response
const formatProcessForResponse = (process) => {
    const processData = process.get ? process.get({ plain: true }) : process;
    return processData;
};
exports.formatProcessForResponse = formatProcessForResponse;
// Model class definition (without initialization)
class Process_Master extends sequelize_1.Model {
    Id;
    Process_Name;
}
exports.Process_Master = Process_Master;
// Function to initialize Process Master model with a specific Sequelize instance
function initProcessModel(sequelize) {
    Process_Master.init({
        Id: {
            type: sequelize_1.DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
            field: 'Id'
        },
        Process_Name: {
            type: sequelize_1.DataTypes.STRING(250),
            allowNull: false,
            field: 'Process_Name'
        }
    }, {
        sequelize,
        tableName: 'tbl_Process_Master',
        modelName: 'Process_Master',
        timestamps: false,
        hooks: {
            beforeValidate: (process) => {
                if (process.Process_Name && typeof process.Process_Name === 'string') {
                    process.Process_Name = process.Process_Name.trim();
                }
            }
        }
    });
    return Process_Master;
}
exports.ProcessMasterModel = initProcessModel(sequalizer_1.sequelize);
exports.default = exports.ProcessMasterModel;
