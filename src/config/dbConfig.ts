






import sql from "mssql";
import dotenv from "dotenv";
dotenv.config();


const config: sql.config = {
    server: (process.env.DB_HOST || process.env.SERVER) as string,
    database: process.env.DATABASE as string,
    user: (process.env.DB_USER || process.env.USER) as string,
    password: (process.env.DB_PASSWORD || process.env.PASSWORD) as string,
    driver: "SQL Server",
    options: {
        trustedConnection: true,
        trustServerCertificate: true,
        requestTimeout: 60000,
    }
};

export const connectDB = () => {
    sql.connect(config, (err) => {
        if (err) {
        } else {
        }
    })
};