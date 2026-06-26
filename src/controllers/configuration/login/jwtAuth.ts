// import jwt from "jsonwebtoken";
// import { JwtUser } from "./index";

// const SECRET = process.env.JWT_SECRET!;
// const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "3d";

// export function signJwt(payload: JwtUser): string {
//     return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
// }

// export function verifyJwt<T = JwtUser>(token: string): T {
//     return jwt.verify(token, SECRET) as T;
// }