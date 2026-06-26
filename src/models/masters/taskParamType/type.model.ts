import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { z } from 'zod';

const modelName = 'ParametDataType';

export interface ParametDataTypeAttributes {
    Para_Data_Type_Id: number;
    Para_Data_Type: string;
    Para_Display_Name: string | null;
}

type ParametDataTypeCreationAttributes = Optional<ParametDataTypeAttributes, 'Para_Data_Type_Id'>;

// Zod schemas for validation
export const ParametDataTypeCreationSchema = z.object({
    Para_Data_Type: z.string()
        .min(1, 'Parameter data type is required')
        .max(250, 'Parameter data type cannot exceed 250 characters')
        .trim(),
    Para_Display_Name: z.string()
        .max(250, 'Display name cannot exceed 250 characters')
        .nullable()
        .optional()
        .default(null)
});

export const ParametDataTypeUpdateSchema = z.object({
    Para_Data_Type: z.string()
        .min(1, 'Parameter data type is required')
        .max(250, 'Parameter data type cannot exceed 250 characters')
        .trim()
        .optional(),
    Para_Display_Name: z.string()
        .max(250, 'Display name cannot exceed 250 characters')
        .nullable()
        .optional()
});

// Updated query schema with CORRECT sort fields for this table
export const ParametDataTypeQuerySchema = z.object({
    Para_Data_Type: z.string()
        .optional()
        .nullable(),
    sortBy: z.enum([
        'Para_Data_Type_Id',
        'Para_Data_Type',
        'Para_Display_Name'
    ])
        .default('Para_Data_Type_Id')
        .optional(),
    sortOrder: z.enum(['ASC', 'DESC'])
        .default('ASC')
        .optional(),
});

export const parametDataTypeIdSchema = z.object({
    id: z.coerce.number()
        .int('Parameter data type ID must be an integer')
        .positive('Valid parameter data type ID is required')
});

// TypeScript types from Zod schemas
export type ParametDataTypeCreate = z.infer<typeof ParametDataTypeCreationSchema>;
export type ParametDataTypeUpdate = z.infer<typeof ParametDataTypeUpdateSchema>;
export type ParametDataTypeQuery = z.infer<typeof ParametDataTypeQuerySchema>;

// Helper functions
export const formatParametDataTypeForResponse = (parametDataType: any) => {
    const parametDataTypeData = parametDataType.get ? parametDataType.get({ plain: true }) : parametDataType;
    
    return {
        Para_Data_Type_Id: parametDataTypeData.Para_Data_Type_Id,
        Para_Data_Type: parametDataTypeData.Para_Data_Type,
        Para_Display_Name: parametDataTypeData.Para_Display_Name
    };
};

// Model class definition
export class ParametDataType extends Model<ParametDataTypeAttributes, ParametDataTypeCreationAttributes>
    implements ParametDataTypeAttributes {
    
    declare Para_Data_Type_Id: number;
    declare Para_Data_Type: string;
    declare Para_Display_Name: string | null;
}

// Function to initialize ParametDataType model with a specific Sequelize instance
export function initParametDataTypeModel(sequelize: Sequelize): typeof ParametDataType {
    ParametDataType.init(
        {
            Para_Data_Type_Id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                field: 'Para_Data_Type_Id'
            },
            Para_Data_Type: {
                type: DataTypes.STRING(250),
                allowNull: false,
                field: 'Para_Data_Type',
                validate: {
                    notEmpty: true
                }
            },
            Para_Display_Name: {
                type: DataTypes.STRING(250),
                allowNull: true,
                field: 'Para_Display_Name'
            }
        },
        {
            sequelize,
            tableName: 'tbl_Paramet_Data_Type',
            modelName: modelName,
            timestamps: false,
            freezeTableName: true,
            hooks: {
                beforeCreate: (parametDataType: ParametDataType) => {
                    if (parametDataType.Para_Display_Name === undefined || parametDataType.Para_Display_Name === null) {
                        parametDataType.Para_Display_Name = null;
                    }
                }
            }
        }
    );
    
    return ParametDataType;
}

// Default export for backward compatibility
import { sequelize as defaultSequelize } from '../../../config/sequalizer';
export const ParametDataTypeModel = initParametDataTypeModel(defaultSequelize);
export default ParametDataTypeModel;