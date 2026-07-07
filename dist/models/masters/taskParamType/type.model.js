"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParametDataTypeModel = exports.ParametDataType = exports.formatParametDataTypeForResponse = exports.parametDataTypeIdSchema = exports.ParametDataTypeQuerySchema = exports.ParametDataTypeUpdateSchema = exports.ParametDataTypeCreationSchema = void 0;
exports.initParametDataTypeModel = initParametDataTypeModel;
const sequelize_1 = require("sequelize");
const zod_1 = require("zod");
const modelName = 'ParametDataType';
// Zod schemas for validation
exports.ParametDataTypeCreationSchema = zod_1.z.object({
    Para_Data_Type: zod_1.z.string()
        .min(1, 'Parameter data type is required')
        .max(250, 'Parameter data type cannot exceed 250 characters')
        .trim(),
    Para_Display_Name: zod_1.z.string()
        .max(250, 'Display name cannot exceed 250 characters')
        .nullable()
        .optional()
        .default(null)
});
exports.ParametDataTypeUpdateSchema = zod_1.z.object({
    Para_Data_Type: zod_1.z.string()
        .min(1, 'Parameter data type is required')
        .max(250, 'Parameter data type cannot exceed 250 characters')
        .trim()
        .optional(),
    Para_Display_Name: zod_1.z.string()
        .max(250, 'Display name cannot exceed 250 characters')
        .nullable()
        .optional()
});
// Updated query schema with CORRECT sort fields for this table
exports.ParametDataTypeQuerySchema = zod_1.z.object({
    Para_Data_Type: zod_1.z.string()
        .optional()
        .nullable(),
    sortBy: zod_1.z.enum([
        'Para_Data_Type_Id',
        'Para_Data_Type',
        'Para_Display_Name'
    ])
        .default('Para_Data_Type_Id')
        .optional(),
    sortOrder: zod_1.z.enum(['ASC', 'DESC'])
        .default('ASC')
        .optional(),
});
exports.parametDataTypeIdSchema = zod_1.z.object({
    id: zod_1.z.coerce.number()
        .int('Parameter data type ID must be an integer')
        .positive('Valid parameter data type ID is required')
});
// Helper functions
const formatParametDataTypeForResponse = (parametDataType) => {
    const parametDataTypeData = parametDataType.get ? parametDataType.get({ plain: true }) : parametDataType;
    return {
        Para_Data_Type_Id: parametDataTypeData.Para_Data_Type_Id,
        Para_Data_Type: parametDataTypeData.Para_Data_Type,
        Para_Display_Name: parametDataTypeData.Para_Display_Name
    };
};
exports.formatParametDataTypeForResponse = formatParametDataTypeForResponse;
// Model class definition
class ParametDataType extends sequelize_1.Model {
}
exports.ParametDataType = ParametDataType;
// Function to initialize ParametDataType model with a specific Sequelize instance
function initParametDataTypeModel(sequelize) {
    ParametDataType.init({
        Para_Data_Type_Id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            field: 'Para_Data_Type_Id'
        },
        Para_Data_Type: {
            type: sequelize_1.DataTypes.STRING(250),
            allowNull: false,
            field: 'Para_Data_Type',
            validate: {
                notEmpty: true
            }
        },
        Para_Display_Name: {
            type: sequelize_1.DataTypes.STRING(250),
            allowNull: true,
            field: 'Para_Display_Name'
        }
    }, {
        sequelize,
        tableName: 'tbl_Paramet_Data_Type',
        modelName: modelName,
        timestamps: false,
        freezeTableName: true,
        hooks: {
            beforeCreate: (parametDataType) => {
                if (parametDataType.Para_Display_Name === undefined || parametDataType.Para_Display_Name === null) {
                    parametDataType.Para_Display_Name = null;
                }
            }
        }
    });
    return ParametDataType;
}
// Default export for backward compatibility
const sequalizer_1 = require("../../../config/sequalizer");
exports.ParametDataTypeModel = initParametDataTypeModel(sequalizer_1.sequelize);
exports.default = exports.ParametDataTypeModel;
