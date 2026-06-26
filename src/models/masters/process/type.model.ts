import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { z } from 'zod';
import { sequelize as defaultSequelize } from '../../../config/sequalizer';

// Interface for Process Master attributes
export interface ProcessMasterAttributes {
    Id: number;
    Process_Name: string;
}

// Type for creation (Id is optional as it's auto-generated)
export type ProcessMasterCreationAttributes = Optional<ProcessMasterAttributes, 'Id'>;

// Zod schemas for validation
export const processMasterCreateSchema = z.object({
    Process_Name: z.string()
        .min(1, 'Process name is required')
        .max(250, 'Process name must be 250 characters or less')
        .trim()
});

export const processMasterUpdateSchema = z.object({
    Process_Name: z.string()
        .min(1, 'Process name is required')
        .max(250, 'Process name must be 250 characters or less')
        .trim()
        .optional()
});

export const processMasterIdSchema = z.object({
    id: z.coerce.number()
        .int('Process ID must be an integer')
        .positive('Valid process ID is required')
});

export const processMasterQuerySchema = z.object({
    page: z.coerce.number()
        .int('Page must be an integer')
        .positive('Page must be positive')
        .default(1)
        .optional(),
    limit: z.coerce.number()
        .int('Limit must be an integer')
        .min(1, 'Limit must be at least 1')
        .max(100, 'Limit cannot exceed 100')
        .default(20)
        .optional(),
    search: z.string()
        .optional()
        .nullable(),
    sortBy: z.enum(['Id', 'Process_Name'])
        .default('Id')
        .optional(),
    sortOrder: z.enum(['ASC', 'DESC'])
        .default('ASC')
        .optional(),
});

// Type exports
export type ProcessMasterCreateInput = z.infer<typeof processMasterCreateSchema>;
export type ProcessMasterUpdateInput = z.infer<typeof processMasterUpdateSchema>;
export type ProcessMasterQueryParams = z.infer<typeof processMasterQuerySchema>;

// Helper function to format process for response
export const formatProcessForResponse = (process: any) => {
    const processData = process.get ? process.get({ plain: true }) : process;
    return processData;
};

// Model class definition (without initialization)
export class Process_Master extends Model<ProcessMasterAttributes, ProcessMasterCreationAttributes>
    implements ProcessMasterAttributes {
    public Id!: number;
    public Process_Name!: string;
}

// Function to initialize Process Master model with a specific Sequelize instance
export function initProcessModel(sequelize: Sequelize): typeof Process_Master {
    Process_Master.init(
        {
            Id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                field: 'Id'
            },
            Process_Name: {
                type: DataTypes.STRING(250),
                allowNull: false,
                field: 'Process_Name'
            }
        },
        {
            sequelize,
            tableName: 'tbl_Process_Master',
            modelName: 'Process_Master',
            timestamps: false,
            hooks: {
                beforeValidate: (process: Process_Master) => {
                    if (process.Process_Name && typeof process.Process_Name === 'string') {
                        process.Process_Name = process.Process_Name.trim();
                    }
                }
            }
        }
    );

    return Process_Master;
}

export const ProcessMasterModel = initProcessModel(defaultSequelize);
export default ProcessMasterModel;