"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.branchIdSchema = exports.branchQuerySchema = exports.branchUpdateSchema = exports.branchCreateSchema = exports.Branch_Master = void 0;
exports.initBranchModel = initBranchModel;
const sequelize_1 = require("sequelize");
const zod_1 = require("zod");
const modelName = 'Branch_Master';
class Branch_Master extends sequelize_1.Model {
}
exports.Branch_Master = Branch_Master;
function initBranchModel(sequelize) {
    Branch_Master.init({
        BranchId: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            field: 'BranchId'
        },
        Company_id: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'Company_id'
        },
        BranchCode: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            field: 'BranchCode'
        },
        BranchName: {
            type: sequelize_1.DataTypes.STRING(250),
            allowNull: true,
            field: 'BranchName'
        },
        Tele_Code: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: true,
            field: 'Tele_Code'
        },
        BranchTel1: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            field: 'BranchTel1'
        },
        Tele1_Code: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: true,
            field: 'Tele1_Code'
        },
        BranchTel: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            field: 'BranchTel'
        },
        BranchAddress: {
            type: sequelize_1.DataTypes.STRING(500),
            allowNull: true,
            field: 'BranchAddress'
        },
        E_Mail: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            field: 'E_Mail'
        },
        BranchCity: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            field: 'BranchCity'
        },
        BranchCountry: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            field: 'BranchCountry'
        },
        BranchIncharge: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            field: 'BranchIncharge'
        },
        BranchIncMobile: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            field: 'BranchIncMobile'
        },
        Pin_Code: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: true,
            field: 'Pin_Code'
        },
        State: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            field: 'State'
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
            field: 'Del_Flag'
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
        tableName: 'tbl_Branch_Master',
        modelName: modelName,
        timestamps: false,
        freezeTableName: true,
        defaultScope: {
            where: {
                Del_Flag: 0
            }
        }
    });
    return Branch_Master;
}
exports.branchCreateSchema = zod_1.z.object({
    Company_id: zod_1.z.coerce.number().optional(),
    BranchCode: zod_1.z.string().max(50).trim().optional(),
    BranchName: zod_1.z.string().max(250).trim().optional(),
    Tele_Code: zod_1.z.string().max(20).optional(),
    BranchTel1: zod_1.z.string().max(50).optional(),
    Tele1_Code: zod_1.z.string().max(20).optional(),
    BranchTel: zod_1.z.string().max(50).optional(),
    BranchAddress: zod_1.z.string().max(500).optional(),
    E_Mail: zod_1.z.string().email('Invalid email').max(100).optional().or(zod_1.z.literal('')),
    BranchCity: zod_1.z.string().max(100).optional(),
    BranchCountry: zod_1.z.string().max(100).optional(),
    BranchIncharge: zod_1.z.string().max(100).optional(),
    BranchIncMobile: zod_1.z.string().max(50).optional(),
    Pin_Code: zod_1.z.string().max(20).optional(),
    State: zod_1.z.string().max(100).optional(),
    Del_Flag: zod_1.z.coerce.number().optional()
});
exports.branchUpdateSchema = exports.branchCreateSchema.partial();
exports.branchQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    search: zod_1.z.string().optional(),
    sortBy: zod_1.z.string().default('BranchId'),
    sortOrder: zod_1.z.enum(['ASC', 'DESC']).default('ASC')
});
exports.branchIdSchema = zod_1.z.object({
    id: zod_1.z.coerce.number().int().positive('Valid ID is required')
});
