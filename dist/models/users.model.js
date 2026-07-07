"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initUserModel = void 0;
const sequelize_1 = require("sequelize");
const initUserModel = (sequelize) => {
    return sequelize.define('tbl_Users', {
        Global_User_ID: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
        },
        UserName: sequelize_1.DataTypes.STRING,
        Name: sequelize_1.DataTypes.STRING,
    }, {
        tableName: 'tbl_Users',
        timestamps: false,
    });
};
exports.initUserModel = initUserModel;
