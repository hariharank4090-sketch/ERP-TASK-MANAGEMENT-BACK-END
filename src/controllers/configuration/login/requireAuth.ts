import { Request, Response, NextFunction } from "express";
import { UserMaster } from "../../../models/masters/users/users.model";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
    const auth = req.header("Authorization");
    if (!auth?.startsWith("Bearer ")) return res.status(401).json({ message: "Missing token" });
    const authenticateId = auth.substring("Bearer ".length);
    
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