const API_DEFAULT_PORT = 3000;

export const startServer = (app) => {

    return new Promise((resolve, reject) => {
        const PORT = process.env.API_PORT || API_DEFAULT_PORT;

        const server = app.listen(PORT, async () => {
            const MESSAGE = process.env.NODE_ENV === "development"
                ? `Conectado al servidor mediante el puerto: ${PORT}`
                : 'Conectado al servidor';
            console.log(new Date(), MESSAGE);
            resolve(server);
            return;
        });

        server.on('error', async (error) => {
            let errorMessage;

            switch (error.code) {
                case 'EADDRINUSE':
                    errorMessage = `El puerto ${PORT} está ocupado`;
                    break;
                case 'EACCES':
                    errorMessage = `No se tienen permisos para usar el puerto ${PORT}`;
                    break;
                default:
                    errorMessage = `Error al iniciar el servidor: ${error.message}`;
            }

            console.error(new Date(), errorMessage);
            reject(error);
            return;
        });
    });
};