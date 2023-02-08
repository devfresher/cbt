import winston from "winston";

export default function (data, req, res, next) {
    const code = Number(data.code) || 500;
    if (!isValidStatusCode(code)) {
        winston.error(`Invalid status code: ${code}`);
        return res.status(500).json({
            status: "error",
            error: {
                code: 500,
                message: "Invalid status code"
            }
        });
    }

    switch (data.status) {
        case "success":
            return res.status(code).json({
                status: data.status,
                data: data.data,
                message: data.message
            });

        case "error":
            return res.status(code).json({
                status: data.status,
                error: {
                    code,
                    message: data.message
                }
            });

        default:
            const error = {
                code,
                message: data.message || "Something unexpected went wrong",
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