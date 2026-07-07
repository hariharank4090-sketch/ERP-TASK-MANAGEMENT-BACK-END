"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userIdSchema = exports.userQuerySchema = exports.User = void 0;
const sequelize_1 = require("sequelize");
const zod_1 = require("zod");
const modelName = 'User';
class User extends sequelize_1.Model {
    // Method to get next available ID for specific database
    static async getNextId(sequelizeInstance) {
        try {
            const result = await sequelizeInstance.query('SELECT ISNULL(MAX(UserId), 0) + 1 as nextId FROM tbl_Users', {
                type: sequelize_1.QueryTypes.SELECT,
                raw: true
            });
            return result[0]?.nextId || 1;
        }
        catch (error) {
            console.error('Error getting next ID:', error);
            throw error;
        }
    }
    // Initialize model with specific sequelize instance
    static initialize(sequelizeInstance) {
        User.init({
            UserId: {
                type: sequelize_1.DataTypes.BIGINT,
                primaryKey: true,
                field: 'UserId',
                allowNull: false
            },
            Global_User_ID: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: true,
                field: 'Global_User_ID'
            },
            UserTypeId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                field: 'UserTypeId'
            },
            Name: {
                type: sequelize_1.DataTypes.STRING(200),
                allowNull: false,
                field: 'Name',
                validate: {
                    notEmpty: true
                }
            },
            UserName: {
                type: sequelize_1.DataTypes.STRING(50),
                allowNull: false,
                field: 'UserName',
                validate: {
                    notEmpty: true
                }
            },
            Password: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: false,
                field: 'Password',
                validate: {
                    notEmpty: true
                }
            },
            Company_Id: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                field: 'Company_Id'
            },
            BranchId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                field: 'BranchId'
            },
            UDel_Flag: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                field: 'UDel_Flag',
                defaultValue: false
            },
            Autheticate_Id: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: true,
                field: 'Autheticate_Id'
            }
        }, {
            sequelize: sequelizeInstance,
            tableName: 'tbl_Users',
            modelName: modelName,
            timestamps: false,
            freezeTableName: true
        });
        return User;
    }
}
exports.User = User;
// Zod schemas for GET operations only
exports.userQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number()
        .int()
        .positive()
        .default(1),
    limit: zod_1.z.coerce.number()
        .int()
        .min(1)
        .max(100)
        .default(20),
    search: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(['UserId', 'Name', 'UserName', 'UserTypeId', 'Company_Id', 'BranchId'])
        .default('UserId'),
    sortOrder: zod_1.z.enum(['ASC', 'DESC'])
        .default('ASC'),
    companyId: zod_1.z.coerce.number().int().positive().optional(),
    branchId: zod_1.z.coerce.number().int().positive().optional(),
    userTypeId: zod_1.z.coerce.number().int().positive().optional(),
    activeOnly: zod_1.z.coerce.boolean().default(true)
});
exports.userIdSchema = zod_1.z.object({
    id: zod_1.z.coerce.number()
        .int()
        .positive('Valid User ID is required')
});
