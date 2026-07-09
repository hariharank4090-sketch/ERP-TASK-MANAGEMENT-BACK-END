import { Request, Response, NextFunction } from "express";
import { UserMaster } from "../../../models/masters/users/users.model";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.header("Authorization");
    let authenticateId = "";

    if (authHeader?.startsWith("Bearer ")) {
        authenticateId = authHeader.substring("Bearer ".length);
    } else if (req.query.token && typeof req.query.token === "string") {
        // Fallback for easy browser testing (e.g. ?token=...)
        authenticateId = req.query.token;
    } else {
        return res.status(401).json({ message: "Missing token" });
    }
    
    try {
        const user = await UserMaster.findOne({
            where: {
                Autheticate_Id: authenticateId,
                UDel_Flag: 0
            },
            raw: true
        });
        
        if (!user) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }
        
        (req as any).user = user;
        next();
    } catch {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}