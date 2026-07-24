import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { z } from 'zod';

const modelName = 'Task_Detail';

export interface TaskDetailAttributes {
  Id: number;
  AN_No?: number | null;
  Project_Id: number;
  Sch_Id: number;
  Task_Levl_Id?: number | null;
  Task_Id: number;
  Assigned_Emp_Id?: number | null;
  Emp_Id: number;
  Task_Assign_dt?: Date | null;
  Sch_Period?: string | null;
  Sch_Time?: Date | null;
  EN_Time?: Date | null;
  Ord_By?: number | null;
  Invovled_Stat?: number | null;
}

// Interface for joined data with schedule and task tables
export interface TaskDetailWithSchedule extends TaskDetailAttributes {
  Schedule_Task_Sch_Timer_Based?: number | null;
  Schedule_Sch_No?: string | null;
  Schedule_Sch_Date?: Date | null;
  Schedule_Task_Type_Id?: number | null;
  Schedule_Sch_Plan_Id?: number | null;
  Schedule_Sch_Start_Date?: Date | null;
  Schedule_Sch_End_Date?: Date | null;
  Schedule_Task_Sch_Duaration?: number | null;
  Schedule_Sch_Status?: number | null;
  // Added Task Name from tbl_Task
  Task_Name?: string | null;
  Task_Desc?: string | null;
  Task_Type_Id?: number | null;
}

export type TaskDetailCreationAttributes = Optional<TaskDetailAttributes, 'Id'>;

export class TaskDetail_Master extends Model<TaskDetailAttributes, TaskDetailCreationAttributes> {
  declare Id: number;
  declare AN_No: number | null;
  declare Project_Id: number;
  declare Sch_Id: number;
  declare Task_Levl_Id: number | null;
  declare Task_Id: number;
  declare Assigned_Emp_Id: number | null;
  declare Emp_Id: number;
  declare Task_Assign_dt: Date | null;
  declare Sch_Period: string | null;
  declare Sch_Time: Date | null;
  declare EN_Time: Date | null;
  declare Ord_By: number | null;
  declare Invovled_Stat: number | null;
}

// Factory function to initialize model with a specific database connection
export function initTaskDetailModel(sequelize: Sequelize): typeof TaskDetail_Master {
  TaskDetail_Master.init(
    {
      Id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
      },
      AN_No: {
        type: DataTypes.BIGINT,
        allowNull: true
      },
      Project_Id: {
        type: DataTypes.BIGINT,
        allowNull: false
      },
      Sch_Id: {
        type: DataTypes.BIGINT,
        allowNull: false
      },
      Task_Levl_Id: {
        type: DataTypes.BIGINT,
        allowNull: true
      },
      Task_Id: {
        type: DataTypes.BIGINT,
        allowNull: false
      },
      Assigned_Emp_Id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      Emp_Id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      Task_Assign_dt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      Sch_Period: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      Sch_Time: {
        type: DataTypes.DATE,
        allowNull: true
      },
      EN_Time: {
        type: DataTypes.DATE,
        allowNull: true
      },
      Ord_By: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      Invovled_Stat: {
        type: DataTypes.INTEGER,
        allowNull: true
      }
    },
    {
      sequelize,
      tableName: 'tbl_Task_Details',
      modelName,
      timestamps: false,
      freezeTableName: true
    }
  );
  
  return TaskDetail_Master;
}

