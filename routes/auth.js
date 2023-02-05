import express from "express"

const router = express.Router()

import * as authController from '../controllers/authController.js'
import * as userController from '../controllers/userController.js'
import { uploadSingleImage } from "../middleware/uploadFiles.js"


router.post("/login", authController.login)
router.post("/student/login", authController.studentLogin)
router.post("/register", uploadSingleImage('profileImage'), userController.createUser)
router.post("/reset-password/send-otp", authController.sendOtp)
router.post("/reset-password/validate-otp", authController.validateOtp)
router.post("/reset-password/new-password", authController.newPassword)

export default router