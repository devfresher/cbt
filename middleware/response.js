import winston from "winston";

export default function (data, req, res, next) {
    const defaultCode = 500;
    const defaultMessage = "Something unexpected went wrong";

    let code
    switch (data.status) {
        case "success":
            code = isValidStatusCode(data.code) ? data.code : 200;
            return res.status(code).json({
                status: data.status,
                data: data.data,
                message: data.message
            });

        case "error":
            code = isValidStatusCode(data.code) ? data.code : defaultCode;
            return res.status(code).json({
                status: data.status,
                error: {
                    code,
                    message: data.message || defaultMessage
                }
            });

        default:
            code = isValidStatusCode(data.code) ? data.code : defaultCode;
            const error = {
                code,
                message: data.message || defaultMessage,
                originalError: data
            };
            winston.error(error.message, data);
            return res.status(error.code).json({
                status: "error",
                error
            });
    }
}

const isValidStatusCode = (code) => {
    return code >= 100 && code <= 599;
}