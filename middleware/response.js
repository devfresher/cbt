import winston from "winston";

export default function (data, req, res, next) {
    switch (data.status) {
        case "success":
            return res.status(data.code || 200).json({
                status: data.status,
                data: data.data
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
            winston.error(data.message, data);
            res.status(500).json({
                status: "error",
                error: {
                    code: 500,
                    message: "Something unexpected went wrong"
                }
            })
            break;
    }

}