import { generateProductInfo } from "../../usecases/chat/GenerateDetailedProductInfo.js";

export async function controllerGenerateDetailedProductInfo(req, res) {
    try {
        const data = req.body;

        const detailedProductInfo = generateProductInfo(data);
        res.json({ respuesta: detailedProductInfo });
    } catch (error) {
        console.error(error.message);
        res.send({ error: 500 });
    }
}