// src/config/jwtSecret.ts
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET: string =
    process.env.JWT_SECRET ||
    'pukal orgin.in';

export default JWT_SECRET;
