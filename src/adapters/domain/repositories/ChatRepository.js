class ChatRepository {

    async getAds({ productInfo }) {
        try {
            return { respuesta: productInfo };
        } catch (error) {
            console.error(error.message);
            return { error: "No fue posible obtener los usuarios." };
        }
    }
}

export const usersRepository = new ChatRepository();