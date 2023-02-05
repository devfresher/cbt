import multer from "multer"
import path from 'path'
import fs from 'fs'
import _ from 'lodash'

// const MAX_FILE_SIZE = 60 * 1024 * 1024;
// const ALLOWED_FILE_FORMATS = ['.jpeg', '.jpg', '.png', '.csv'];

// const ERROR_MESSAGES = {
//   fileTypeError: 'Unsupported file format. Expecting',
//   fileSizeError: 'File size exceeded the maximum allowed size of',
//   fieldNameError: 'Invalid field name',
//   destinationError: 'Invalid destination path'
// };

// const handleError = (err, next) => {
//     switch (err.code) {
//         case 'LIMIT_FILE_SIZE':
//             return next({
//                 status: 'error',
//                 code: 400,
//                 message: ERROR_MESSAGES.fileSizeError + (MAX_FILE_SIZE / (1024 * 1024)) + 'MB'
//             });
//         case 'LIMIT_FILE_TYPE':
//             return next({
//                 status: 'error',
//                 code: 400,
//                 message: ERROR_MESSAGES.fileTypeError + ALLOWED_FILE_FORMATS.join(', ')
//             });
//         default:
//             return next({ message: err });
//     }
// };

// const validateInput = (fieldName, destination) => {
//     if (!ALLOWED_FILE_FORMATS.includes(path.extname(fieldName))) {
//         throw new Error(ERROR_MESSAGES.fieldNameError);
//     }

//     const absDestination = path.resolve(process.cwd(), destination);
//     if (!fs.existsSync(absDestination)) {
//         throw new Error(ERROR_MESSAGES.destinationError);
//     }
// };

// const configureMulter = (fieldName, destination, fileType) => {
//     return multer({
//         storage: multer.diskStorage({
//             destination: (req, file, cb) => {
//                 cb(null, destination);
//             },
//             filename: (req, file, cb) => {
//                 cb(null, file.originalname);
//             },
//             fileFilter: (req, file, cb) => {
//                 let ext = path.extname(file.originalname);
//                 if (!fileType.includes(ext)) {
//                     req.fileValidationError = ERROR_MESSAGES.fileTypeError + fileType.join(', ');
//                     cb(null, false);
//                 } else {
//                     cb(null, true);
//                 }
//             }
//         }),
//         limits: { fileSize: MAX_FILE_SIZE, files: 1 },
//     })
// }

// // Define functions for handling single image and batch CSV file uploads
// export const uploadSingleImage = (fieldName, destination = 'tempUploads') => {
//     return (req, res, next) => {
//         validateInput(fieldName, destination)
//         const upload = configureMulter(fieldName, destination, ALLOWED_FILE_TYPES.slice(0, 3))
//             .single(fieldName);

//         upload(req, res, (err) => {
//             handleError(err, next)
//         })
//     }
// };

// export const uploadBatchUsersCsv = (fieldName, destination = 'tempUploads') => {
//     return (req, res, next) => {
//         validateInput(fieldName, destination)
//         const upload = configureMulter(fieldName, destination, ALLOWED_FILE_TYPES.slice(-1))
//             .single(fieldName);

//         upload(req, res, (err) => {
//             handleError(err, next)
//         })
//     }
// };

export const uploadSingleImage = (fieldName, destination = 'tempUploads') => {
    const imageFormat = ['.jpeg', '.jpg', '.png']
    const maxFileSize = 60 * 1024 * 1024
    const absDestination = path.resolve(process.cwd(), destination)

    return (req, res, next) => {
        // Check if destination directory exists and create it if it doesn't
        if (!fs.existsSync(absDestination)) {
            fs.mkdirSync(absDestination)
        }

        // Set up multer options
        const upload = multer({
            storage: multer.diskStorage({
                destination: (req, file, cb) => {
                    cb(null, destination)
                },
                filename: (req, file, cb) => {
                    cb(null, file.originalname)
                },
            }),
            fileFilter: (req, file, cb) => {
                let ext = path.extname(file.originalname)
                if (!imageFormat.includes(ext)) {
                    req.fileValidationError = `Unsupported image format. Expecting ${imageFormat} files only`
                    cb(null, false)
                } else {
                    cb(null, true)
                }
            },
            limits: { fileSize: maxFileSize, files: 1 },
        }).single(fieldName)

        // Upload file
        upload(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                return next({ status: 'error', code: 400, message: err.message })
            } else if (err) {
                return next({ message: err })
            } else if (req.fileValidationError) {
                return next({ status: 'error', code: 400, message: req.fileValidationError })
            }

            next()
        })
    }
}

export const uploadBatchCsv = (fieldName, destination = 'tempUploads') => {
    const imageFormat = ['.csv']
    const maxFileSize = 60 * 1024 * 1024
    const absDestination = path.resolve(process.cwd(), destination)

    return (req, res, next) => {
        // Check if destination directory exists and create it if it doesn't
        if (!fs.existsSync(absDestination)) {
            fs.mkdirSync(absDestination)
        }

        // Set up multer options
        const upload = multer({
            storage: multer.diskStorage({
                destination: (req, file, cb) => {
                    cb(null, destination)
                },
                filename: (req, file, cb) => {
                    cb(null, file.originalname)
                }
            }),
            fileFilter: (req, file, cb) => {
                let ext = path.extname(file.originalname)
                if (!imageFormat.includes(ext)) {
                    req.fileValidationError = `Unsupported file format. Expecting ${imageFormat} files only`
                    cb(null, false)
                } else {
                    cb(null, true)
                }
            },
            limits: { fileSize: maxFileSize, files: 1 },
        }).single(fieldName)

        // Upload file
        upload(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                return next({ status: 'error', code: 400, message: err.message })
            } else if (err) {
                return next({ message: err })
            } else if (req.fileValidationError) {
                return next({ status: 'error', code: 400, message: req.fileValidationError })
            }

            next()
        })
    }
}