// Schema for Create API
export const taskDetailCreateSchema = z.object({
  AN_No: z.union([z.number(), z.string(), z.null(), z.undefined()]).optional().transform(val => val ? Number(val) : null),
  Project_Id: z.union([z.number(), z.string()]).transform(val => Number(val)),
  Sch_Id: z.union([z.number(), z.string()]).transform(val => Number(val)),
  Task_Levl_Id: z.union([z.number(), z.string(), z.null(), z.undefined()]).optional().transform(val => val ? Number(val) : null),
  Task_Id: z.union([z.number(), z.string()]).transform(val => Number(val)),
  Assigned_Emp_Id: z.union([z.number(), z.string(), z.null(), z.undefined()]).optional().transform(val => val ? Number(val) : null),
  Emp_Ids: z.array(z.union([z.number(), z.string()])).min(1).max(100).transform(arr => arr.map(val => Number(val))),
  Sch_Period: z.string().max(50).optional().nullable(),
  Ord_By: z.union([z.number(), z.string(), z.null(), z.undefined()]).optional().transform(val => val ? Number(val) : null),
  Invovled_Stat: z.union([z.number(), z.string(), z.null(), z.undefined()]).optional().transform(val => val ? Number(val) : null),
  taskDates: z.array(z.string()).optional(),
  employeeDates: z.record(z.string(), z.array(z.string())).optional()
}).strict();

export type TaskDetailCreateInput = z.infer<typeof taskDetailCreateSchema>;

// Schema for Update API
export const taskDetailUpdateSchema = z.object({
  AN_No: z.union([z.number(), z.string(), z.null()]).optional().transform(val => val ? Number(val) : null),
  Project_Id: z.union([z.number(), z.string()]).optional().transform(val => val ? Number(val) : undefined),
  Sch_Id: z.union([z.number(), z.string()]).optional().transform(val => val ? Number(val) : undefined),
  Task_Levl_Id: z.union([z.number(), z.string(), z.null()]).optional().transform(val => val ? Number(val) : null),
  Task_Id: z.union([z.number(), z.string()]).optional().transform(val => val ? Number(val) : undefined),
  Assigned_Emp_Id: z.union([z.number(), z.string(), z.null()]).optional().transform(val => val ? Number(val) : null),
  Emp_Id: z.union([z.number(), z.string()]).optional().transform(val => val ? Number(val) : undefined),
  Task_Assign_dt: z.union([
    z.string().transform(val => new Date(val)),
    z.date(),
    z.null()
  ]).optional(),
  Sch_Period: z.string().max(50).optional().nullable(),
  Sch_Time: z.union([z.string(), z.date(), z.null()]).optional().transform(val => val ? new Date(val) : null),
  EN_Time: z.union([z.string(), z.date(), z.null()]).optional().transform(val => val ? new Date(val) : null),
  Ord_By: z.union([z.number(), z.string(), z.null()]).optional().transform(val => val ? Number(val) : null),
  Invovled_Stat: z.union([z.number(), z.string(), z.null()]).optional().transform(val => val ? Number(val) : null),
  taskDates: z.array(z.string()).optional()
}).strict().partial();

export type TaskDetailUpdateInput = z.infer<typeof taskDetailUpdateSchema>;

// Schema for Bulk Update
export const taskDetailBulkUpdateSchema = z.object({
  projectId: z.union([z.number(), z.string()]).transform(val => Number(val)),
  schId: z.union([z.number(), z.string()]).transform(val => Number(val)),
  taskId: z.union([z.number(), z.string()]).transform(val => Number(val)),
  empId: z.union([z.number(), z.string()]).transform(val => Number(val)),
  Ord_By: z.union([z.number(), z.string(), z.null()]).optional().transform(val => val ? Number(val) : null),
  Invovled_Stat: z.union([z.number(), z.string(), z.null()]).optional().transform(val => val ? Number(val) : null)
}).strict();

export type TaskDetailBulkUpdateInput = z.infer<typeof taskDetailBulkUpdateSchema>;

