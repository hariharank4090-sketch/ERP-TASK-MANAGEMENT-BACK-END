"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
// Configure dotenv
dotenv_1.default.config();
const domain = process.env.domain || '';
const getImage = (folder, image) => {
    if (!folder || !image) {
        return `${domain}imageURL/imageNotFound`;
    }
    const defaultImageUrl = `${domain}imageURL/imageNotFound`;
    const imageUrl = `${domain}imageURL/${folder}/${image}`;
    const imagePath = path_1.default.join(__dirname, '..', 'uploads', folder, image);
    return fs_1.default.existsSync(imagePath) ? imageUrl : defaultImageUrl;
};
exports.default = getImage;
