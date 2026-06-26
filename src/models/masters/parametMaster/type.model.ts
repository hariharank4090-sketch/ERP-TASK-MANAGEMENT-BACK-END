import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { z } from 'zod';

const modelName = 'Param_Master';

export interface ParamMasterAttributes {
    Paramet_Id: number;
    Paramet_Name: string;
    Paramet_Data_Type: number | null;
    Company_id: number | null;
    Del_Flag: number;
}

type ParamMasterCreationAttributes = Optional<ParamMasterAttributes, 'Paramet_Id'>;

// Zod schemas for validation
export const ParamMasterCreationSchema = z.object({
    Paramet_Name: z.string()
        .min(1, 'Parameter name is required')
        .max(250, 'Parameter name cannot exceed 250 characters')
        .trim(),
    Paramet_Data_Type: z.coerce.number()
        .int('Data type must be an integer')
        .nullable()
        .optional()
        .default(null),
    Company_id: z.coerce.number()
        .int('Company ID must be an integer')
        .positive('Company ID must be positive')
        .nullable()
        .optional()
        .default(null)
});

export const ParamMasterUpdateSchema = z.object({
    Paramet_Name: z.string()
        .min(1, 'Parameter name is required')
        .max(250, 'Parameter name cannot exceed 250 characters')
        .trim()
        .optional(),
    Paramet_Data_Type: z.coerce.number()
        .int('Data type must be an integer')
        .nullable()
        .optional(),
    Company_id: z.coerce.number()
        .int('Company ID must be an integer')
        .positive('Company ID must be positive')
        .nullable()
        .optional(),
    Del_Flag: z.coerce.number()
        .int('Delete flag must be an integer')
        .min(0, 'Delete flag must be 0 or 1')
        .max(1, 'Delete flag must be 0 or 1')
        .optional()
        .nullable()
});

// Updated query schema without pagination
export const ParamMasterQuerySchema = z.object({
    search: z.string()
        .optional()
        .nullable(),
    companyId: z.coerce.number()
        .int('Company ID must be an integer')
        .positive('Company ID must be positive')
        .optional()
        .nullable(),
    sortBy: z.enum([
        'Paramet_Id',
        'Paramet_Name',
        'Paramet_Data_Type',
        'Company_id'
    ])
        .default('Paramet_Id')
        .optional(),
    sortOrder: z.enum(['ASC', 'DESC'])
        .default('ASC')
        .optional(),
});

export const paramMasterIdSchema = z.object({
    id: z.coerce.number()
        .int('Parameter ID must be an integer')
        .positive('Valid parameter ID is required')
});

// TypeScript types from Zod schemas
export type ParamMasterCreate = z.infer<typeof ParamMasterCreationSchema>;
export type ParamMasterUpdate = z.infer<typeof ParamMasterUpdateSchema>;
export type ParamMasterQuery = z.infer<typeof ParamMasterQuerySchema>;

// Helper functions for status conversion
export const getDelFlagText = (delFlag: number | null): string => {
    if (delFlag === 1) return 'Deleted';
    if (delFlag === 0) return 'Active';
    return 'Unknown';
};

// Function to format parameter master for response
export const formatParamMasterForResponse = (paramMaster: any) => {
    const paramMasterData = paramMaster.get ? paramMaster.get({ plain: true }) : paramMaster;
    
    return {
        ...paramMasterData,
        delFlagText: getDelFlagText(paramMasterData.Del_Flag)
    };
};

// Model class definition
export class ParamMaster extends Model<ParamMasterAttributes, ParamMasterCreationAttributes>
    implements ParamMasterAttributes {
    
    declare Paramet_Id: number;
    declare Paramet_Name: string;
    declare Paramet_Data_Type: number | null;
    declare Company_id: number | null;
    declare Del_Flag: number;
}

// Function to initialize ParamMaster model with a specific Sequelize instance
export function initParamMasterModel(sequelize: Sequelize): typeof ParamMaster {
    ParamMaster.init(
        {
            Paramet_Id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                field: 'Paramet_Id'
            },
            Paramet_Name: {
                type: DataTypes.STRING(250),
                allowNull: false,
                field: 'Paramet_Name',
                validate: {
                    notEmpty: true
                }
            },
            Paramet_Data_Type: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'Paramet_Data_Type'
            },
            Company_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'Company_id'
            },
            Del_Flag: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                field: 'Del_Flag',
                validate: {
                    min: 0,
                    max: 1
                }
            }
        },
        {
            sequelize,
            tableName: 'tbl_Paramet_Master',
            modelName: modelName,
            timestamps: false,
            freezeTableName: true,
            hooks: {
                beforeCreate: (paramMaster: ParamMaster) => {
                    if (paramMaster.Del_Flag === undefined || paramMaster.Del_Flag === null) {
                        paramMaster.Del_Flag = 0;
                    }
                }
            }
        }
    );
    
    return ParamMaster;
}

// Default export for backward compatibility
import { sequelize as defaultSequelize } from '../../../config/sequalizer';
export const ParamMasterModel = initParamMasterModel(defaultSequelize);
export default ParamMasterModel;