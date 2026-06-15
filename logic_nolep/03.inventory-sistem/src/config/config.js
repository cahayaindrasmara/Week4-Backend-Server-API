import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
});

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    accessExpirationMinutes: Number(process.env.JWT_ACCESS_EXPIRATION_MINUTES),
    refreshExpirationDays: Number(process.env.JWT_REFRESH_EXPIRATION_DAYS),
  },
};
