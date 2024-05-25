import bcrypt from 'bcrypt';
import crypto from 'crypto';
import _ from 'lodash';
import User, { hashPassword } from '../models/user.js';
import * as userService from './user.service.js';
import mailUtil from '../utils/mail.util.js';

export const otherLogin = async (email, password) => {
	const user = await User.findOne({ email, role: ['Admin', 'Staff'] });
	if (!user) throw { status: 'error', code: 400, message: 'Invalid email or password' };

	const isValidPassword = await bcrypt.compare(password, user.password);
	if (!isValidPassword)
		throw { status: 'error', code: 400, message: 'Invalid email or password' };

	const token = await user.generateAuthToken();
	return { user: _.omit(user.toObject(), ['password']), accessToken: token };
};

export const studentLogin = async (admissionNo, password) => {
	const student = await User.findOne({ admissionNo, role: 'Student' });
	if (!student)
		throw { status: 'error', code: 400, message: 'Invalid admission number or password' };

	const isValidPassword = await bcrypt.compare(password, student.password);
	if (!isValidPassword)
		throw { status: 'error', code: 400, message: 'Invalid admission number or password' };
	_.unset(student, 'password');

	const token = student.generateAuthToken();
	return { student: _.omit(student.toObject(), ['password']), accessToken: token };
};

export const sendOtp = async (email) => {
	const user = await userService.getOneUser({ email: email });
	const token = generateToken();

	await userService.updateUser(user, {
		resetPasswordToken: token.token,
		resetTokenExpiry: token.expiry,
	});

	// send email
	await mailUtil.sendMail({
		to: user.email,
		subject: 'forgotPassword',
		replacements: {
			user,
			resetCode: token.token,
			expiry: `${Math.round((token.expiry - Date.now()) / (1000 * 60))} minutes`,
		},
	});

	return;
};

export const validateOtp = async (user, code) => {
	const now = new Date();
	if (code !== user.resetPasswordToken)
		throw { status: 'error', code: 400, message: 'Invalid otp code' };
	if (user.resetTokenExpiry < now)
		throw { status: 'error', code: 400, message: 'Otp code expired' };

	return;
};

export const handleResetPassword = async (user, newPassword) => {
	const password = await hashPassword(newPassword);
	const updateData = { password, resetPasswordToken: undefined, resetTokenExpiry: undefined };
	await userService.updateUser(user, updateData);

	// send email
	await mailUtil.sendMail({
		to: user.email,
		subject: 'passwordResetCompleted',
		replacements: {
			user,
		},
	});
	return;
};

const generateToken = (expiresIn = 10 * 60 * 1000) => {
	const token = crypto.randomBytes(3).toString('hex');
	const expiry = Date.now() + expiresIn;
	return { token, expiry };
};
