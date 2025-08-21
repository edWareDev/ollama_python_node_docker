import { HTTP_CODES } from "./http_error_codes.js";

export const fetchResponse = (res, { statusCode = HTTP_CODES._200_OK, message = null, errorCode = null, data = null }) => {
    const responseBody = {
        statusCode,
        message,
        ...(errorCode && { errorCode }),
        ...(data && { data })
    };

    res.status(statusCode).json(responseBody);
};