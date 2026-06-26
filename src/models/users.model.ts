import { Sequelize, DataTypes } from 'sequelize';

export const initUserModel = (sequelize: Sequelize) => {
    return sequelize.define('tbl_Users', {
        Global_User_ID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        UserName: DataTypes.STRING,
        Name: DataTypes.STRING,
    }, {
        tableName: 'tbl_Users',
        timestamps: false,
    });
};