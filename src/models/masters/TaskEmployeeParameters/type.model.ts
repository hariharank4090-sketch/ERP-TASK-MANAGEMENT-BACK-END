import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { z } from 'zod';
import { sequelize as defaultSequelize } from '../../../config/sequalizer';

const modelName = 'Task_Paramet_DT';

// Interface for Task Parameter Detail attributes
export interface TaskParametDTAtrributes {
    PA_Id: number;
    Task_Id: number;
    Param_Id: number;
    Paramet_Data_Type: string | null;
    Paramet_Name?: string | null; // From tbl_Paramet_Master
    Para_Display_Name?: string | null; // From tbl_Paramet_Data_Type
}

// Type for creation (PA_Id is optional as it's auto-generated)
export type TaskParametDTCreationAttributes = Optional<TaskParametDTAtrributes, 'PA_Id'>;

// Extended interface with joined data
export interface TaskParametDTWithDetails extends TaskParametDTAtrributes {
    Paramet_Name: string | null;
    Para_Display_Name: string | null;
}

// Zod schemas for validation
export const TaskParametDTCreationSchema = z.object({
    Task_Id: z.number()
        .int('Task_Id must be an integer')
        .positive('Task_Id must be positive'),
    Param_Id: z.number()
        .int('Param_Id must be an integer')
        .positive('Param_Id must be positive'),
    Paramet_Data_Type: z.string()
        .nullable()
        .optional()
        .transform(val => val === undefined ? null : val)
});

export const TaskParametDTUpdateSchema = z.object({
    Task_Id: z.number()
        .int('Task_Id must be an integer')
        .positive('Task_Id must be positive')
        .optional(),
    Param_Id: z.number()
        .int('Param_Id must be an integer')
        .positive('Param_Id must be positive')
        .optional(),
    Paramet_Data_Type: z.string()
        .nullable()
        .optional()
        .transform(val => val === undefined ? null : val)
});

export const TaskParametDTQuerySchema = z.object({
    Task_Id: z.coerce.number().int().positive().optional(),
    Param_Id: z.coerce.number().int().positive().optional(),
    sortBy: z.enum(['PA_Id', 'Task_Id', 'Param_Id', 'Paramet_Name', 'Para_Display_Name'])
        .default('PA_Id'),
    sortOrder: z.enum(['ASC', 'DESC'])
        .default('ASC')
});

export const taskParametDTIdSchema = z.object({  
    id: z.coerce.number()
        .int()
        .positive('Valid PA_Id is required')
});

export type TaskParametDTCreate = z.infer<typeof TaskParametDTCreationSchema>;
export type TaskParametDTUpdate = z.infer<typeof TaskParametDTUpdateSchema>;
export type TaskParametDTQuery = z.infer<typeof TaskParametDTQuerySchema>;

// Model class definition (without initialization)
export class TaskParametDT
    extends Model<TaskParametDTAtrributes, TaskParametDTCreationAttributes>
    implements TaskParametDTAtrributes {
    
    declare PA_Id: number;
    declare Task_Id: number;
    declare Param_Id: number;
    declare Paramet_Data_Type: string | null;
}

// Function to initialize TaskParametDT model with a specific Sequelize instance
export function initTaskParametDTModel(sequelize: Sequelize): typeof TaskParametDT {
    TaskParametDT.init(
        {
            PA_Id: { 
                type: DataTypes.INTEGER, 
                autoIncrement: true,
                primaryKey: true,
                field: 'PA_Id'
            },
            Task_Id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'Task_Id',
                validate: {
                    notEmpty: true
                }
            },
            Param_Id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'Param_Id',
                validate: {
                    notEmpty: true
                }
            },
            Paramet_Data_Type: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'Paramet_Data_Type'
            }
        },
        {
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
        }
    );
    
    return TaskParametDT;
}

// Helper function to format task parameter detail for response with joined data
export const formatTaskParametDTForResponse = (record: any) => {
    const recordData = record.get ? record.get({ plain: true }) : record;
    return recordData;
};

// Helper to get TaskParametDT model with the correct database connection
export const getTaskParametDTModel = (req: Request): typeof TaskParametDT => {
    const sequelize = (req as any).companyDB;
    if (!sequelize) {
        throw new Error('Database connection not available');
    }
    return initTaskParametDTModel(sequelize);
};

// Export default initialized model
export const TaskParametDTModel = initTaskParametDTModel(defaultSequelize);
export default TaskParametDTModel;

export const taskParametDTAccKey = {  
    PA_Id: `${modelName}.PA_Id`,
    Task_Id: `${modelName}.Task_Id`,
    Param_Id: `${modelName}.Param_Id`,
    Paramet_Data_Type: `${modelName}.Paramet_Data_Type`
};