export async function controller(req, res) {
    try {
        console.log('Conectado a controlador');
        res.json({ respuesta: "ok" });
    } catch (error) {
        console.error(error.message);
        res.send({ error: 500 });
    }
}