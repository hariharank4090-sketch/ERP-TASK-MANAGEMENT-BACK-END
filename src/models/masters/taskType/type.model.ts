import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { z } from 'zod';

// Interface for TaskType attributes (matching actual database schema)
export interface TaskTypeAttributes {
  Task_Type_Id: number;
  Task_Type: string;
  Is_Reptative?: number | null;
  Hours_Duration?: number | null;
  Day_Duration?: number | null;
  TT_Del_Flag?: number | null;
  Project_Id?: number | null;
  Est_StartTime?: Date | null;
  Est_EndTime?: Date | null;
  Status?: number | null;
}

// Type for creation (Task_Type_Id is optional as it's auto-generated)
export type TaskTypeCreationAttributes = Optional<TaskTypeAttributes, 'Task_Type_Id'>;

// Zod schemas for validation
export const taskTypeCreateSchema = z.object({
  Task_Type: z.string()
    .min(1, 'Task type is required')
    .max(250, 'Task type must be 250 characters or less')
    .trim(),
  Is_Reptative: z.coerce.number()
    .int('Is_Reptative must be an integer')
    .min(0, 'Is_Reptative must be 0 or 1')
    .max(1, 'Is_Reptative must be 0 or 1')
    .optional()
    .nullable()
    .default(0),
  Hours_Duration: z.coerce.number()
    .int('Hours duration must be an integer')
    .min(0, 'Hours duration cannot be negative')
    .optional()
    .nullable()
    .default(null),
  Day_Duration: z.coerce.number()
    .int('Day duration must be an integer')
    .min(0, 'Day duration cannot be negative')
    .optional()
    .nullable()
    .default(null),
  Project_Id: z.coerce.number()
    .int('Project ID must be an integer')
    .positive('Project ID must be positive')
    .optional()
    .nullable()
    .default(null),
  Est_StartTime: z.union([z.string(), z.date()])
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
  Est_EndTime: z.union([z.string(), z.date()])
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
  Status: z.coerce.number()
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

export const taskTypeUpdateSchema = z.object({
  Task_Type: z.string()
    .min(1, 'Task type is required')
    .max(250, 'Task type must be 250 characters or less')
    .trim()
    .optional(),
  Is_Reptative: z.coerce.number()
    .int('Is_Reptative must be an integer')
    .min(0, 'Is_Reptative must be 0 or 1')
    .max(1, 'Is_Reptative must be 0 or 1')
    .optional()
    .nullable(),
  Hours_Duration: z.coerce.number()
    .int('Hours duration must be an integer')
    .min(0, 'Hours duration cannot be negative')
    .optional()
    .nullable(),
  Day_Duration: z.coerce.number()
    .int('Day duration must be an integer')
    .min(0, 'Day duration cannot be negative')
    .optional()
    .nullable(),
  Project_Id: z.coerce.number()
    .int('Project ID must be an integer')
    .positive('Project ID must be positive')
    .optional()
    .nullable(),
  Est_StartTime: z.union([z.string(), z.date()])
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
  Est_EndTime: z.union([z.string(), z.date()])
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
  Status: z.coerce.number()
    .int('Status must be an integer')
    .min(0, 'Status must be 0 or 1')
    .max(1, 'Status must be 0 or 1')
    .optional()
    .nullable(),
  TT_Del_Flag: z.coerce.number()
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

export const taskTypeIdSchema = z.object({
  id: z.coerce.number()
    .int('Task type ID must be an integer')
    .positive('Valid task type ID is required')
});

// Updated query schema without pagination
export const taskTypeQuerySchema = z.object({
  search: z.string()
    .optional()
    .nullable(),
  Task_Type: z.string()
    .optional()
    .nullable(),
  Project_Id: z.coerce.number()
    .int('Project ID must be an integer')
    .positive('Project ID must be positive')
    .optional()
    .nullable(),
  Status: z.coerce.number()
    .int('Status must be an integer')
    .min(0, 'Status must be 0 or 1')
    .max(1, 'Status must be 0 or 1')
    .optional()
    .nullable(),
  TT_Del_Flag: z.coerce.number()
    .int('TT_Del_Flag must be an integer')
    .min(0, 'TT_Del_Flag must be 0 or 1')
    .max(1, 'TT_Del_Flag must be 0 or 1')
    .optional()
    .nullable()
    .default(0),
  Is_Reptative: z.coerce.number()
    .int('Is_Reptative must be an integer')
    .min(0, 'Is_Reptative must be 0 or 1')
    .max(1, 'Is_Reptative must be 0 or 1')
    .optional()
    .nullable(),
  sortBy: z.enum([
    'Task_Type_Id',
    'Task_Type',
    'Project_Id',
    'Status'
  ])
    .default('Task_Type_Id')
    .optional(),
  sortOrder: z.enum(['ASC', 'DESC'])
    .default('DESC')
    .optional(),
});

// Type exports
export type TaskTypeCreateInput = z.infer<typeof taskTypeCreateSchema>;
export type TaskTypeUpdateInput = z.infer<typeof taskTypeUpdateSchema>;
export type TaskTypeQueryParams = z.infer<typeof taskTypeQuerySchema>;

// Helper functions for status conversion
export const getStatusText = (status: number | null): string => {
  if (status === 1) return 'Active';
  if (status === 0) return 'Inactive';
  return 'Unknown';
};

export const getDelFlagText = (delFlag: number | null): string => {
  if (delFlag === 1) return 'Deleted';
  if (delFlag === 0) return 'Active';
  return 'Unknown';
};

export const getReptativeText = (isReptative: number | null): string => {
  if (isReptative === 1) return 'Repetitive';
  if (isReptative === 0) return 'Non-Repetitive';
  return 'Unknown';
};

// Function to format task type for response
export const formatTaskTypeForResponse = (taskType: any) => {
  const taskTypeData = taskType.get ? taskType.get({ plain: true }) : taskType;
  
  return {
    ...taskTypeData,
    statusText: getStatusText(taskTypeData.Status),
    delFlagText: getDelFlagText(taskTypeData.TT_Del_Flag),
    isReptativeText: getReptativeText(taskTypeData.Is_Reptative)
  };
};

// Model class definition (without initialization)
export class TaskType extends Model<TaskTypeAttributes, TaskTypeCreationAttributes>
  implements TaskTypeAttributes {
  public Task_Type_Id!: number;
  public Task_Type!: string;
  public Is_Reptative!: number | null;
  public Hours_Duration!: number | null;
  public Day_Duration!: number | null;
  public TT_Del_Flag!: number | null;
  public Project_Id!: number | null;
  public Est_StartTime!: Date | null;
  public Est_EndTime!: Date | null;
  public Status!: number | null;
}

// Function to initialize TaskType model with a specific Sequelize instance
export function initTaskTypeModel(sequelize: Sequelize): typeof TaskType {
  TaskType.init(
    {
      Task_Type_Id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        field: 'Task_Type_Id'
      },
      Task_Type: {
        type: DataTypes.STRING(250),
        allowNull: false,
        field: 'Task_Type'
      },
      Is_Reptative: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'Is_Reptative',
        defaultValue: 0
      },
      Hours_Duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'Hours_Duration'
      },
      Day_Duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'Day_Duration'
      },
      TT_Del_Flag: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'TT_Del_Flag',
        defaultValue: 0
      },
      Project_Id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'Project_Id'
      },
      Est_StartTime: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'Est_StartTime'
      },
      Est_EndTime: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'Est_EndTime'
      },
      Status: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'Status',
        defaultValue: 1
      }
    },
    {
      sequelize,
      tableName: 'tbl_Task_Type',
      modelName: 'TaskType',
      timestamps: false,
      hooks: {
        beforeCreate: (taskType: TaskType) => {
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
    }
  );
  
  return TaskType;
}

// Default export for backward compatibility (uses default connection)
import { sequelize as defaultSequelize } from '../../../config/sequalizer';
export const TaskTypeModel = initTaskTypeModel(defaultSequelize);
export default TaskTypeModel;