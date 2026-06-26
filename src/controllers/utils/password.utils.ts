// src/utils/password.utils.ts
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const saltRounds = 10;
const passwordKey = process.env.passwordKey || "ly4@&gr$vnh905RyB>?%#@-(KSMT)";

export const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
    if (!hashedPassword) return false;
    
    try {
        return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
        console.error("BCrypt verification failed:", error);
        return false;
    }
};

export const verifyLegacyPassword = async (plainPassword: string, storedPassword: string): Promise<boolean> => {
    try {
        // Direct comparison for plain text
        if (plainPassword === storedPassword) {
            return true;
        }
        
        // Try custom decryption if needed (handle potential errors)
        try {
            const decipher = crypto.createDecipheriv(
                'aes-256-cbc', 
                Buffer.from(passwordKey.padEnd(32, '0')), 
                Buffer.alloc(16, 0)
            );
            let decrypted = decipher.update(storedPassword, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return plainPassword === decrypted;
        } catch (decryptError) {
            // If decryption fails, it's not a legacy encrypted password
            return false;
        }
    } catch (error) {
        return false;
    }
};

export const verifyPasswordCombined = async (plainPassword: string, storedPassword: string): Promise<boolean> => {
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
    const bcryptValid = await verifyPassword(plainPassword, storedPassword);
    if (bcryptValid) {
        console.log("✅ Password matched via bcrypt");
        return true;
    }
    
    // Method 3: Legacy verification
    const legacyValid = await verifyLegacyPassword(plainPassword, storedPassword);
    if (legacyValid) {
        console.log("✅ Password matched via legacy verification");
        return true;
    }
    
    console.log("❌ All password verification methods failed");
    return false;
};