"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mssql_1 = __importDefault(require("mssql"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    server: process.env.SERVER,
    database: process.env.DATABASE,
    user: process.env.USER,
    password: process.env.PASSWORD,
    driver: "SQL Server",
    options: {
        trustedConnection: true,
        trustServerCertificate: true,
        requestTimeout: 60000,
    }
};
const connectDB = () => {
    mssql_1.default.connect(config, (err) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log("connected Successfully -----");
        }
    });
};
exports.connectDB = connectDB;
