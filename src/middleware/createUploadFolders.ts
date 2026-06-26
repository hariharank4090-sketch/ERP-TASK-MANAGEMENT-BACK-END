import path from "path";
import fs from "fs";

const uploadsRoot = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadsRoot)) fs.mkdirSync(uploadsRoot);

const productsDir = path.join(uploadsRoot, "products");
const attendanceDir = path.join(uploadsRoot, "attendance");
const forumDocumentDir = path.join(uploadsRoot, "forumDocuments");
const retailerDir = path.join(uploadsRoot, "retailers");
const visitLogDir = path.join(uploadsRoot, "visitLogs");

export const createUploadFolders = () => {
    if (!fs.existsSync(productsDir)) fs.mkdirSync(productsDir);
    if (!fs.existsSync(attendanceDir)) fs.mkdirSync(attendanceDir);
    if (!fs.existsSync(forumDocumentDir)) fs.mkdirSync(forumDocumentDir);
    if (!fs.existsSync(retailerDir)) fs.mkdirSync(retailerDir);
    if (!fs.existsSync(visitLogDir)) fs.mkdirSync(visitLogDir);
}

export const imageFolder = {
    product: productsDir,
    attendance: attendanceDir,
    forumDocument: forumDocumentDir,
    retailer: retailerDir,
    visitLog: visitLogDir
}