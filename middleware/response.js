import winston from "winston";

export default function (data, req, res, next) {
    switch (data.status) {
        case "success":
            return res.status(data.code || 200).json({
                status: data.status,
                data: data.data,
                message: data.message
            })
            break;

        case "error":
            return res.status(data.code).json({
                status: data.status,
                error: {
                    code: data.code,
                    message: data.message
                }
            })
            break;
    
        default:
            const error = {
                code: isValidStatusCode(data.code) || 500,
                message: data.message || "Something unexpected went wrong",
                originalError: data
            }
            winston.error(error.message, data);
            return res.status(error.code).json({
                status: "error",
                error
            });
            break;
    }

}

const isValidStatusCode = (code) => {
    code = Number(code)
    return (code >= 100 && code <=599 )
}