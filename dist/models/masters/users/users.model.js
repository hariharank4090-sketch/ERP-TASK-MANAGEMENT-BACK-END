"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.userUpdateSchema = exports.userCreateSchema = exports.UserMaster = void 0;
exports.initUserModel = initUserModel;
// src/models/masters/users/users.model.ts
const sequelize_1 = require("sequelize");
const zod_1 = require("zod");
const modelName = 'UserMaster';
class UserMaster extends sequelize_1.Model {
    UserId;
}
exports.UserMaster = UserMaster;
function initUserModel(sequelize) {
    UserMaster.init({
        Global_User_ID: {
            type: sequelize_1.DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
            field: 'Global_User_ID'
        },
        Local_User_ID: {
            type: sequelize_1.DataTypes.BIGINT,
            allowNull: true,
            field: 'Local_User_ID'
        },
        Company_Id: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'Company_Id'
        },
        Name: {
            type: sequelize_1.DataTypes.STRING(150),
            allowNull: true,
            field: 'Name'
        },
        Password: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true,
            field: 'Password'
        },
        UserTypeId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'UserTypeId'
        },
        UserName: {
            type: sequelize_1.DataTypes.STRING(150),
            allowNull: true,
            unique: true,
            field: 'UserName'
        },
        UDel_Flag: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            field: 'UDel_Flag'
        },
        Autheticate_Id: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            field: 'Autheticate_Id'
        },
        Created: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            field: 'Created',
            defaultValue: sequelize_1.DataTypes.NOW
        },
        Updated: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            field: 'Updated',
            defaultValue: sequelize_1.DataTypes.NOW
        },
    }, {
        sequelize,
        tableName: 'tbl_Users',
        modelName: modelName,
        timestamps: false,
        freezeTableName: true,
        schema: 'dbo',
        defaultScope: {
            attributes: { exclude: ['Password'] }
        }
    });
    return UserMaster;
}
exports.userCreateSchema = zod_1.z.object({
    UserTypeId: zod_1.z.number().optional(),
    Name: zod_1.z.string().min(4, "Name should be minimum 4 chars").optional(),
    UserName: zod_1.z.string().min(6, "User name should be minimum 6 chars").optional(),
    Password: zod_1.z.string().min(6, "Password should be minimum 6 chars").optional(),
    Global_User_ID: zod_1.z.number().optional(),
    Local_User_ID: zod_1.z.number().optional(),
    Company_Id: zod_1.z.number().optional(),
    Autheticate_Id: zod_1.z.string().optional(),
});
exports.userUpdateSchema = zod_1.z.object({
    UserTypeId: zod_1.z.number().optional(),
    Name: zod_1.z.string().min(4, "Name should be minimum 4 chars").optional(),
    UserName: zod_1.z.string().min(6, "User name should be minimum 6 chars").optional(),
    UDel_Flag: zod_1.z.number().optional(),
    Global_User_ID: zod_1.z.number().optional(),
    Local_User_ID: zod_1.z.number().optional(),
    Company_Id: zod_1.z.number().optional(),
    Autheticate_Id: zod_1.z.string().optional(),
    Password: zod_1.z.never().optional(),
});
exports.changePasswordSchema = zod_1.z.object({
    oldPassword: zod_1.z.string().min(1),
    newPassword: zod_1.z.string().min(6),
});
