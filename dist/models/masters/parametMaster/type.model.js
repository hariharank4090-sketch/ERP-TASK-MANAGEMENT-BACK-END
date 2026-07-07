"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParamMasterModel = exports.ParamMaster = exports.formatParamMasterForResponse = exports.getDelFlagText = exports.paramMasterIdSchema = exports.ParamMasterQuerySchema = exports.ParamMasterUpdateSchema = exports.ParamMasterCreationSchema = void 0;
exports.initParamMasterModel = initParamMasterModel;
const sequelize_1 = require("sequelize");
const zod_1 = require("zod");
const modelName = 'Param_Master';
// Zod schemas for validation
exports.ParamMasterCreationSchema = zod_1.z.object({
    Paramet_Name: zod_1.z.string()
        .min(1, 'Parameter name is required')
        .max(250, 'Parameter name cannot exceed 250 characters')
        .trim(),
    Paramet_Data_Type: zod_1.z.coerce.number()
        .int('Data type must be an integer')
        .nullable()
        .optional()
        .default(null),
    Company_id: zod_1.z.coerce.number()
        .int('Company ID must be an integer')
        .positive('Company ID must be positive')
        .nullable()
        .optional()
        .default(null)
});
exports.ParamMasterUpdateSchema = zod_1.z.object({
    Paramet_Name: zod_1.z.string()
        .min(1, 'Parameter name is required')
        .max(250, 'Parameter name cannot exceed 250 characters')
        .trim()
        .optional(),
    Paramet_Data_Type: zod_1.z.coerce.number()
        .int('Data type must be an integer')
        .nullable()
        .optional(),
    Company_id: zod_1.z.coerce.number()
        .int('Company ID must be an integer')
        .positive('Company ID must be positive')
        .nullable()
        .optional(),
    Del_Flag: zod_1.z.coerce.number()
        .int('Delete flag must be an integer')
        .min(0, 'Delete flag must be 0 or 1')
        .max(1, 'Delete flag must be 0 or 1')
        .optional()
        .nullable()
});
// Updated query schema without pagination
exports.ParamMasterQuerySchema = zod_1.z.object({
    search: zod_1.z.string()
        .optional()
        .nullable(),
    companyId: zod_1.z.coerce.number()
        .int('Company ID must be an integer')
        .positive('Company ID must be positive')
        .optional()
        .nullable(),
    sortBy: zod_1.z.enum([
        'Paramet_Id',
        'Paramet_Name',
        'Paramet_Data_Type',
        'Company_id'
    ])
        .default('Paramet_Id')
        .optional(),
    sortOrder: zod_1.z.enum(['ASC', 'DESC'])
        .default('ASC')
        .optional(),
});
exports.paramMasterIdSchema = zod_1.z.object({
    id: zod_1.z.coerce.number()
        .int('Parameter ID must be an integer')
        .positive('Valid parameter ID is required')
});
// Helper functions for status conversion
const getDelFlagText = (delFlag) => {
    if (delFlag === 1)
        return 'Deleted';
    if (delFlag === 0)
        return 'Active';
    return 'Unknown';
};
exports.getDelFlagText = getDelFlagText;
// Function to format parameter master for response
const formatParamMasterForResponse = (paramMaster) => {
    const paramMasterData = paramMaster.get ? paramMaster.get({ plain: true }) : paramMaster;
    return {
        ...paramMasterData,
        delFlagText: (0, exports.getDelFlagText)(paramMasterData.Del_Flag)
    };
};
exports.formatParamMasterForResponse = formatParamMasterForResponse;
// Model class definition
class ParamMaster extends sequelize_1.Model {
}
exports.ParamMaster = ParamMaster;
// Function to initialize ParamMaster model with a specific Sequelize instance
function initParamMasterModel(sequelize) {
    ParamMaster.init({
        Paramet_Id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            field: 'Paramet_Id'
        },
        Paramet_Name: {
            type: sequelize_1.DataTypes.STRING(250),
            allowNull: false,
            field: 'Paramet_Name',
            validate: {
                notEmpty: true
            }
        },
        Paramet_Data_Type: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'Paramet_Data_Type'
        },
        Company_id: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'Company_id'
        },
        Del_Flag: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: 'Del_Flag',
            validate: {
                min: 0,
                max: 1
            }
        }
    }, {
        sequelize,
        tableName: 'tbl_Paramet_Master',
        modelName: modelName,
        timestamps: false,
        freezeTableName: true,
        hooks: {
            beforeCreate: (paramMaster) => {
                if (paramMaster.Del_Flag === undefined || paramMaster.Del_Flag === null) {
                    paramMaster.Del_Flag = 0;
                }
            }
        }
    });
    return ParamMaster;
}
// Default export for backward compatibility
const sequalizer_1 = require("../../../config/sequalizer");
exports.ParamMasterModel = initParamMasterModel(sequalizer_1.sequelize);
exports.default = exports.ParamMasterModel;
