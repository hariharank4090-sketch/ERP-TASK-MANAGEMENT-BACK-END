"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskDetailIdSchema = exports.taskDetailQuerySchema = exports.taskDetailBulkUpdateSchema = exports.taskDetailUpdateSchema = exports.taskDetailCreateSchema = exports.TaskDetail_Master = void 0;
exports.initTaskDetailModel = initTaskDetailModel;
const sequelize_1 = require("sequelize");
const zod_1 = require("zod");
const modelName = 'Task_Detail';
class TaskDetail_Master extends sequelize_1.Model {
}
exports.TaskDetail_Master = TaskDetail_Master;
// Factory function to initialize model with a specific database connection
function initTaskDetailModel(sequelize) {
    TaskDetail_Master.init({
        Id: {
            type: sequelize_1.DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true
        },
        AN_No: {
            type: sequelize_1.DataTypes.BIGINT,
            allowNull: true
        },
        Project_Id: {
            type: sequelize_1.DataTypes.BIGINT,
            allowNull: false
        },
        Sch_Id: {
            type: sequelize_1.DataTypes.BIGINT,
            allowNull: false
        },
        Task_Levl_Id: {
            type: sequelize_1.DataTypes.BIGINT,
            allowNull: true
        },
        Task_Id: {
            type: sequelize_1.DataTypes.BIGINT,
            allowNull: false
        },
        Assigned_Emp_Id: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true
        },
        Emp_Id: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false
        },
        Task_Assign_dt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true
        },
        Sch_Period: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true
        },
        Sch_Time: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true
        },
        EN_Time: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true
        },
        Ord_By: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true
        },
        Invovled_Stat: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        sequelize,
        tableName: 'tbl_Task_Details',
        modelName,
        timestamps: false,
        freezeTableName: true
    });
    return TaskDetail_Master;
}
// Schema for Create API
exports.taskDetailCreateSchema = zod_1.z.object({
    AN_No: zod_1.z.union([zod_1.z.number(), zod_1.z.string(), zod_1.z.null(), zod_1.z.undefined()]).optional().transform(val => val ? Number(val) : null),
    Project_Id: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).transform(val => Number(val)),
    Sch_Id: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).transform(val => Number(val)),
    Task_Levl_Id: zod_1.z.union([zod_1.z.number(), zod_1.z.string(), zod_1.z.null(), zod_1.z.undefined()]).optional().transform(val => val ? Number(val) : null),
    Task_Id: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).transform(val => Number(val)),
    Assigned_Emp_Id: zod_1.z.union([zod_1.z.number(), zod_1.z.string(), zod_1.z.null(), zod_1.z.undefined()]).optional().transform(val => val ? Number(val) : null),
    Emp_Ids: zod_1.z.array(zod_1.z.union([zod_1.z.number(), zod_1.z.string()])).min(1).max(100).transform(arr => arr.map(val => Number(val))),
    Sch_Period: zod_1.z.string().max(50).optional().nullable(),
    Ord_By: zod_1.z.union([zod_1.z.number(), zod_1.z.string(), zod_1.z.null(), zod_1.z.undefined()]).optional().transform(val => val ? Number(val) : null),
    Invovled_Stat: zod_1.z.union([zod_1.z.number(), zod_1.z.string(), zod_1.z.null(), zod_1.z.undefined()]).optional().transform(val => val ? Number(val) : null)
}).strict();
// Schema for Update API
exports.taskDetailUpdateSchema = zod_1.z.object({
    AN_No: zod_1.z.union([zod_1.z.number(), zod_1.z.string(), zod_1.z.null()]).optional().transform(val => val ? Number(val) : null),
    Project_Id: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).optional().transform(val => val ? Number(val) : undefined),
    Sch_Id: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).optional().transform(val => val ? Number(val) : undefined),
    Task_Levl_Id: zod_1.z.union([zod_1.z.number(), zod_1.z.string(), zod_1.z.null()]).optional().transform(val => val ? Number(val) : null),
    Task_Id: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).optional().transform(val => val ? Number(val) : undefined),
    Assigned_Emp_Id: zod_1.z.union([zod_1.z.number(), zod_1.z.string(), zod_1.z.null()]).optional().transform(val => val ? Number(val) : null),
    Emp_Id: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).optional().transform(val => val ? Number(val) : undefined),
    Task_Assign_dt: zod_1.z.union([
        zod_1.z.string().transform(val => new Date(val)),
        zod_1.z.date(),
        zod_1.z.null()
    ]).optional(),
    Sch_Period: zod_1.z.string().max(50).optional().nullable(),
    Sch_Time: zod_1.z.union([zod_1.z.string(), zod_1.z.date(), zod_1.z.null()]).optional().transform(val => val ? new Date(val) : null),
    EN_Time: zod_1.z.union([zod_1.z.string(), zod_1.z.date(), zod_1.z.null()]).optional().transform(val => val ? new Date(val) : null),
    Ord_By: zod_1.z.union([zod_1.z.number(), zod_1.z.string(), zod_1.z.null()]).optional().transform(val => val ? Number(val) : null),
    Invovled_Stat: zod_1.z.union([zod_1.z.number(), zod_1.z.string(), zod_1.z.null()]).optional().transform(val => val ? Number(val) : null)
}).strict().partial();
// Schema for Bulk Update
exports.taskDetailBulkUpdateSchema = zod_1.z.object({
    projectId: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).transform(val => Number(val)),
    schId: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).transform(val => Number(val)),
    taskId: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).transform(val => Number(val)),
    empId: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).transform(val => Number(val)),
    Ord_By: zod_1.z.union([zod_1.z.number(), zod_1.z.string(), zod_1.z.null()]).optional().transform(val => val ? Number(val) : null),
    Invovled_Stat: zod_1.z.union([zod_1.z.number(), zod_1.z.string(), zod_1.z.null()]).optional().transform(val => val ? Number(val) : null)
}).strict();
// Query schema without pagination
exports.taskDetailQuerySchema = zod_1.z.object({
    Id: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional().transform(val => val ? Number(val) : undefined),
    AN_No: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional().transform(val => val ? Number(val) : undefined),
    Project_Id: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional().transform(val => val ? Number(val) : undefined),
    Project_Name: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional().transform(val => val ? String(val) : undefined),
    Sch_Id: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional().transform(val => val ? Number(val) : undefined),
    Task_Levl_Id: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional().transform(val => val ? Number(val) : undefined),
    Task_Id: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional().transform(val => val ? Number(val) : undefined),
    Task_Name: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional().transform(val => val ? String(val) : undefined),
    Assigned_Emp_Id: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional().transform(val => val ? Number(val) : undefined),
    Emp_Id: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional().transform(val => val ? Number(val) : undefined),
    Invovled_Stat: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional().transform(val => val ? Number(val) : undefined),
    Ord_By: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional().transform(val => val ? Number(val) : undefined),
    Ids: zod_1.z.union([
        zod_1.z.string().transform(str => str.split(',').map(Number)),
        zod_1.z.array(zod_1.z.union([zod_1.z.string(), zod_1.z.number()])).transform(arr => arr.map(val => Number(val))),
        zod_1.z.undefined()
    ]).optional(),
    Project_Ids: zod_1.z.union([
        zod_1.z.string().transform(str => str.split(',').map(Number)),
        zod_1.z.array(zod_1.z.union([zod_1.z.string(), zod_1.z.number()])).transform(arr => arr.map(val => Number(val))),
        zod_1.z.undefined()
    ]).optional(),
    Task_Ids: zod_1.z.union([
        zod_1.z.string().transform(str => str.split(',').map(Number)),
        zod_1.z.array(zod_1.z.union([zod_1.z.string(), zod_1.z.number()])).transform(arr => arr.map(val => Number(val))),
        zod_1.z.undefined()
    ]).optional(),
    Emp_Ids: zod_1.z.union([
        zod_1.z.string().transform(str => str.split(',').map(Number)),
        zod_1.z.array(zod_1.z.union([zod_1.z.string(), zod_1.z.number()])).transform(arr => arr.map(val => Number(val))),
        zod_1.z.undefined()
    ]).optional(),
    from_Task_Assign_dt: zod_1.z.union([zod_1.z.string(), zod_1.z.date()]).optional().transform(val => val ? new Date(val) : undefined),
    to_Task_Assign_dt: zod_1.z.union([zod_1.z.string(), zod_1.z.date()]).optional().transform(val => val ? new Date(val) : undefined),
    from_Sch_Time: zod_1.z.union([zod_1.z.string(), zod_1.z.date()]).optional().transform(val => val ? new Date(val) : undefined),
    to_Sch_Time: zod_1.z.union([zod_1.z.string(), zod_1.z.date()]).optional().transform(val => val ? new Date(val) : undefined),
    from_EN_Time: zod_1.z.union([zod_1.z.string(), zod_1.z.date()]).optional().transform(val => val ? new Date(val) : undefined),
    to_EN_Time: zod_1.z.union([zod_1.z.string(), zod_1.z.date()]).optional().transform(val => val ? new Date(val) : undefined),
    has_AN_No: zod_1.z.union([zod_1.z.string(), zod_1.z.boolean()]).optional().transform(val => val === 'true' || val === true),
    has_Assigned_Emp: zod_1.z.union([zod_1.z.string(), zod_1.z.boolean()]).optional().transform(val => val === 'true' || val === true),
    has_Task_Levl: zod_1.z.union([zod_1.z.string(), zod_1.z.boolean()]).optional().transform(val => val === 'true' || val === true),
    sortBy: zod_1.z.string().optional().default('Id').transform(val => {
        const fieldMap = {
            'Id': 'td.Id',
            'AN_No': 'td.AN_No',
            'Project_Id': 'td.Project_Id',
            'Sch_Id': 'td.Sch_Id',
            'Task_Id': 'td.Task_Id',
            'Task_Name': 't.Task_Name',
            'Emp_Id': 'td.Emp_Id',
            'Task_Assign_dt': 'td.Task_Assign_dt',
            'Sch_Time': 'td.Sch_Time',
            'EN_Time': 'td.EN_Time',
            'Invovled_Stat': 'td.Invovled_Stat',
            'Schedule_Task_Sch_Timer_Based': 'ps.Task_Sch_Timer_Based',
            'Schedule_Sch_No': 'ps.Sch_No',
            'Schedule_Sch_Date': 'ps.Sch_Date',
            'td.Id': 'td.Id',
            'td.AN_No': 'td.AN_No',
            'td.Project_Id': 'td.Project_Id',
            'td.Sch_Id': 'td.Sch_Id',
            'td.Task_Id': 'td.Task_Id',
            'td.Emp_Id': 'td.Emp_Id',
            'td.Task_Assign_dt': 'td.Task_Assign_dt',
            'td.Sch_Time': 'td.Sch_Time',
            'td.EN_Time': 'td.EN_Time',
            'td.Invovled_Stat': 'td.Invovled_Stat',
            'ps.Task_Sch_Timer_Based': 'ps.Task_Sch_Timer_Based',
            'ps.Sch_No': 'ps.Sch_No',
            'ps.Sch_Date': 'ps.Sch_Date',
            't.Task_Name': 't.Task_Name'
        };
        return fieldMap[val] || 'td.Id';
    }),
    sortOrder: zod_1.z.enum(['ASC', 'DESC']).optional().default('DESC'),
    search: zod_1.z.string().optional(),
    export: zod_1.z.union([zod_1.z.string(), zod_1.z.boolean()]).optional().transform(val => val === 'true' || val === true)
});
exports.taskDetailIdSchema = zod_1.z.object({
    id: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).transform(val => Number(val))
});
// Default export for backward compatibility
const sequalizer_1 = require("../../config/sequalizer");
const defaultTaskDetailModel = initTaskDetailModel((0, sequalizer_1.getDefaultConnection)());
exports.default = defaultTaskDetailModel;
