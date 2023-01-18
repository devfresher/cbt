import multer from "multer";
import { multerUploads } from "../startup/multerUploads.js"


export const uploadSingle = (fieldName) => {
    return (req, res, next) => {
        const upload = multerUploads.single(fieldName);

        upload(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                next({status: "error", code: 400, message: err.message})
            } else if (err) {
                next({message: err})
            } else if (req.fileValidationError) {
                next({status: "error", code: 400, message: req.fileValidationError})
            }

            next()
        })
    }
}