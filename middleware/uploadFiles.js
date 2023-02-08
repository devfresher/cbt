import multer from "multer";
import path from "path";
import fs from "fs";

const supportedFormats = {
    image: [".jpeg", ".jpg", ".png"],
    csv: [".csv"]
};

const maxFileSize = 60 * 1024 * 1024;

const createMulter = (fieldName, formats, destination) =>
    multer({
        storage: multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, destination);
            },
            filename: (req, file, cb) => {
                cb(null, file.originalname);
            }
        }),
        fileFilter: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            if (!formats.includes(ext)) {
                req.fileValidationError = `Unsupported file format. Expecting ${formats.join(", ")} file(s) only`;
                cb(null, false);
            } else {
                cb(null, true);
            }
        },
        limits: { fileSize: maxFileSize, files: 1 }
    }).single(fieldName);

const checkDestination = absDestination => {
    if (!fs.existsSync(absDestination)) {
        fs.mkdirSync(absDestination);
    }
};

export const uploadFile = (fieldName, format, destination = "tempUploads") => {
    const absDestination = path.resolve(process.cwd(), destination);
    checkDestination(absDestination);
    const upload = createMulter(fieldName, supportedFormats[format], destination);

    return (req, res, next) => {
        upload(req, res, err => {
            if (err instanceof multer.MulterError) {
                return next({ status: "error", code: 400, message: err.message });
            } else if (err) {
                return next(err);
            } else if (req.fileValidationError) {
                return next({ status: "error", code: 400, message: req.fileValidationError });
            }
            next();
        });
    };
};

export const uploadSingleImage = (fieldName, destination) =>
    uploadFile(fieldName, "image", destination);

export const uploadBatchCsv = (fieldName, destination) =>
    uploadFile(fieldName, "csv", destination);