import nodemailer from "nodemailer"
import { google } from "googleapis"
import { config } from "../utils/config.js"

const getAuthorizeUrl = async (oauth2Client) => {
	return await oauth2Client.generateAuthUrl({
		access_type: "offline",
		prompt: "consent",
		scope: ["https://mail.google.com/"],
	})
}

// create reusable transporter object using the gmail Oauth2 transport
export const oauth2Transporter = async () => {
	const OAuth2 = google.auth.OAuth2

	const oauth2Client = new OAuth2(
		config.OAUTH_CLIENT_ID,
		config.OAUTH_CLIENT_SECRET,
		config.OAUTH_REDIRECT_URL
	)

	// throw({status: "error", code:401, message: await getAuthorizeUrl(oauth2Client)});
	// return
	// const token = await oauth2Client.getToken(config.OAUTH_AUTH_CODE)

	oauth2Client.setCredentials({ refresh_token: config.OAUTH_REFRESH_TOKEN })
	const token = await oauth2Client.getAccessToken()
	// throw(token);

	return nodemailer.createTransport({
		service: "gmail",
		auth: {
			type: "OAuth2",
			user: "fresher.dev01@gmail.com",
			clientId: config.OAUTH_CLIENT_ID,
			clientSecret: config.OAUTH_CLIENT_SECRET,
			accessToken: token.token,
			refreshToken: config.OAUTH_REFRESH_TOKEN,
		},
	})
}

// create reusable transporter object using the default gmail smtp transport
export const smtpTransporter = async () => {
	return nodemailer.createTransport(config.get("smtp.gmail"))
}
