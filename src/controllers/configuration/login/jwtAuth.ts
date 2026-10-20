// src/controllers/configuration/login/jwtAuth.ts
import JWT_SECRET from '../../../config/jwtSecret';

const SECRET = JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '3d';

export { JWT_SECRET, SECRET, EXPIRES_IN };
