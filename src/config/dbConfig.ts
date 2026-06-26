






import sql from "mssql";
import dotenv from "dotenv";
dotenv.config();


const config: sql.config = {
    server: process.env.SERVER as string,
    database: process.env.DATABASE as string,
    user: process.env.USER as string,
    password: process.env.PASSWORD as string,
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
            console.log(err);
        } else {
            console.log("connected Successfully -----");
        }
    })
};