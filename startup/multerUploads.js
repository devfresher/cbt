import multer from 'multer'
import path from 'path'
import fs from 'fs'
import _ from 'lodash';

if (!fs.existsSync("../uploads")) {
    fs.mkdirSync("../uploads");
}

const imageFormat = ['.jpeg', '.jpg', '.png']

export const multerUploads = multer({ 
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, "../uploads");
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname);
        },
    }), 
    limits: { fileSize: 600000, files: 1, },
    fileFilter: (req, file, cb) => {
        let ext = path.extname(file.originalname);
        if (!_.includes(imageFormat, ext)) {
            req.fileValidationError = `Unsupported image format. Expecting ${imageFormat} files only`;
            cb(null, false);
        }

        cb(null, true);
    },
});