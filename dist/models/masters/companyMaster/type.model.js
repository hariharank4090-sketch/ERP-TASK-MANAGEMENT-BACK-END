"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyAccKey = exports.companyIdSchema = exports.companyQuerySchema = exports.companyUpdateSchema = exports.companyCreateSchema = exports.Company_Master = void 0;
exports.initCompanyModel = initCompanyModel;
const sequelize_1 = require("sequelize");
const zod_1 = require("zod");
const modelName = 'Company_Master';
class Company_Master extends sequelize_1.Model {
}
exports.Company_Master = Company_Master;
// Function to initialize the model with a specific Sequelize instance
function initCompanyModel(sequelize) {
    Company_Master.init({
        Company_id: {
            type: sequelize_1.DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
            field: 'Company_id'
        },
        Company_Code: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            field: 'Company_Code',
            validate: {
                notEmpty: {
                    msg: 'Company Code is required'
                }
            }
        },
        Company_Name: {
            type: sequelize_1.DataTypes.STRING(250),
            allowNull: false,
            field: 'Company_Name',
            validate: {
                notEmpty: {
                    msg: 'Company Name is required'
                }
            }
        },
        Company_Address: {
            type: sequelize_1.DataTypes.STRING(500),
            allowNull: true,
            field: 'Company_Address'
        },
        State: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            field: 'State'
        },
        Region: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            field: 'Region'
        },
        Pincode: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: true,
            field: 'Pincode'
        },
        Country: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            field: 'Country'
        },
        VAT_TIN_Number: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            field: 'VAT_TIN_Number'
        },
        PAN_Number: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            field: 'PAN_Number'
        },
        CST_Number: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            field: 'CST_Number'
        },
        CIN_Number: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            field: 'CIN_Number'
        },
        Service_Tax_Number: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            field: 'Service_Tax_Number'
        },
        MSME_Number: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            field: 'MSME_Number'
        },
        NSIC_Number: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            field: 'NSIC_Number'
        },
        Account_Number: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            field: 'Account_Number'
        },
        IFC_Code: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: true,
            field: 'IFC_Code'
        },
        Bank_Branch_Name: {
            type: sequelize_1.DataTypes.STRING(200),
            allowNull: true,
            field: 'Bank_Branch_Name'
        },
        Bank_Name: {
            type: sequelize_1.DataTypes.STRING(200),
            allowNull: true,
            field: 'Bank_Name'
        },
        Telephone_Number: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: true,
            field: 'Telephone_Number'
        },
        Support_Number: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: true,
            field: 'Support_Number'
        },
        Mail: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            field: 'Mail',
            validate: {
                isEmail: {
                    msg: 'Invalid email format'
                }
            }
        },
        Website: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            field: 'Website'
        },
        Gst_Number: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            field: 'Gst_Number'
        },
        State_Code: {
            type: sequelize_1.DataTypes.STRING(10),
            allowNull: true,
            field: 'State_Code'
        },
        State_No: {
            type: sequelize_1.DataTypes.STRING(10),
            allowNull: true,
            field: 'State_No'
        },
        Entry_By: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'Entry_By'
        },
        Entry_Date: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            field: 'Entry_Date'
        },
        Modified_By: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'Modified_By'
        },
        Modified_Date: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            field: 'Modified_Date'
        },
        Del_Flag: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            field: 'Del_Flag',
            validate: {
                min: 0,
                max: 1,
                isIn: {
                    args: [[0, 1]],
                    msg: 'Del_Flag must be 0 or 1'
                }
            }
        },
        Deleted_By: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'Deleted_By'
        },
        Deleted_Date: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            field: 'Deleted_Date'
        }
    }, {
        sequelize,
        tableName: 'tbl_Company_Master',
        modelName: modelName,
        timestamps: false,
        freezeTableName: true,
        defaultScope: {
            where: {
                Del_Flag: 0
            }
        },
        scopes: {
            active: {
                where: {
                    Del_Flag: 0
                }
            },
            deleted: {
                where: {
                    Del_Flag: 1
                }
            },
            byState: (state) => ({
                where: {
                    State: state,
                    Del_Flag: 0
                }
            }),
            byCountry: (country) => ({
                where: {
                    Country: country,
                    Del_Flag: 0
                }
            })
        }
    });
    return Company_Master;
}
// Zod schemas
exports.companyCreateSchema = zod_1.z.object({
    Company_Code: zod_1.z.string()
        .min(1, 'Company Code is required')
        .max(50, 'Company Code cannot exceed 50 characters')
        .trim(),
    Company_Name: zod_1.z.string()
        .min(1, 'Company Name is required')
        .max(250, 'Company Name cannot exceed 250 characters')
        .trim(),
    Company_Address: zod_1.z.string()
        .max(500, 'Company Address cannot exceed 500 characters')
        .nullable()
        .optional()
        .default(null),
    State: zod_1.z.string()
        .max(100, 'State cannot exceed 100 characters')
        .nullable()
        .optional()
        .default(null),
    Region: zod_1.z.string()
        .max(100, 'Region cannot exceed 100 characters')
        .nullable()
        .optional()
        .default(null),
    Pincode: zod_1.z.string()
        .max(20, 'Pincode cannot exceed 20 characters')
        .nullable()
        .optional()
        .default(null),
    Country: zod_1.z.string()
        .max(100, 'Country cannot exceed 100 characters')
        .nullable()
        .optional()
        .default(null),
    VAT_TIN_Number: zod_1.z.string()
        .max(50, 'VAT/TIN Number cannot exceed 50 characters')
        .nullable()
        .optional()
        .default(null),
    PAN_Number: zod_1.z.string()
        .max(50, 'PAN Number cannot exceed 50 characters')
        .nullable()
        .optional()
        .default(null),
    CST_Number: zod_1.z.string()
        .max(50, 'CST Number cannot exceed 50 characters')
        .nullable()
        .optional()
        .default(null),
    CIN_Number: zod_1.z.string()
        .max(50, 'CIN Number cannot exceed 50 characters')
        .nullable()
        .optional()
        .default(null),
    Service_Tax_Number: zod_1.z.string()
        .max(50, 'Service Tax Number cannot exceed 50 characters')
        .nullable()
        .optional()
        .default(null),
    MSME_Number: zod_1.z.string()
        .max(50, 'MSME Number cannot exceed 50 characters')
        .nullable()
        .optional()
        .default(null),
    NSIC_Number: zod_1.z.string()
        .max(50, 'NSIC Number cannot exceed 50 characters')
        .nullable()
        .optional()
        .default(null),
    Account_Number: zod_1.z.string()
        .max(50, 'Account Number cannot exceed 50 characters')
        .nullable()
        .optional()
        .default(null),
    IFC_Code: zod_1.z.string()
        .max(20, 'IFC Code cannot exceed 20 characters')
        .nullable()
        .optional()
        .default(null),
    Bank_Branch_Name: zod_1.z.string()
        .max(200, 'Bank Branch Name cannot exceed 200 characters')
        .nullable()
        .optional()
        .default(null),
    Bank_Name: zod_1.z.string()
        .max(200, 'Bank Name cannot exceed 200 characters')
        .nullable()
        .optional()
        .default(null),
    Telephone_Number: zod_1.z.string()
        .max(20, 'Telephone Number cannot exceed 20 characters')
        .nullable()
        .optional()
        .default(null),
    Support_Number: zod_1.z.string()
        .max(20, 'Support Number cannot exceed 20 characters')
        .nullable()
        .optional()
        .default(null),
    Mail: zod_1.z.string()
        .email('Invalid email format')
        .max(100, 'Email cannot exceed 100 characters')
        .nullable()
        .optional()
        .default(null),
    Website: zod_1.z.string()
        .max(100, 'Website cannot exceed 100 characters')
        .nullable()
        .optional()
        .default(null),
    Gst_Number: zod_1.z.string()
        .max(50, 'GST Number cannot exceed 50 characters')
        .nullable()
        .optional()
        .default(null),
    State_Code: zod_1.z.string()
        .max(10, 'State Code cannot exceed 10 characters')
        .nullable()
        .optional()
        .default(null),
    State_No: zod_1.z.string()
        .max(10, 'State No cannot exceed 10 characters')
        .nullable()
        .optional()
        .default(null)
});
exports.companyUpdateSchema = zod_1.z.object({
    Company_Code: zod_1.z.string()
        .max(50, 'Company Code cannot exceed 50 characters')
        .trim()
        .optional(),
    Company_Name: zod_1.z.string()
        .max(250, 'Company Name cannot exceed 250 characters')
        .trim()
        .optional(),
    Company_Address: zod_1.z.string()
        .max(500, 'Company Address cannot exceed 500 characters')
        .nullable()
        .optional(),
    State: zod_1.z.string()
        .max(100, 'State cannot exceed 100 characters')
        .nullable()
        .optional(),
    Region: zod_1.z.string()
        .max(100, 'Region cannot exceed 100 characters')
        .nullable()
        .optional(),
    Pincode: zod_1.z.string()
        .max(20, 'Pincode cannot exceed 20 characters')
        .nullable()
        .optional(),
    Country: zod_1.z.string()
        .max(100, 'Country cannot exceed 100 characters')
        .nullable()
        .optional(),
    VAT_TIN_Number: zod_1.z.string()
        .max(50, 'VAT/TIN Number cannot exceed 50 characters')
        .nullable()
        .optional(),
    PAN_Number: zod_1.z.string()
        .max(50, 'PAN Number cannot exceed 50 characters')
        .nullable()
        .optional(),
    CST_Number: zod_1.z.string()
        .max(50, 'CST Number cannot exceed 50 characters')
        .nullable()
        .optional(),
    CIN_Number: zod_1.z.string()
        .max(50, 'CIN Number cannot exceed 50 characters')
        .nullable()
        .optional(),
    Service_Tax_Number: zod_1.z.string()
        .max(50, 'Service Tax Number cannot exceed 50 characters')
        .nullable()
        .optional(),
    MSME_Number: zod_1.z.string()
        .max(50, 'MSME Number cannot exceed 50 characters')
        .nullable()
        .optional(),
    NSIC_Number: zod_1.z.string()
        .max(50, 'NSIC Number cannot exceed 50 characters')
        .nullable()
        .optional(),
    Account_Number: zod_1.z.string()
        .max(50, 'Account Number cannot exceed 50 characters')
        .nullable()
        .optional(),
    IFC_Code: zod_1.z.string()
        .max(20, 'IFC Code cannot exceed 20 characters')
        .nullable()
        .optional(),
    Bank_Branch_Name: zod_1.z.string()
        .max(200, 'Bank Branch Name cannot exceed 200 characters')
        .nullable()
        .optional(),
    Bank_Name: zod_1.z.string()
        .max(200, 'Bank Name cannot exceed 200 characters')
        .nullable()
        .optional(),
    Telephone_Number: zod_1.z.string()
        .max(20, 'Telephone Number cannot exceed 20 characters')
        .nullable()
        .optional(),
    Support_Number: zod_1.z.string()
        .max(20, 'Support Number cannot exceed 20 characters')
        .nullable()
        .optional(),
    Mail: zod_1.z.string()
        .email('Invalid email format')
        .max(100, 'Email cannot exceed 100 characters')
        .nullable()
        .optional(),
    Website: zod_1.z.string()
        .max(100, 'Website cannot exceed 100 characters')
        .nullable()
        .optional(),
    Gst_Number: zod_1.z.string()
        .max(50, 'GST Number cannot exceed 50 characters')
        .nullable()
        .optional(),
    State_Code: zod_1.z.string()
        .max(10, 'State Code cannot exceed 10 characters')
        .nullable()
        .optional(),
    State_No: zod_1.z.string()
        .max(10, 'State No cannot exceed 10 characters')
        .nullable()
        .optional(),
    Del_Flag: zod_1.z.coerce.number()
        .int()
        .min(0, 'Del_Flag must be 0 or 1')
        .max(1, 'Del_Flag must be 0 or 1')
        .optional()
});
exports.companyQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number()
        .int()
        .positive('Page must be positive')
        .default(1),
    limit: zod_1.z.coerce.number()
        .int()
        .min(1, 'Limit must be at least 1')
        .max(100, 'Limit cannot exceed 100')
        .default(20),
    search: zod_1.z.string().optional(),
    state: zod_1.z.string().optional(),
    country: zod_1.z.string().optional(),
    active: zod_1.z.enum(['true', 'false', 'all'])
        .default('true'),
    sortBy: zod_1.z.enum([
        'Company_id',
        'Company_Code',
        'Company_Name',
        'State',
        'Country',
        'Entry_Date'
    ])
        .default('Company_id'),
    sortOrder: zod_1.z.enum(['ASC', 'DESC'])
        .default('ASC')
});
exports.companyIdSchema = zod_1.z.object({
    id: zod_1.z.coerce.number()
        .int()
        .positive('Valid ID is required')
});
exports.companyAccKey = {
    id: `${modelName}.Company_id`,
    Company_Code: `${modelName}.Company_Code`,
    Company_Name: `${modelName}.Company_Name`,
    Company_Address: `${modelName}.Company_Address`,
    State: `${modelName}.State`,
    Region: `${modelName}.Region`,
    Pincode: `${modelName}.Pincode`,
    Country: `${modelName}.Country`,
    VAT_TIN_Number: `${modelName}.VAT_TIN_Number`,
    PAN_Number: `${modelName}.PAN_Number`,
    CST_Number: `${modelName}.CST_Number`,
    CIN_Number: `${modelName}.CIN_Number`,
    Service_Tax_Number: `${modelName}.Service_Tax_Number`,
    MSME_Number: `${modelName}.MSME_Number`,
    NSIC_Number: `${modelName}.NSIC_Number`,
    Account_Number: `${modelName}.Account_Number`,
    IFC_Code: `${modelName}.IFC_Code`,
    Bank_Branch_Name: `${modelName}.Bank_Branch_Name`,
    Bank_Name: `${modelName}.Bank_Name`,
    Telephone_Number: `${modelName}.Telephone_Number`,
    Support_Number: `${modelName}.Support_Number`,
    Mail: `${modelName}.Mail`,
    Website: `${modelName}.Website`,
    Gst_Number: `${modelName}.Gst_Number`,
    State_Code: `${modelName}.State_Code`,
    State_No: `${modelName}.State_No`,
    Entry_By: `${modelName}.Entry_By`,
    Entry_Date: `${modelName}.Entry_Date`,
    Modified_By: `${modelName}.Modified_By`,
    Modified_Date: `${modelName}.Modified_Date`,
    Del_Flag: `${modelName}.Del_Flag`,
    Deleted_By: `${modelName}.Deleted_By`,
    Deleted_Date: `${modelName}.Deleted_Date`
};
exports.default = Company_Master;
