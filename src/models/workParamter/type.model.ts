import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { z } from "zod";

export interface WorkParameterAttributes {
    WNo: number;
    Work_Id: number;
    Task_Id: number;
    Param_Id: number;
    Default_Value?: string | null;
    Current_Value?: string | null;
}

// Make WNo optional during creation since it's auto-increment
export interface WorkParameterCreationAttributes extends Optional<WorkParameterAttributes, 'WNo'> {}

// Zod schemas
export const workParameterCreateSchema = z.object({
    Work_Id: z.number().positive('Work ID must be a positive number'),
    Task_Id: z.number().positive('Task ID must be a positive number'),
    Param_Id: z.number().positive('Parameter ID must be a positive number'),
    Default_Value: z.string().optional().nullable(),
    Current_Value: z.string().optional().nullable()
});

export const workParameterUpdateSchema = z.object({
    Work_Id: z.number().positive().optional(),
    Task_Id: z.number().positive().optional(),
    Param_Id: z.number().positive().optional(),
    Default_Value: z.string().optional().nullable(),
    Current_Value: z.string().optional().nullable()
});

export const workParameterQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().optional(),
    workId: z.coerce.number().positive().optional(),
    taskId: z.coerce.number().positive().optional(),
    paramId: z.coerce.number().positive().optional(),
    sortBy: z.enum(['Work_Id', 'Param_Id', 'Task_Id', 'WNo']).default('Work_Id'),
    sortOrder: z.enum(['ASC', 'DESC']).default('ASC')
});

export const workParameterIdSchema = z.object({
    id: z.coerce.number().int().positive('Valid ID is required')
});

export type WorkParameterCreateInput = z.infer<typeof workParameterCreateSchema>;
export type WorkParameterUpdateInput = z.infer<typeof workParameterUpdateSchema>;
export type WorkParameterQueryParams = z.infer<typeof workParameterQuerySchema>;

// WorkParameter Model Class
export class WorkParameter extends Model<WorkParameterAttributes, WorkParameterCreationAttributes> implements WorkParameterAttributes {
    declare WNo: number;
    declare Work_Id: number;
    declare Task_Id: number;
    declare Param_Id: number;
    declare Default_Value: string | null;
    declare Current_Value: string | null;
}

// Initialize model with specific sequelize instance
export function initializeWorkParameterModel(sequelize: Sequelize): typeof WorkParameter {
    WorkParameter.init(
        {
            WNo: {
                type: DataTypes.BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },
            Work_Id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                validate: {
                    notNull: { msg: 'Work_Id is required' }
                }
            },
            Task_Id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                validate: {
                    notNull: { msg: 'Task_Id is required' }
                }
            },
            Param_Id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                validate: {
                    notNull: { msg: 'Param_Id is required' }
                }
            },
            Default_Value: {
                type: DataTypes.STRING(500),
                allowNull: true,
            },
            Current_Value: {
                type: DataTypes.STRING(500),
                allowNull: true,
            },
        },
        {
            sequelize,
            tableName: 'tbl_Work_Paramet_DT',
            modelName: 'WorkParameter',
            timestamps: false,
            freezeTableName: true,
            indexes: [
                { unique: true, fields: ['Work_Id', 'Param_Id'] },
                { fields: ['Task_Id'] },
                { fields: ['Param_Id'] }
            ]
        }
    );
    return WorkParameter;
}