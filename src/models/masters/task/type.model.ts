import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { z } from 'zod';
import { sequelize as defaultSequelize } from '../../../config/sequalizer';

// Interface for Task attributes
export interface TaskAttributes {
  Task_Id: number;
  Task_Name: string;
  Task_Desc?: string | null;
  Company_Id?: number | null;
  Task_Type_Id: number;
  Entry_By: number;
  Entry_Date: Date;
  Update_By?: number | null;
  Update_Date?: Date | null;
  Project_Id?: number | null;
}

export interface ScheduleAttributes {
  Sch_Id: number;
  Sch_No: string;
  Sch_Date: Date;
  Task_Id: number;
  Task_Type_Id: number;
  Sch_Plan_Id: number;
  Sch_Start_Date: Date;
  Sch_End_Date: Date;
  Task_Sch_Timer_Based: boolean;
  Sch_Est_Start_Time: Date;
  Sch_Est_End_Time: Date;
  Task_Sch_Duaration: number;
  Sch_Status: string;
  Entry_By: number;
  Entry_Date: Date;
  Update_By?: number | null;
  Update_Date?: Date | null;
  Sch_Del_Flag: boolean;
}

// Extended Task interface with schedules
export interface TaskWithSchedules extends TaskAttributes {
  Schedules?: ScheduleAttributes[];
}

export type TaskCreationAttributes = Optional<TaskAttributes, 'Task_Id'>;
export type ScheduleCreationAttributes = Optional<ScheduleAttributes, 'Sch_Id'>;

// Zod schemas for validation (NO PAGINATION)
export const taskCreateSchema = z.object({
  Task_Name: z.string()
    .min(1, 'Task name is required')
    .max(255, 'Task name must be 255 characters or less')
    .trim(),
  Task_Desc: z.string()
    .max(1000, 'Task description must be 1000 characters or less')
    .trim()
    .optional()
    .nullable()
    .default(null),
  Company_Id: z.coerce.number()
    .int('Company ID must be an integer')
    .positive('Company ID must be positive')
    .optional()
    .nullable()
    .default(null),
  Task_Type_Id: z.coerce.number()
    .int('Task group ID must be an integer')
    .positive('Valid task group ID is required'),
  Project_Id: z.coerce.number()
    .int('Project ID must be an integer')
    .positive('Project ID must be positive')
    .optional()
    .nullable()
    .default(null),
});

export const taskUpdateSchema = z.object({
  Task_Name: z.string()
    .min(1, 'Task name is required')
    .max(255, 'Task name must be 255 characters or less')
    .trim()
    .optional(),
  Task_Desc: z.string()
    .max(1000, 'Task description must be 1000 characters or less')
    .trim()
    .optional()
    .nullable(),
  Company_Id: z.coerce.number()
    .int('Company ID must be an integer')
    .positive('Company ID must be positive')
    .optional()
    .nullable(),
  Task_Type_Id: z.coerce.number()
    .int('Task group ID must be an integer')
    .positive('Valid task group ID is required')
    .optional(),
  Project_Id: z.coerce.number()
    .int('Project ID must be an integer')
    .positive('Project ID must be positive')
    .optional()
    .nullable(),
});

export const taskIdSchema = z.object({
  id: z.coerce.number()
    .int('Task ID must be an integer')
    .positive('Valid task ID is required')
});

// Updated query schema without pagination
export const taskQuerySchema = z.object({
  Company_Id: z.coerce.number()
    .int('Company ID must be an integer')
    .positive('Company ID must be positive')
    .optional()
    .nullable(),
  Task_Type_Id: z.coerce.number()
    .int('Task group ID must be an integer')
    .positive('Task group ID must be positive')
    .optional(),
  Project_Id: z.coerce.number()
    .int('Project ID must be an integer')
    .positive('Project ID must be positive')
    .optional()
    .nullable(),
  search: z.string()
    .optional()
    .nullable(),
  sortBy: z.enum([
    'Task_Id',
    'Task_Name',
    'Entry_Date',
    'Update_Date',
    'Task_Type_Id'
  ])
    .default('Task_Id')
    .optional(),
  sortOrder: z.enum(['ASC', 'DESC'])
    .default('DESC')
    .optional(),
  includeSchedules: z.union([z.boolean(), z.string()])
    .transform(val => {
      if (typeof val === 'string') {
        return val === 'true' || val === '1';
      }
      return val === true;
    })
    .default(false)
    .optional(),
});

// Type exports
export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;
export type TaskQueryParams = z.infer<typeof taskQuerySchema>;

// Helper function to format task for response
export const formatTaskForResponse = (task: any) => {
  const taskData = task.get ? task.get({ plain: true }) : task;
  
  return {
    ...taskData
  };
};

