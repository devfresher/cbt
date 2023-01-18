import cloud from 'cloudinary'
import config from 'config'

export const cloudinary = cloud.v2
export const cloudinaryConfig = cloudinary.config({
    cloud_name: config.get('cloudinaryConfig.apiName'),
    api_key: config.get('cloudinaryConfig.apiKey'),
    api_secret: config.get('cloudinaryConfig.apiSecret'),
    secure: true
});

export const uploadToCloudinary = async (file, imagePublicId) => {
    const updateFile = imagePublicId ? {public_id: imagePublicId}:undefined
    try {
        return await cloudinary.uploader.upload(file.path, updateFile)
    } catch (error) {
        throw {message: JSON.stringify(error)}
    }
}

export const deleteFromCloudinary = async (imagePublicId) => {
    try {
        return await cloudinary.uploader.destroy(imagePublicId)
    } catch (error) {
        throw {message: JSON.stringify(error)}
    }
}