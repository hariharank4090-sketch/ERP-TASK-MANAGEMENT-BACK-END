"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Use process.cwd() for the base directory
const uploadBaseDir = path_1.default.join(process.cwd(), 'uploads');
const folders = ['products', 'retailers', 'attendance', 'visitLogs', 'forumDocuments', 'whatsappMedia'];
const ensureUploadDirExists = (dir) => {
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
};
const uploadFile = (req, res, uploadLocation, key) => {
    if (!folders[uploadLocation]) {
        return Promise.reject(new Error(`Invalid upload location: ${uploadLocation}`));
    }
    const uploadDir = path_1.default.join(uploadBaseDir, folders[uploadLocation]);
    const storage = multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            ensureUploadDirExists(uploadDir);
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const timestamp = new Date().toISOString().replace(/:/g, '-');
            const fileName = `${timestamp}_${file.originalname}`;
            cb(null, fileName);
        },
    });
    const upload = (0, multer_1.default)({
        storage,
        limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
    }).single(key);
    return new Promise((resolve, reject) => {
        upload(req, res, (err) => {
            if (err) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    reject(new Error('File too large. Maximum size is 10MB.'));
                }
                else {
                    reject(err);
                }
            }
            else {
                if (!req.file) {
                    reject(new Error('No file uploaded'));
                }
                else {
                    resolve();
                }
            }
        });
    });
};
exports.default = uploadFile;
