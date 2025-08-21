export const HTTP_CODES = {
    // Respuestas informativas (1xx)
    _100_CONTINUE: 100,          // El servidor ha recibido los encabezados de la solicitud y el cliente debe continuar enviando el cuerpo. Ejemplo: Carga de archivos grandes donde el cliente pregunta si puede continuar.
    _101_SWITCHING_PROTOCOLS: 101, // El servidor acepta cambiar el protocolo solicitado por el cliente. Ejemplo: Actualización de HTTP a WebSocket.
    _102_PROCESSING: 102,        // El servidor ha recibido y está procesando la solicitud, pero aún no hay respuesta disponible. Ejemplo: Operaciones que toman tiempo considerable.
    _103_EARLY_HINTS: 103,       // El servidor envía algunos encabezados de respuesta antes de la respuesta final. Ejemplo: Precargar recursos CSS/JS para mejorar rendimiento.

    // Respuestas exitosas (2xx)
    _200_OK: 200,               // La solicitud ha tenido éxito. Ejemplo: El servidor devuelve los datos solicitados.
    _201_CREATED: 201,          // La solicitud ha sido cumplida y ha resultado en la creación de un nuevo recurso. Ejemplo: Un nuevo usuario es creado después de enviar los datos en una solicitud POST.
    _202_ACCEPTED: 202,         // La solicitud ha sido aceptada para su procesamiento, pero aún no se ha completado. Ejemplo: Una solicitud para procesar un pago en segundo plano que aún no ha sido finalizada.
    _203_NON_AUTHORITATIVE_INFORMATION: 203, // La información devuelta es de una fuente no autoritativa. Ejemplo: Un proxy devuelve información modificada.
    _204_NO_CONTENT: 204,       // La solicitud se ha completado correctamente, pero no hay contenido que devolver. Ejemplo: Se elimina un recurso con una solicitud DELETE y no se devuelve contenido.
    _205_RESET_CONTENT: 205,    // El servidor ha cumplido la solicitud y el cliente debe reiniciar la vista del documento. Ejemplo: Después de enviar un formulario, el navegador debe limpiar el formulario.
    _206_PARTIAL_CONTENT: 206,  // El servidor está entregando solo parte del recurso debido a un encabezado de rango. Ejemplo: Descarga de archivos por partes.

    // Redirecciones (3xx)
    _300_MULTIPLE_CHOICES: 300,  // Múltiples opciones para el recurso. Ejemplo: El servidor puede devolver el recurso en diferentes formatos.
    _301_MOVED_PERMANENTLY: 301, // El recurso solicitado ha sido movido permanentemente a una nueva URL. Ejemplo: Un sitio web cambia su dominio y usa una redirección 301 para redirigir todo el tráfico.
    _302_FOUND: 302,             // El recurso se encuentra temporalmente en una ubicación diferente. Ejemplo: Un servidor redirige temporalmente a otro servicio para manejar el tráfico debido a mantenimiento.
    _303_SEE_OTHER: 303,         // El servidor redirige al cliente a otro recurso usando una URL diferente. Ejemplo: Después de una solicitud POST, el servidor redirige a una página de resultados con una solicitud GET.
    _304_NOT_MODIFIED: 304,      // El recurso no ha sido modificado desde la última solicitud. Ejemplo: El cliente tiene una copia en caché de un recurso y el servidor le dice que no lo ha cambiado.
    _307_TEMPORARY_REDIRECT: 307, // Redirección temporal que mantiene el método HTTP original. Ejemplo: Mantenimiento temporal que requiere que el cliente use el mismo método HTTP.
    _308_PERMANENT_REDIRECT: 308, // Redirección permanente que mantiene el método HTTP original. Ejemplo: Cambio permanente de endpoint que requiere mantener el método POST.

    // Errores de cliente (4xx)
    _400_BAD_REQUEST: 400,       // La solicitud no puede ser procesada debido a un error del cliente (por ejemplo, sintaxis incorrecta). Ejemplo: El cliente envía datos malformados en un formulario o API.
    _401_UNAUTHORIZED: 401,      // El usuario no está autorizado a acceder al recurso. Ejemplo: Un API requiere autenticación y el usuario no proporciona un token válido.
    _402_PAYMENT_REQUIRED: 402,  // Pago requerido para acceder al recurso. Ejemplo: Contenido premium, APIs de pago por uso, suscripciones vencidas, límites de uso gratuito excedidos.
    _403_FORBIDDEN: 403,         // El servidor ha comprendido la solicitud, pero se niega a autorizarla. Ejemplo: El usuario no tiene permisos para acceder a un recurso específico (por ejemplo, archivo privado).
    _404_NOT_FOUND: 404,         // El recurso solicitado no se ha encontrado en el servidor. Ejemplo: Se hace una solicitud para obtener los datos de un producto que no existe.
    _405_METHOD_NOT_ALLOWED: 405,// El método de la solicitud no está permitido para el recurso. Ejemplo: Intentas hacer una solicitud POST a un endpoint que solo permite GET.
    _406_NOT_ACCEPTABLE: 406,    // El servidor no puede generar una respuesta que sea aceptable para el cliente. Ejemplo: El cliente pide datos en un formato que no está soportado por el servidor.
    _407_PROXY_AUTHENTICATION_REQUIRED: 407, // El cliente debe autenticarse con el proxy. Ejemplo: Acceso a través de un proxy corporativo que requiere autenticación.
    _408_REQUEST_TIMEOUT: 408,   // El servidor agotó el tiempo de espera de la solicitud. Ejemplo: El cliente tarda demasiado en enviar la solicitud completa.
    _409_CONFLICT: 409,          // La solicitud no se puede completar debido a un conflicto con el estado actual del recurso. Ejemplo: Intentas crear un recurso con un ID ya existente.
    _410_GONE: 410,              // El recurso solicitado ya no está disponible y no lo estará en el futuro. Ejemplo: Un archivo que ha sido eliminado permanentemente del servidor.
    _411_LENGTH_REQUIRED: 411,   // El servidor requiere que la solicitud contenga una longitud de contenido. Ejemplo: El cliente no envió el encabezado "Content-Length" en una solicitud POST.
    _412_PRECONDITION_FAILED: 412, // El servidor no cumple con una condición especificada en los encabezados de la solicitud. Ejemplo: El cliente proporciona un encabezado de "If-Match" con un valor que no coincide.
    _413_PAYLOAD_TOO_LARGE: 413, // La carga útil de la solicitud es demasiado grande. Ejemplo: El archivo cargado excede el límite de tamaño del servidor.
    _414_URI_TOO_LONG: 414,      // La URI proporcionada en la solicitud es demasiado larga para que el servidor la procese. Ejemplo: Una URL que contiene demasiados parámetros.
    _415_UNSUPPORTED_MEDIA_TYPE: 415, // El tipo de medios de la solicitud no es compatible con el servidor. Ejemplo: El servidor no soporta el tipo de archivo enviado en una solicitud POST.
    _416_RANGE_NOT_SATISFIABLE: 416, // El servidor no puede satisfacer la solicitud de un rango. Ejemplo: El cliente pide un rango de bytes que está fuera de los límites del archivo.
    _417_EXPECTATION_FAILED: 417,    // El servidor no cumple con la expectativa indicada en el encabezado "Expect". Ejemplo: El cliente envió una solicitud con la expectativa de que el servidor realice una acción específica que no puede cumplir.
    _418_IM_A_TEAPOT: 418,       // Código de broma del RFC 2324. Ejemplo: Servidor que se niega a preparar café porque es una tetera.
    _421_MISDIRECTED_REQUEST: 421, // La solicitud fue dirigida a un servidor que no puede producir una respuesta. Ejemplo: HTTP/2 con servidor incorrecto.
    _422_UNPROCESSABLE_ENTITY: 422, // La solicitud está bien formada pero contiene errores semánticos. Ejemplo: Validación de datos que falla en un API REST.
    _423_LOCKED: 423,            // El recurso está bloqueado. Ejemplo: Un archivo está siendo editado por otro usuario.
    _424_FAILED_DEPENDENCY: 424, // La solicitud falló debido a una falla en una solicitud anterior. Ejemplo: Operación que depende de otra que falló.
    _425_TOO_EARLY: 425,         // El servidor no está dispuesto a procesar una solicitud que podría ser repetida. Ejemplo: Prevención de ataques de repetición.
    _426_UPGRADE_REQUIRED: 426,  // El cliente debe cambiar a un protocolo diferente. Ejemplo: Servidor que requiere HTTPS en lugar de HTTP.
    _428_PRECONDITION_REQUIRED: 428, // El servidor requiere que la solicitud sea condicional. Ejemplo: Prevención de conflictos de escritura simultánea.
    _429_TOO_MANY_REQUESTS: 429, // El usuario ha enviado demasiadas solicitudes en un tiempo determinado. Ejemplo: Límite de velocidad de API excedido.
    _431_REQUEST_HEADER_FIELDS_TOO_LARGE: 431, // Los encabezados de la solicitud son demasiado grandes. Ejemplo: Cookies excesivamente grandes.
    _451_UNAVAILABLE_FOR_LEGAL_REASONS: 451, // El recurso no está disponible por razones legales. Ejemplo: Contenido bloqueado por censura gubernamental.

    // Errores del servidor (5xx)
    _500_INTERNAL_SERVER_ERROR: 500, // Error genérico del servidor. Ejemplo: El servidor encontró una condición inesperada que le impide cumplir con la solicitud.
    _501_NOT_IMPLEMENTED: 501,       // El servidor no puede cumplir con la solicitud porque no ha implementado la funcionalidad requerida. Ejemplo: El servidor recibe una solicitud para un método HTTP que no está soportado.
    _502_BAD_GATEWAY: 502,           // El servidor recibió una respuesta inválida de otro servidor al intentar procesar la solicitud. Ejemplo: El servidor actúa como un proxy y el servidor ascendente falla.
    _503_SERVICE_UNAVAILABLE: 503,   // El servidor no está disponible temporalmente (por ejemplo, mantenimiento). Ejemplo: El servidor está en mantenimiento y no puede procesar solicitudes.
    _504_GATEWAY_TIMEOUT: 504,        // El servidor no recibió una respuesta a tiempo de un servidor ascendente. Ejemplo: El servidor está esperando una respuesta de otro servidor y no la recibe dentro del tiempo esperado.
    _505_HTTP_VERSION_NOT_SUPPORTED: 505, // El servidor no soporta la versión HTTP utilizada en la solicitud. Ejemplo: El cliente envía una solicitud con una versión de HTTP que el servidor no reconoce o no es compatible.
    _506_VARIANT_ALSO_NEGOTIATES: 506, // El servidor tiene un error de configuración interna. Ejemplo: Negociación de contenido circular.
    _507_INSUFFICIENT_STORAGE: 507,  // El servidor no puede almacenar la representación necesaria para completar la solicitud. Ejemplo: Espacio insuficiente en disco.
    _508_LOOP_DETECTED: 508,         // El servidor detectó un bucle infinito al procesar la solicitud. Ejemplo: Redirecciones circulares.
    _510_NOT_EXTENDED: 510,          // Se requieren más extensiones para que el servidor pueda cumplir la solicitud. Ejemplo: Protocolo HTTP extendido requerido.
    _511_NETWORK_AUTHENTICATION_REQUIRED: 511, // El cliente necesita autenticarse para obtener acceso a la red. Ejemplo: WiFi público que requiere autenticación.
};

// Función auxiliar para obtener el mensaje de un código
export const getHttpStatusMessage = (code) => {
    const messages = {
        100: 'Continue',
        101: 'Switching Protocols',
        102: 'Processing',
        103: 'Early Hints',
        200: 'OK',
        201: 'Created',
        202: 'Accepted',
        204: 'No Content',
        301: 'Moved Permanently',
        302: 'Found',
        400: 'Bad Request',
        401: 'Unauthorized',
        403: 'Forbidden',
        404: 'Not Found',
        429: 'Too Many Requests',
        500: 'Internal Server Error',
        502: 'Bad Gateway',
        503: 'Service Unavailable',
        504: 'Gateway Timeout'
    };
    return messages[code] || 'Unknown Status';
};

// Función auxiliar para verificar si un código es informativo
export const isInformationalCode = (code) => code >= 100 && code < 200;

// Función auxiliar para verificar si un código es de éxito
export const isSuccessCode = (code) => code >= 200 && code < 300;

// Función auxiliar para verificar si un código es de error del cliente
export const isClientError = (code) => code >= 400 && code < 500;

// Función auxiliar para verificar si un código es de error del servidor
export const isServerError = (code) => code >= 500 && code < 600;