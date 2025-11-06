import { registerAs } from '@nestjs/config';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

export default registerAs('config', () => {
    return {
        port: process.env.PORT,
        database: {
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        },
    };
});