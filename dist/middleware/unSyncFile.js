"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("fs/promises"));
const fileRemoverMiddleware = async (filePath) => {
    try {
        await promises_1.default.access(filePath);
        await promises_1.default.unlink(filePath);
        console.log(`File deleted: ${filePath}`);
    }
    catch (err) {
        if (err && typeof err === 'object' && 'code' in err && err.code === 'ENOENT') {
            console.log(`File not found: ${filePath}`);
            return;
        }
        throw err;
    }
};
exports.default = fileRemoverMiddleware;
