import { HTTP_CODES } from "./http_error_codes.js";

export class CustomError extends Error {
    constructor(message, httpErrorCode = HTTP_CODES._500_INTERNAL_SERVER_ERROR, errorCode = "ERR_UNKNOWN") {
        super(message);
        this.name = this.constructor.name;
        this.httpErrorCode = httpErrorCode;
        this.errorCode = Array.isArray(errorCode) ? errorCode : [errorCode];
        Error.captureStackTrace(this, this.constructor);
    }

    toJSON() {
        return {
            httpErrorCode: this.httpErrorCode,
            errorCode: this.errorCode,
            message: this.message
        };
    }
}
