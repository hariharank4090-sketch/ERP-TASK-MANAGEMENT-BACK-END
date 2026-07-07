"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageFolder = exports.createUploadFolders = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uploadsRoot = path_1.default.resolve(process.cwd(), "uploads");
if (!fs_1.default.existsSync(uploadsRoot))
    fs_1.default.mkdirSync(uploadsRoot);
const productsDir = path_1.default.join(uploadsRoot, "products");
const attendanceDir = path_1.default.join(uploadsRoot, "attendance");
const forumDocumentDir = path_1.default.join(uploadsRoot, "forumDocuments");
const retailerDir = path_1.default.join(uploadsRoot, "retailers");
const visitLogDir = path_1.default.join(uploadsRoot, "visitLogs");
const createUploadFolders = () => {
    if (!fs_1.default.existsSync(productsDir))
        fs_1.default.mkdirSync(productsDir);
    if (!fs_1.default.existsSync(attendanceDir))
        fs_1.default.mkdirSync(attendanceDir);
    if (!fs_1.default.existsSync(forumDocumentDir))
        fs_1.default.mkdirSync(forumDocumentDir);
    if (!fs_1.default.existsSync(retailerDir))
        fs_1.default.mkdirSync(retailerDir);
    if (!fs_1.default.existsSync(visitLogDir))
        fs_1.default.mkdirSync(visitLogDir);
};
exports.createUploadFolders = createUploadFolders;
exports.imageFolder = {
    product: productsDir,
    attendance: attendanceDir,
    forumDocument: forumDocumentDir,
    retailer: retailerDir,
    visitLog: visitLogDir
};
