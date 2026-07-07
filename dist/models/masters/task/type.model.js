"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectScheduleModel = exports.TaskModel = exports.ProjectSchedule = exports.Task = exports.formatTaskForResponse = exports.taskQuerySchema = exports.taskIdSchema = exports.taskUpdateSchema = exports.taskCreateSchema = void 0;
exports.initTaskModel = initTaskModel;
exports.initProjectScheduleModel = initProjectScheduleModel;
exports.defineTaskAssociations = defineTaskAssociations;
const sequelize_1 = require("sequelize");
const zod_1 = require("zod");
const sequalizer_1 = require("../../../config/sequalizer");
// Zod schemas for validation (NO PAGINATION)
exports.taskCreateSchema = zod_1.z.object({
    Task_Name: zod_1.z.string()
        .min(1, 'Task name is required')
        .max(255, 'Task name must be 255 characters or less')
        .trim(),
    Task_Desc: zod_1.z.string()
        .max(1000, 'Task description must be 1000 characters or less')
        .trim()
        .optional()
        .nullable()
        .default(null),
    Company_Id: zod_1.z.coerce.number()
        .int('Company ID must be an integer')
        .positive('Company ID must be positive')
        .optional()
        .nullable()
        .default(null),
    Task_Type_Id: zod_1.z.coerce.number()
        .int('Task group ID must be an integer')
        .positive('Valid task group ID is required'),
    Project_Id: zod_1.z.coerce.number()
        .int('Project ID must be an integer')
        .positive('Project ID must be positive')
        .optional()
        .nullable()
        .default(null),
});
exports.taskUpdateSchema = zod_1.z.object({
    Task_Name: zod_1.z.string()
        .min(1, 'Task name is required')
        .max(255, 'Task name must be 255 characters or less')
        .trim()
        .optional(),
    Task_Desc: zod_1.z.string()
        .max(1000, 'Task description must be 1000 characters or less')
        .trim()
        .optional()
        .nullable(),
    Company_Id: zod_1.z.coerce.number()
        .int('Company ID must be an integer')
        .positive('Company ID must be positive')
        .optional()
        .nullable(),
    Task_Type_Id: zod_1.z.coerce.number()
        .int('Task group ID must be an integer')
        .positive('Valid task group ID is required')
        .optional(),
    Project_Id: zod_1.z.coerce.number()
        .int('Project ID must be an integer')
        .positive('Project ID must be positive')
        .optional()
        .nullable(),
});
exports.taskIdSchema = zod_1.z.object({
    id: zod_1.z.coerce.number()
        .int('Task ID must be an integer')
        .positive('Valid task ID is required')
});
// Updated query schema without pagination
exports.taskQuerySchema = zod_1.z.object({
    Company_Id: zod_1.z.coerce.number()
        .int('Company ID must be an integer')
        .positive('Company ID must be positive')
        .optional()
        .nullable(),
    Task_Type_Id: zod_1.z.coerce.number()
        .int('Task group ID must be an integer')
        .positive('Task group ID must be positive')
        .optional(),
    Project_Id: zod_1.z.coerce.number()
        .int('Project ID must be an integer')
        .positive('Project ID must be positive')
        .optional()
        .nullable(),
    search: zod_1.z.string()
        .optional()
        .nullable(),
    sortBy: zod_1.z.enum([
        'Task_Id',
        'Task_Name',
        'Entry_Date',
        'Update_Date',
        'Task_Type_Id'
    ])
        .default('Task_Id')
        .optional(),
    sortOrder: zod_1.z.enum(['ASC', 'DESC'])
        .default('DESC')
        .optional(),
    includeSchedules: zod_1.z.union([zod_1.z.boolean(), zod_1.z.string()])
        .transform(val => {
        if (typeof val === 'string') {
            return val === 'true' || val === '1';
        }
        return val === true;
    })
        .default(false)
        .optional(),
});
// Helper function to format task for response
const formatTaskForResponse = (task) => {
    const taskData = task.get ? task.get({ plain: true }) : task;
    return {
        ...taskData
    };
};
exports.formatTaskForResponse = formatTaskForResponse;
// Model class definition (without initialization)
class Task extends sequelize_1.Model {
    Task_Id;
    Task_Name;
    Task_Desc;
    Company_Id;
    Task_Type_Id;
    Entry_By;
    Entry_Date;
    Update_By;
    Update_Date;
    Project_Id;
}
exports.Task = Task;
// ProjectSchedule Model class
class ProjectSchedule extends sequelize_1.Model {
    Sch_Id;
    Sch_No;
    Sch_Date;
    Task_Id;
    Task_Type_Id;
    Sch_Plan_Id;
    Sch_Start_Date;
    Sch_End_Date;
    Task_Sch_Timer_Based;
    Sch_Est_Start_Time;
    Sch_Est_End_Time;
    Task_Sch_Duaration;
    Sch_Status;
    Entry_By;
    Entry_Date;
    Update_By;
    Update_Date;
    Sch_Del_Flag;
}
exports.ProjectSchedule = ProjectSchedule;
// Function to initialize Task model with a specific Sequelize instance
function initTaskModel(sequelize) {
    Task.init({
        Task_Id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'Task_Id'
        },
        Task_Name: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
            field: 'Task_Name'
        },
        Task_Desc: {
            type: sequelize_1.DataTypes.STRING(1000),
            allowNull: true,
            field: 'Task_Desc'
        },
        Company_Id: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'Company_Id'
        },
        Task_Type_Id: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            field: 'Task_Type_Id'
        },
        Entry_By: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            field: 'Entry_By',
            defaultValue: 1
        },
        Entry_Date: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            field: 'Entry_Date',
            defaultValue: sequelize_1.DataTypes.NOW
        },
        Update_By: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'Update_By'
        },
        Update_Date: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            field: 'Update_Date'
        },
        Project_Id: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'Project_Id'
        }
    }, {
        sequelize,
        tableName: 'tbl_Task',
        modelName: 'Task',
        timestamps: false,
        hooks: {
            beforeUpdate: (task) => {
                task.Update_Date = new Date();
            },
            beforeCreate: (task) => {
                if (!task.Entry_Date) {
                    task.Entry_Date = new Date();
                }
            }
        }
    });
    return Task;
}
// Function to initialize ProjectSchedule model with a specific Sequelize instance
function initProjectScheduleModel(sequelize) {
    ProjectSchedule.init({
        Sch_Id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'Sch_Id'
        },
        Sch_No: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
            field: 'Sch_No'
        },
        Sch_Date: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            field: 'Sch_Date'
        },
        Task_Id: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            field: 'Task_Id'
        },
        Task_Type_Id: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            field: 'Task_Type_Id'
        },
        Sch_Plan_Id: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            field: 'Sch_Plan_Id'
        },
        Sch_Start_Date: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            field: 'Sch_Start_Date'
        },
        Sch_End_Date: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            field: 'Sch_End_Date'
        },
        Task_Sch_Timer_Based: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            field: 'Task_Sch_Timer_Based'
        },
        Sch_Est_Start_Time: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            field: 'Sch_Est_Start_Time'
        },
        Sch_Est_End_Time: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            field: 'Sch_Est_End_Time'
        },
        Task_Sch_Duaration: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            field: 'Task_Sch_Duaration'
        },
        Sch_Status: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            field: 'Sch_Status'
        },
        Entry_By: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            field: 'Entry_By'
        },
        Entry_Date: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            field: 'Entry_Date',
            defaultValue: sequelize_1.DataTypes.NOW
        },
        Update_By: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'Update_By'
        },
        Update_Date: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            field: 'Update_Date'
        },
        Sch_Del_Flag: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            field: 'Sch_Del_Flag',
            defaultValue: false
        }
    }, {
        sequelize,
        tableName: 'tbl_Project_Schedule',
        modelName: 'ProjectSchedule',
        timestamps: false,
        hooks: {
            beforeCreate: (schedule) => {
                if (!schedule.Entry_Date) {
                    schedule.Entry_Date = new Date();
                }
                if (schedule.Sch_Del_Flag === undefined) {
                    schedule.Sch_Del_Flag = false;
                }
            }
        }
    });
    return ProjectSchedule;
}
// Define association function
function defineTaskAssociations() {
    if (!Task.associations?.Schedules) {
        Task.hasMany(ProjectSchedule, {
            foreignKey: 'Task_Id',
            as: 'Schedules'
        });
    }
    if (!ProjectSchedule.associations?.Task) {
        ProjectSchedule.belongsTo(Task, {
            foreignKey: 'Task_Id',
            as: 'Task'
        });
    }
}
// Initialize with default sequelize
exports.TaskModel = initTaskModel(sequalizer_1.sequelize);
exports.ProjectScheduleModel = initProjectScheduleModel(sequalizer_1.sequelize);
defineTaskAssociations();
exports.default = exports.TaskModel;
