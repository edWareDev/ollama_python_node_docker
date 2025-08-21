export const parseJSONByIA = (rawContent) => {
    let json_response;

    try {
        // 1. Limpiar bloques markdown
        rawContent = rawContent
            .replace(/```json\n?/gi, '')
            .replace(/```/g, '')
            .trim();

        // 2. Intentar parsear directamente
        json_response = JSON.parse(rawContent);

        return json_response;

    } catch (parseError) {
        console.log('JSON Parse Error:', parseError);
        console.log('Trying to extract JSON from response...');

        // 3. Intentar extraer JSON válido de la respuesta
        // Busca el primer objeto {} o array []
        const jsonMatch = rawContent.match(/(\{.*\}|\[.*\])/s);

        if (jsonMatch) {
            try {
                json_response = JSON.parse(jsonMatch[0]);
                return json_response;
            } catch (secondParseError) {
                console.log('Second parse attempt failed:', secondParseError);
            }
        }

        // 4. Si falla todo, devolver error
        return {
            success: false,
            error: 'Unable to parse JSON response',
            rawResponse: rawContent
        };
    }
};
