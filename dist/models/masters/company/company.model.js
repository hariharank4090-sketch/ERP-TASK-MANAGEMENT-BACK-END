"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyMaster = void 0;
exports.initCompanyModel = initCompanyModel;
// src/models/masters/company/company.model.ts
const sequelize_1 = require("sequelize");
const modelName = 'CompanyMaster';
class CompanyMaster extends sequelize_1.Model {
}
exports.CompanyMaster = CompanyMaster;
function initCompanyModel(sequelize) {
    CompanyMaster.init({
        Local_Comp_Id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            field: 'Local_Comp_Id'
        },
        Company_Name: {
            type: sequelize_1.DataTypes.STRING(150),
            allowNull: true,
            field: 'Company_Name'
        },
        DB_Name: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            field: 'DB_Name'
        },
        Address: {
            type: sequelize_1.DataTypes.STRING(500),
            allowNull: true,
            field: 'Address'
        },
        Phone: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            field: 'Phone'
        },
        Email: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            field: 'Email'
        },
        IsActive: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 1,
            field: 'IsActive'
        }
    }, {
        sequelize,
        tableName: 'tbl_Company',
        modelName: modelName,
        timestamps: false,
        freezeTableName: true,
        schema: 'dbo'
    });
    return CompanyMaster;
}
