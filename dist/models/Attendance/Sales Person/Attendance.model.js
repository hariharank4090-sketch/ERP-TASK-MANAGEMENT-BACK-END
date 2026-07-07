"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeMaster = exports.Attendance = void 0;
const sequelize_1 = require("sequelize");
const sequalizer_1 = require("../../../config/sequalizer");
class Attendance extends sequelize_1.Model {
    Id;
    UserId;
    Start_Date;
    End_Date;
    Start_KM;
    End_KM;
    Start_KM_ImageName;
    End_KM_ImageName;
    Start_KM_ImagePath;
    End_KM_ImagePath;
    Latitude;
    Longitude;
    WorkSummary;
    IsSalesPerson;
    Active_Status;
}
exports.Attendance = Attendance;
Attendance.init({
    Id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    UserId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    Start_Date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    End_Date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    Start_KM: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    End_KM: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    Start_KM_ImageName: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    End_KM_ImageName: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    Start_KM_ImagePath: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: true,
    },
    End_KM_ImagePath: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: true,
    },
    Latitude: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
    },
    Longitude: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
    },
    WorkSummary: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    IsSalesPerson: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    Active_Status: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1,
    },
}, {
    sequelize: sequalizer_1.sequelize,
    tableName: 'tbl_Attendance',
    timestamps: false,
});
class EmployeeMaster extends sequelize_1.Model {
    id;
    User_Mgt_Id;
    fingerPrintEmpId;
    Emp_Name;
    Designation;
    Department;
    Mobile_No;
    Email_Id;
    Sex;
    Active_Status;
}
exports.EmployeeMaster = EmployeeMaster;
EmployeeMaster.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    User_Mgt_Id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    fingerPrintEmpId: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
    },
    Emp_Name: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    Designation: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    Department: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    Mobile_No: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: true,
    },
    Email_Id: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    Sex: {
        type: sequelize_1.DataTypes.STRING(10),
        allowNull: true,
    },
    Active_Status: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1,
    },
}, {
    sequelize: sequalizer_1.sequelize,
    tableName: 'tbl_Employee_Master',
    timestamps: false,
});
exports.default = {
    Attendance,
    EmployeeMaster,
};
