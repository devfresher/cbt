import nodemailer from 'nodemailer'
import config from 'config'
import { google } from 'googleapis'

const getAuthorizeUrl = async (oauth2Client) => {
    return await oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: [
          'https://mail.google.com/',
        ]
    });
}

// create reusable transporter object using the gmail Oauth2 transport
export const oauth2Transporter = async () => {
    try {
        const OAuth2 = google.auth.OAuth2
        
        const oauth2Config = config.get('oauth2')
        const oauth2Client = new OAuth2(
            oauth2Config.client_id,
            oauth2Config.client_secret,
            oauth2Config.redirect_uri
        )
    
        throw({status: "error", code:401, message: await getAuthorizeUrl(oauth2Client)});
        return
        oauth2Client.setCredentials({refresh_token: oauth2Config.refresh_token})
        const token = await oauth2Client.getAccessToken()
        // const token = await oauth2Client.getToken(oauth2Config.auth_code)
        // throw(token);
    
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'fresher.dev01@gmail.com',
                clientId: oauth2Config.client_id,
                clientSecret: oauth2Config.client_secret,
                accessToken: token.token,
                refreshToken: oauth2Config.refresh_token
            }
        })
        
    } catch (error) {
        throw(error)
    }
}

// create reusable transporter object using the default gmail smtp transport
export const smtpTransporter = async () => {
    return nodemailer.createTransport(config.get('smtp.gmail'))
}
