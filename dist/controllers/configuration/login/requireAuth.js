"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const users_model_1 = require("../../../models/masters/users/users.model");
async function requireAuth(req, res, next) {
    const auth = req.header("Authorization");
    if (!auth?.startsWith("Bearer "))
        return res.status(401).json({ message: "Missing token" });
    const authenticateId = auth.substring("Bearer ".length);
    try {
        const user = await users_model_1.UserMaster.findOne({
            where: {
                Autheticate_Id: authenticateId,
                UDel_Flag: 0
            },
            raw: true
        });
        if (!user) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }
        req.user = user;
        next();
    }
    catch {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}