// Model class definition (without initialization)
export class Task extends Model<TaskAttributes, TaskCreationAttributes>
  implements TaskAttributes {
  public Task_Id!: number;
  public Task_Name!: string;
  public Task_Desc!: string | null;
  public Company_Id!: number | null;
  public Task_Type_Id!: number;
  public Entry_By!: number;
  public Entry_Date!: Date;
  public Update_By!: number | null;
  public Update_Date!: Date | null;
  public Project_Id!: number | null;
}

// ProjectSchedule Model class
export class ProjectSchedule extends Model<ScheduleAttributes, ScheduleCreationAttributes>
  implements ScheduleAttributes {
  public Sch_Id!: number;
  public Sch_No!: string;
  public Sch_Date!: Date;
  public Task_Id!: number;
  public Task_Type_Id!: number;
  public Sch_Plan_Id!: number;
  public Sch_Start_Date!: Date;
  public Sch_End_Date!: Date;
  public Task_Sch_Timer_Based!: boolean;
  public Sch_Est_Start_Time!: Date;
  public Sch_Est_End_Time!: Date;
  public Task_Sch_Duaration!: number;
  public Sch_Status!: string;
  public Entry_By!: number;
  public Entry_Date!: Date;
  public Update_By!: number | null;
  public Update_Date!: Date | null;
  public Sch_Del_Flag!: boolean;
}

// Function to initialize Task model with a specific Sequelize instance
export function initTaskModel(sequelize: Sequelize): typeof Task {
  Task.init(
    {
      Task_Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'Task_Id'
      },
      Task_Name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'Task_Name'
      },
      Task_Desc: {
        type: DataTypes.STRING(1000),
        allowNull: true,
        field: 'Task_Desc'
      },
      Company_Id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'Company_Id'
      },
      Task_Type_Id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'Task_Type_Id'
      },
      Entry_By: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'Entry_By',
        defaultValue: 1
      },
      Entry_Date: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'Entry_Date',
        defaultValue: DataTypes.NOW
      },
      Update_By: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'Update_By'
      },
      Update_Date: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'Update_Date'
      },
      Project_Id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'Project_Id'
      }
    },
    {
      sequelize,
      tableName: 'tbl_Task',
      modelName: 'Task',
      timestamps: false,
      hooks: {
        beforeUpdate: (task: Task) => {
          task.Update_Date = new Date();
        },
        beforeCreate: (task: Task) => {
          if (!task.Entry_Date) {
            task.Entry_Date = new Date();
          }
        }
      }
    }
  );
  
  return Task;
}

// Function to initialize ProjectSchedule model with a specific Sequelize instance
export function initProjectScheduleModel(sequelize: Sequelize): typeof ProjectSchedule {
  ProjectSchedule.init(
    {
      Sch_Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'Sch_Id'
      },
      Sch_No: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'Sch_No'
      },
      Sch_Date: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'Sch_Date'
      },
      Task_Id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'Task_Id'
      },
      Task_Type_Id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'Task_Type_Id'
      },
      Sch_Plan_Id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'Sch_Plan_Id'
      },
      Sch_Start_Date: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'Sch_Start_Date'
      },
      Sch_End_Date: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'Sch_End_Date'
      },
      Task_Sch_Timer_Based: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'Task_Sch_Timer_Based'
      },
      Sch_Est_Start_Time: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'Sch_Est_Start_Time'
      },
      Sch_Est_End_Time: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'Sch_Est_End_Time'
      },
      Task_Sch_Duaration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'Task_Sch_Duaration'
      },
      Sch_Status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'Sch_Status'
      },
      Entry_By: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'Entry_By'
      },
      Entry_Date: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'Entry_Date',
        defaultValue: DataTypes.NOW
      },
      Update_By: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'Update_By'
      },
      Update_Date: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'Update_Date'
      },
      Sch_Del_Flag: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'Sch_Del_Flag',
        defaultValue: false
      }
    },
    {
      sequelize,
      tableName: 'tbl_Project_Schedule',
      modelName: 'ProjectSchedule',
      timestamps: false,
      hooks: {
        beforeCreate: (schedule: ProjectSchedule) => {
          if (!schedule.Entry_Date) {
            schedule.Entry_Date = new Date();
          }
          if (schedule.Sch_Del_Flag === undefined) {
            schedule.Sch_Del_Flag = false;
          }
        }
      }
    }
  );
  
  return ProjectSchedule;
}

// Define association function
export function defineTaskAssociations() {
  if (!(Task as any).associations?.Schedules) {
    Task.hasMany(ProjectSchedule, {
      foreignKey: 'Task_Id',
      as: 'Schedules'
    });
  }
  
  if (!(ProjectSchedule as any).associations?.Task) {
    ProjectSchedule.belongsTo(Task, {
      foreignKey: 'Task_Id',
      as: 'Task'
    });
  }
}

// Initialize with default sequelize
export const TaskModel = initTaskModel(defaultSequelize);
export const ProjectScheduleModel = initProjectScheduleModel(defaultSequelize);
defineTaskAssociations();

export default TaskModel;