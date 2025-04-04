require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/generar-personaje", async (req, res) => {
    try {
        const { raza, clase, nivel } = req.body;
        console.log(`Generando personaje: ${raza} - ${clase} - Nivel ${nivel}`);

        // Updated prompt for more detailed character sheet
        const prompt = `
            Genera una ficha de personaje de D&D 5e en formato JSON. Ajusta la complejidad según "nivel=${nivel}".
            Incluye:
            - "nombre": un nombre creativo
            - "descripcion": {
                "raza": "${raza}",
                "clase": "${clase}",
                "nivel": ${nivel},
                "alineamiento": "Alineamiento apropiado",
                "edad": "Edad típica de la raza",
                "historia": "Historia breve del personaje"
            }
            - "atributos": {
                "Fuerza": numero,
                "Destreza": numero,
                "Constitucion": numero,
                "Inteligencia": numero,
                "Sabiduria": numero,
                "Carisma": numero
            }
            - "habilidades": [
                "Lista de habilidades con bonificadores. Incluye unas 5-10 habilidades relevantes."
            ]
            - "equipo": [
                "Lista de equipo apropiado para la clase y nivel. Añade armamento, armaduras o útiles de aventurero"
            ]
            - "hechizos": {
                "espaciosHechizo": {
                    "nivel1": numero,
                    "nivel2": numero,
                    "nivel3": numero,
                    "nivel4": numero // etc. según el nivel
                },
                "listaHechizos": [
                    "Listado apropiado de hechizos para la clase y nivel"
                ]
            }
            - "trasfondo": "Texto más detallado sobre motivaciones, historia y rasgos de personalidad."
            
            Solo devuelve el JSON en formato válido sin texto adicional.
        `;

        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                max_tokens: 1500
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                    "Content-Type": "application/json"
                },
                timeout: 15000
            }
        );

        const responseContent = response.data.choices[0].message.content.trim();
        console.log("Respuesta recibida:", responseContent.substring(0, 100) + "...");

        const ficha = JSON.parse(responseContent);
        res.json(ficha);

    } catch (error) {
        console.error("Error:", error.message);
        if (error.response) {
            console.error("API error data:", error.response.data);
        }
        res.status(500).json({ error: "Error al generar la ficha" });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});