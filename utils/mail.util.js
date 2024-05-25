import path from 'path';
import { createTransport } from 'nodemailer';
import fs from 'fs';
import Handlebars from 'handlebars';
import { config } from './config.js';
import winston from 'winston';

class MailUtil {
	async createTransporter() {
		try {
			return createTransport({
				host: 'smtp.gmail.com',
				port: 465,
				secure: true,
				auth: {
					user: config.MAIL_USERNAME,
					pass: config.MAIL_APP_KEY,
				},
			});
		} catch (error) {
			winston.log('error', `Error creating email transporter: ${error}`);
		}
	}

	async readTemplate(templateName) {
		const filePath = path.join(
			process.cwd(),
			'resources',
			'templates',
			'emails',
			`${templateName}.html`
		);

		try {
			const source = fs.readFileSync(filePath, 'utf-8');
			return source.toString();
		} catch (error) {
			winston.log('error', `Error reading email template file: ${error}`);
		}
	}

	emailTemplatesMapping = {
		forgotPassword: {
			subject: 'Password Reset Request',
		},

		passwordResetCompleted: {
			subject: 'Password Reset Completed',
		},
	};

	async sendMail(options) {
		const { to, from, subject, replacements } = options;

		const mailData = {
			from: `${from ? from : config.MAIL_USERNAME} <${config.GOOGLE_EMAIL_USER}>`,
			to,
			subject,
		};

		try {
			if (options.templateName) {
				const source = await this.readTemplate(options.templateName);
				const { subject } = this.emailTemplatesMapping[options.templateName];

				const template = Handlebars.compile(source);
				const html = template({
					...replacements,
					appName: config.APP_NAME,
				});

				mailData.html = html;
				mailData.subject = subject;
			} else if (options.body) {
				mailData.html = options.body;
			} else {
				winston.log('error', 'Body or template is required');
			}

			const transporter = await this.createTransporter();
			const info = await transporter.sendMail(mailData);

			winston.log(
				'info',
				`Email ${mailData.subject} (${info.messageId}) sent to ${to}: ${
					info.response
				} at ${new Date().toISOString()}`
			);

			return info;
		} catch (error) {
			winston.log('error', `Error sending email: ${error}`);
		}
	}
}

export default new MailUtil();
