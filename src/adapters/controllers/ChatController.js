import { generateProductInfo } from "../../usecases/chat/GenerateDetailedProductInfo.js";
import { CustomError } from "../../utils/CustomError.js";
import { fetchResponse } from "../../utils/fetchResponse.js";
import { HTTP_CODES } from "../../utils/http_error_codes.js";

export async function controllerGenerateDetailedProductInfo(req, res) {
    try {
        //Obtenemos la información del body de la solicitud
        const data = req.body;

        //Enviamos la informacion de ia al caso de uso enccargado de esta tarea
        const detailedProductInfo = await generateProductInfo(data);

        //Controlamos los errores que podrían suceder en la ejecución
        if (detailedProductInfo.error) throw new CustomError('Error al obtener los usuarios.', HTTP_CODES._400_BAD_REQUEST, detailedProductInfo.error);

        res.json({ respuesta: detailedProductInfo });
    } catch (error) {
        if (error instanceof CustomError) {
            const { message, httpErrorCode, errorCode } = error.toJSON();
            fetchResponse(res, { statusCode: httpErrorCode, message, errorCode });
        } else {
            fetchResponse(res, { statusCode: HTTP_CODES._500_INTERNAL_SERVER_ERROR, errorCode: "ERR_UNEXPECTED", message: "Ha ocurrido un error inesperado" });
        }
    }
}
