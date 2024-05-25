import dotenv from 'dotenv';
// const env = !process.env.NODE_ENV ? 'development' : process.env.NODE_ENV;
dotenv.config();

export const config = {
	APP_NAME: process.env.APP_NAME,
	HOST: process.env.HOST,
	PORT: process.env.PORT,
	DB_URL: process.env.DB_URL,

	JWT_PRIVATE_KEY: process.env.JWT_PRIVATE_KEY,

	CLOUDINARY_NAME: process.env.CLOUDINARY_NAME,
	CLOUDINARY_KEY: process.env.CLOUDINARY_KEY,
	CLOUDINARY_SECRET: process.env.CLOUDINARY_SECRET,

	MAIL_HOST: process.env.MAIL_HOST,
	MAIL_PORT: process.env.MAIL_PORT,
	MAIL_USERNAME: process.env.MAIL_USERNAME,
	MAIL_APP_KEY: process.env.MAIL_APP_KEY,

	OAUTH_CLIENT_ID: process.env.OAUTH_CLIENT_ID,
	OAUTH_CLIENT_SECRET: process.env.OAUTH_CLIENT_SECRET,
	OAUTH_REDIRECT_URL: process.env.OAUTH_REDIRECT_URL,
	OAUTH_AUTH_CODE: process.env.OAUTH_AUTH_CODE,
	OAUTH_REFRESH_TOKEN: process.env.OAUTH_REFRESH_TOKEN,
};