// Query schema without pagination
export const taskDetailQuerySchema = z.object({
  Id: z.union([z.string(), z.number()]).optional().transform(val => val ? Number(val) : undefined),
  AN_No: z.union([z.string(), z.number()]).optional().transform(val => val ? Number(val) : undefined),
  Project_Id: z.union([z.string(), z.number()]).optional().transform(val => val ? Number(val) : undefined),
  Project_Name: z.union([z.string(), z.number()]).optional().transform(val => val ? String(val) : undefined),
  Sch_Id: z.union([z.string(), z.number()]).optional().transform(val => val ? Number(val) : undefined),
  Task_Levl_Id: z.union([z.string(), z.number()]).optional().transform(val => val ? Number(val) : undefined),
  Task_Id: z.union([z.string(), z.number()]).optional().transform(val => val ? Number(val) : undefined),
  Task_Name: z.union([z.string(), z.number()]).optional().transform(val => val ? String(val) : undefined),
  Assigned_Emp_Id: z.union([z.string(), z.number()]).optional().transform(val => val ? Number(val) : undefined),
  Emp_Id: z.union([z.string(), z.number()]).optional().transform(val => val ? Number(val) : undefined),
  Invovled_Stat: z.union([z.string(), z.number()]).optional().transform(val => val ? Number(val) : undefined),
  Ord_By: z.union([z.string(), z.number()]).optional().transform(val => val ? Number(val) : undefined),
  
  Ids: z.union([
    z.string().transform(str => str.split(',').map(Number)),
    z.array(z.union([z.string(), z.number()])).transform(arr => arr.map(val => Number(val))),
    z.undefined()
  ]).optional(),
  
  Project_Ids: z.union([
    z.string().transform(str => str.split(',').map(Number)),
    z.array(z.union([z.string(), z.number()])).transform(arr => arr.map(val => Number(val))),
    z.undefined()
  ]).optional(),
  
  Task_Ids: z.union([
    z.string().transform(str => str.split(',').map(Number)),
    z.array(z.union([z.string(), z.number()])).transform(arr => arr.map(val => Number(val))),
    z.undefined()
  ]).optional(),
  
  Emp_Ids: z.union([
    z.string().transform(str => str.split(',').map(Number)),
    z.array(z.union([z.string(), z.number()])).transform(arr => arr.map(val => Number(val))),
    z.undefined()
  ]).optional(),
  
  from_Task_Assign_dt: z.union([z.string(), z.date()]).optional().transform(val => val ? new Date(val) : undefined),
  to_Task_Assign_dt: z.union([z.string(), z.date()]).optional().transform(val => val ? new Date(val) : undefined),
  
  from_Sch_Time: z.union([z.string(), z.date()]).optional().transform(val => val ? new Date(val) : undefined),
  to_Sch_Time: z.union([z.string(), z.date()]).optional().transform(val => val ? new Date(val) : undefined),
  
  from_EN_Time: z.union([z.string(), z.date()]).optional().transform(val => val ? new Date(val) : undefined),
  to_EN_Time: z.union([z.string(), z.date()]).optional().transform(val => val ? new Date(val) : undefined),
  
  has_AN_No: z.union([z.string(), z.boolean()]).optional().transform(val => val === 'true' || val === true),
  has_Assigned_Emp: z.union([z.string(), z.boolean()]).optional().transform(val => val === 'true' || val === true),
  has_Task_Levl: z.union([z.string(), z.boolean()]).optional().transform(val => val === 'true' || val === true),
  
  sortBy: z.string().optional().default('Id').transform(val => {
    const fieldMap: { [key: string]: string } = {
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
  
  sortOrder: z.enum(['ASC', 'DESC']).optional().default('DESC'),
  
  search: z.string().optional(),
  
  export: z.union([z.string(), z.boolean()]).optional().transform(val => val === 'true' || val === true)
});

export type TaskDetailQueryParams = z.infer<typeof taskDetailQuerySchema>;

export const taskDetailIdSchema = z.object({
  id: z.union([z.number(), z.string()]).transform(val => Number(val))
});

// Default export for backward compatibility
import { getDefaultConnection } from '../../config/sequalizer';
const defaultTaskDetailModel = initTaskDetailModel(getDefaultConnection());
export default defaultTaskDetailModel;