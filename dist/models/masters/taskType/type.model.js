"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskTypeModel = exports.TaskType = exports.formatTaskTypeForResponse = exports.getReptativeText = exports.getDelFlagText = exports.getStatusText = exports.taskTypeQuerySchema = exports.taskTypeIdSchema = exports.taskTypeUpdateSchema = exports.taskTypeCreateSchema = void 0;
exports.initTaskTypeModel = initTaskTypeModel;
const sequelize_1 = require("sequelize");
const zod_1 = require("zod");
// Zod schemas for validation
exports.taskTypeCreateSchema = zod_1.z.object({
    Task_Type: zod_1.z.string()
        .min(1, 'Task type is required')
        .max(250, 'Task type must be 250 characters or less')
        .trim(),
    Is_Reptative: zod_1.z.coerce.number()
        .int('Is_Reptative must be an integer')
        .min(0, 'Is_Reptative must be 0 or 1')
        .max(1, 'Is_Reptative must be 0 or 1')
        .optional()
        .nullable()
        .default(0),
    Hours_Duration: zod_1.z.coerce.number()
        .int('Hours duration must be an integer')
        .min(0, 'Hours duration cannot be negative')
        .optional()
        .nullable()
        .default(null),
    Day_Duration: zod_1.z.coerce.number()
        .int('Day duration must be an integer')
        .min(0, 'Day duration cannot be negative')
        .optional()
        .nullable()
        .default(null),
    Project_Id: zod_1.z.coerce.number()
        .int('Project ID must be an integer')
        .positive('Project ID must be positive')
        .optional()
        .nullable()
        .default(null),
    Est_StartTime: zod_1.z.union([zod_1.z.string(), zod_1.z.date()])
        .transform(val => {
        if (typeof val === 'string') {
            const date = new Date(val);
            if (isNaN(date.getTime())) {
                throw new Error('Invalid date format');
            }
            return date;
        }
        return val;
    })
        .optional()
        .nullable(),
    Est_EndTime: zod_1.z.union([zod_1.z.string(), zod_1.z.date()])
        .transform(val => {
        if (typeof val === 'string') {
            const date = new Date(val);
            if (isNaN(date.getTime())) {
                throw new Error('Invalid date format');
            }
            return date;
        }
        return val;
    })
        .optional()
        .nullable(),
    Status: zod_1.z.coerce.number()
        .int('Status must be an integer')
        .min(0, 'Status must be 0 or 1')
        .max(1, 'Status must be 0 or 1')
        .optional()
        .nullable()
        .default(1)
}).refine(data => {
    if (data.Est_StartTime && data.Est_EndTime) {
        return data.Est_EndTime >= data.Est_StartTime;
    }
    return true;
}, {
    message: 'End time must be after or equal to start time',
    path: ['Est_EndTime'],
});
exports.taskTypeUpdateSchema = zod_1.z.object({
    Task_Type: zod_1.z.string()
        .min(1, 'Task type is required')
        .max(250, 'Task type must be 250 characters or less')
        .trim()
        .optional(),
    Is_Reptative: zod_1.z.coerce.number()
        .int('Is_Reptative must be an integer')
        .min(0, 'Is_Reptative must be 0 or 1')
        .max(1, 'Is_Reptative must be 0 or 1')
        .optional()
        .nullable(),
    Hours_Duration: zod_1.z.coerce.number()
        .int('Hours duration must be an integer')
        .min(0, 'Hours duration cannot be negative')
        .optional()
        .nullable(),
    Day_Duration: zod_1.z.coerce.number()
        .int('Day duration must be an integer')
        .min(0, 'Day duration cannot be negative')
        .optional()
        .nullable(),
    Project_Id: zod_1.z.coerce.number()
        .int('Project ID must be an integer')
        .positive('Project ID must be positive')
        .optional()
        .nullable(),
    Est_StartTime: zod_1.z.union([zod_1.z.string(), zod_1.z.date()])
        .transform(val => {
        if (typeof val === 'string') {
            const date = new Date(val);
            if (isNaN(date.getTime())) {
                throw new Error('Invalid date format');
            }
            return date;
        }
        return val;
    })
        .optional()
        .nullable(),
    Est_EndTime: zod_1.z.union([zod_1.z.string(), zod_1.z.date()])
        .transform(val => {
        if (typeof val === 'string') {
            const date = new Date(val);
            if (isNaN(date.getTime())) {
                throw new Error('Invalid date format');
            }
            return date;
        }
        return val;
    })
        .optional()
        .nullable(),
    Status: zod_1.z.coerce.number()
        .int('Status must be an integer')
        .min(0, 'Status must be 0 or 1')
        .max(1, 'Status must be 0 or 1')
        .optional()
        .nullable(),
    TT_Del_Flag: zod_1.z.coerce.number()
        .int('TT_Del_Flag must be an integer')
        .min(0, 'TT_Del_Flag must be 0 or 1')
        .max(1, 'TT_Del_Flag must be 0 or 1')
        .optional()
        .nullable()
}).refine(data => {
    if (data.Est_StartTime && data.Est_EndTime) {
        return data.Est_EndTime >= data.Est_StartTime;
    }
    return true;
}, {
    message: 'End time must be after or equal to start time',
    path: ['Est_EndTime'],
});
exports.taskTypeIdSchema = zod_1.z.object({
    id: zod_1.z.coerce.number()
        .int('Task type ID must be an integer')
        .positive('Valid task type ID is required')
});
// Updated query schema without pagination
exports.taskTypeQuerySchema = zod_1.z.object({
    search: zod_1.z.string()
        .optional()
        .nullable(),
    Task_Type: zod_1.z.string()
        .optional()
        .nullable(),
    Project_Id: zod_1.z.coerce.number()
        .int('Project ID must be an integer')
        .positive('Project ID must be positive')
        .optional()
        .nullable(),
    Status: zod_1.z.coerce.number()
        .int('Status must be an integer')
        .min(0, 'Status must be 0 or 1')
        .max(1, 'Status must be 0 or 1')
        .optional()
        .nullable(),
    TT_Del_Flag: zod_1.z.coerce.number()
        .int('TT_Del_Flag must be an integer')
        .min(0, 'TT_Del_Flag must be 0 or 1')
        .max(1, 'TT_Del_Flag must be 0 or 1')
        .optional()
        .nullable()
        .default(0),
    Is_Reptative: zod_1.z.coerce.number()
        .int('Is_Reptative must be an integer')
        .min(0, 'Is_Reptative must be 0 or 1')
        .max(1, 'Is_Reptative must be 0 or 1')
        .optional()
        .nullable(),
    sortBy: zod_1.z.enum([
        'Task_Type_Id',
        'Task_Type',
        'Project_Id',
        'Status'
    ])
        .default('Task_Type_Id')
        .optional(),
    sortOrder: zod_1.z.enum(['ASC', 'DESC'])
        .default('DESC')
        .optional(),
});
// Helper functions for status conversion
const getStatusText = (status) => {
    if (status === 1)
        return 'Active';
    if (status === 0)
        return 'Inactive';
    return 'Unknown';
};
exports.getStatusText = getStatusText;
const getDelFlagText = (delFlag) => {
    if (delFlag === 1)
        return 'Deleted';
    if (delFlag === 0)
        return 'Active';
    return 'Unknown';
};
exports.getDelFlagText = getDelFlagText;
const getReptativeText = (isReptative) => {
    if (isReptative === 1)
        return 'Repetitive';
    if (isReptative === 0)
        return 'Non-Repetitive';
    return 'Unknown';
};
exports.getReptativeText = getReptativeText;
// Function to format task type for response
const formatTaskTypeForResponse = (taskType) => {
    const taskTypeData = taskType.get ? taskType.get({ plain: true }) : taskType;
    return {
        ...taskTypeData,
        statusText: (0, exports.getStatusText)(taskTypeData.Status),
        delFlagText: (0, exports.getDelFlagText)(taskTypeData.TT_Del_Flag),
        isReptativeText: (0, exports.getReptativeText)(taskTypeData.Is_Reptative)
    };
};
exports.formatTaskTypeForResponse = formatTaskTypeForResponse;
// Model class definition (without initialization)
class TaskType extends sequelize_1.Model {
    Task_Type_Id;
    Task_Type;
    Is_Reptative;
    Hours_Duration;
    Day_Duration;
    TT_Del_Flag;
    Project_Id;
    Est_StartTime;
    Est_EndTime;
    Status;
}
exports.TaskType = TaskType;
// Function to initialize TaskType model with a specific Sequelize instance
function initTaskTypeModel(sequelize) {
    TaskType.init({
        Task_Type_Id: {
            type: sequelize_1.DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
            field: 'Task_Type_Id'
        },
        Task_Type: {
            type: sequelize_1.DataTypes.STRING(250),
            allowNull: false,
            field: 'Task_Type'
        },
        Is_Reptative: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'Is_Reptative',
            defaultValue: 0
        },
        Hours_Duration: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'Hours_Duration'
        },
        Day_Duration: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'Day_Duration'
        },
        TT_Del_Flag: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'TT_Del_Flag',
            defaultValue: 0
        },
        Project_Id: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'Project_Id'
        },
        Est_StartTime: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            field: 'Est_StartTime'
        },
        Est_EndTime: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            field: 'Est_EndTime'
        },
        Status: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'Status',
            defaultValue: 1
        }
    }, {
        sequelize,
        tableName: 'tbl_Task_Type',
        modelName: 'TaskType',
        timestamps: false,
        hooks: {
            beforeCreate: (taskType) => {
                if (taskType.Status === undefined || taskType.Status === null) {
                    taskType.Status = 1;
                }
                if (taskType.TT_Del_Flag === undefined || taskType.TT_Del_Flag === null) {
                    taskType.TT_Del_Flag = 0;
                }
                if (taskType.Is_Reptative === undefined || taskType.Is_Reptative === null) {
                    taskType.Is_Reptative = 0;
                }
            }
        }
    });
    return TaskType;
}
// Default export for backward compatibility (uses default connection)
const sequalizer_1 = require("../../../config/sequalizer");
exports.TaskTypeModel = initTaskTypeModel(sequalizer_1.sequelize);
exports.default = exports.TaskTypeModel;
