import cloud from "cloudinary"
import { config } from "../utils/config.js"

const cloudinary = cloud.v2
cloudinary.config({
	cloud_name: config.CLOUDINARY_NAME,
	api_key: config.CLOUDINARY_KEY,
	api_secret: config.CLOUDINARY_SECRET,
	secure: true,
})

const UPLOAD_FOLDER = "oacsss_cbt"

export const uploadToCloudinary = async (file, folder = "users", imagePublicId) => {
	let uploadSettings = {}
	uploadSettings.folder = folder ? `${UPLOAD_FOLDER}/${folder}` : `${UPLOAD_FOLDER}`
	if (imagePublicId) uploadSettings.public_id = imagePublicId

	try {
		return await cloudinary.uploader.upload(file.path, uploadSettings)
	} catch (error) {
		throw { message: error }
	}
}

export const deleteFromCloudinary = async (imagePublicId) => {
	try {
		return await cloudinary.uploader.destroy(imagePublicId)
	} catch (error) {
		throw { message: error }
	}
}
