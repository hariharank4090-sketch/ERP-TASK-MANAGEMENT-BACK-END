"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultLeave = exports.LeaveMaster = exports.User = exports.EmployeeDesignation = exports.EmployeeMaster = void 0;
const sequelize_1 = require("sequelize");
const sequalizer_1 = require("../../../config/sequalizer");
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
    Created_Date;
    Updated_Date;
    createdAt;
    updatedAt;
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
        type: sequelize_1.DataTypes.INTEGER,
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
    Created_Date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    Updated_Date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: sequalizer_1.sequelize,
    tableName: 'tbl_Employee_Master',
    timestamps: true,
    createdAt: 'Created_Date',
    updatedAt: 'Updated_Date',
});
class EmployeeDesignation extends sequelize_1.Model {
    Designation_Id;
    Designation;
}
exports.EmployeeDesignation = EmployeeDesignation;
EmployeeDesignation.init({
    Designation_Id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    Designation: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
}, {
    sequelize: sequalizer_1.sequelize,
    tableName: 'tbl_Employee_Designation',
    timestamps: false,
});
class User extends sequelize_1.Model {
    UserId;
    Name;
}
exports.User = User;
User.init({
    UserId: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    Name: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    }
}, {
    sequelize: sequalizer_1.sequelize,
    tableName: 'tbl_Users',
    timestamps: false,
});
class LeaveMaster extends sequelize_1.Model {
    LeaveId;
    User_Id;
    FromDate;
    ToDate;
    Status;
}
exports.LeaveMaster = LeaveMaster;
LeaveMaster.init({
    LeaveId: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    User_Id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    FromDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    ToDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    Status: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
    },
}, {
    sequelize: sequalizer_1.sequelize,
    tableName: 'tbl_Leave_Master',
    timestamps: false,
});
class DefaultLeave extends sequelize_1.Model {
    SNo;
    Date;
    Description;
    Created_By;
    Created_At;
    Modified_By;
    Modified_At;
}
exports.DefaultLeave = DefaultLeave;
DefaultLeave.init({
    SNo: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    Date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    Description: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    Created_By: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
    Created_At: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    Modified_By: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
    Modified_At: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize: sequalizer_1.sequelize,
    tableName: 'tbl_Default_Leave',
    timestamps: false,
});
exports.default = {
    EmployeeMaster,
    EmployeeDesignation,
    User,
    LeaveMaster,
    DefaultLeave
};
