"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPasswordCombined = exports.verifyLegacyPassword = exports.verifyPassword = exports.hashPassword = void 0;
// src/utils/password.utils.ts
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const saltRounds = 10;
const passwordKey = process.env.passwordKey || "ly4@&gr$vnh905RyB>?%#@-(KSMT)";
const hashPassword = async (password) => {
    return await bcryptjs_1.default.hash(password, saltRounds);
};
exports.hashPassword = hashPassword;
const verifyPassword = async (plainPassword, hashedPassword) => {
    if (!hashedPassword)
        return false;
    try {
        return await bcryptjs_1.default.compare(plainPassword, hashedPassword);
    }
    catch (error) {
        console.error("BCrypt verification failed:", error);
        return false;
    }
};
exports.verifyPassword = verifyPassword;
const verifyLegacyPassword = async (plainPassword, storedPassword) => {
    try {
        // Direct comparison for plain text
        if (plainPassword === storedPassword) {
            return true;
        }
        // Try custom decryption if needed (handle potential errors)
        try {
            const decipher = crypto_1.default.createDecipheriv('aes-256-cbc', Buffer.from(passwordKey.padEnd(32, '0')), Buffer.alloc(16, 0));
            let decrypted = decipher.update(storedPassword, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return plainPassword === decrypted;
        }
        catch (decryptError) {
            // If decryption fails, it's not a legacy encrypted password
            return false;
        }
    }
    catch (error) {
        return false;
    }
};
exports.verifyLegacyPassword = verifyLegacyPassword;
const verifyPasswordCombined = async (plainPassword, storedPassword) => {
    if (!storedPassword) {
        console.log("No stored password found");
        return false;
    }
    // Method 1: Direct comparison
    if (plainPassword === storedPassword) {
        console.log("✅ Password matched via direct comparison");
        return true;
    }
    // Method 2: BCrypt
    const bcryptValid = await (0, exports.verifyPassword)(plainPassword, storedPassword);
    if (bcryptValid) {
        console.log("✅ Password matched via bcrypt");
        return true;
    }
    // Method 3: Legacy verification
    const legacyValid = await (0, exports.verifyLegacyPassword)(plainPassword, storedPassword);
    if (legacyValid) {
        console.log("✅ Password matched via legacy verification");
        return true;
    }
    console.log("❌ All password verification methods failed");
    return false;
};
exports.verifyPasswordCombined = verifyPasswordCombined;
