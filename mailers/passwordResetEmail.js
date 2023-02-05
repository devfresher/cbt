import { oauth2Transporter, smtpTransporter } from "./mailConfig.js";
import mustache from 'mustache'
import fs from 'fs'
import path from 'path'
import config from 'config'

const templatePaths = {
    resetPassword: path.resolve('mailers', 'templates', 'passwordReset.html'),
    resetSuccess: path.resolve('mailers', 'templates', 'resetSuccess.html'),
}

export const sendEmail = async (user, type) => {
    try {
        // Read the HTML template
        const templatePath = templatePaths[type];
        const template = fs.readFileSync(templatePath, 'utf-8');
    
        let data = {
            appName: config.get('app.name'),
            user,
        }
    
        if (type === 'resetPassword') {
            data = {
                ...data,
                resetCode: user.resetPasswordToken,
                expiry: `${Math.round((user.resetTokenExpiry - Date.now()) / (1000 * 60))} minutes`
            }
        }
    
        // Render the HTML
        const html = mustache.render(template, data);
    
        // setup email data with unicode symbols
        const mailOptions = {
            from: `"${config.get('app.name')}" <admin.dev01@gmail.com>`,
            to: `${user.email}`,
            subject:  `${type === 'resetPassword' ? 'Reset Your' : 'Successful Reset of'} ${config.get('app.name')} Password`,
            html: html
        };
    
        const transporter = await oauth2Transporter()
    
        // send mail with defined transport object
        const info = await transporter.sendMail(mailOptions);
        return info;
        
    } catch (error) {
        throw(error)
    }
}