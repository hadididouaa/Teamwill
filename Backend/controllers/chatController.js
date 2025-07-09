const axios = require("axios");

const sendChatMessage = async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    // Message système pour limiter au domaine de la psychologie
    const systemMessage = {
      role: "system",
      content: "Vous êtes un assistant spécialisé en psychologie. Répondez uniquement aux questions liées à la psychologie et informez l'utilisateur si la question est hors sujet."
    };
    
    const messagesWithSystem = [systemMessage, ...messages];

    const response = await axios.post(
      "https://api.mistral.ai/v1/chat/completions",
      {
        model: "mistral-tiny",
        messages: messagesWithSystem,
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.MISTRAL_API_KEY}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        timeout: 30000 // 30 secondes timeout
      }
    );

    if (!response.data.choices || !response.data.choices[0].message) {
      throw new Error("Réponse inattendue de l'API Mistral");
    }

    res.json({
      content: response.data.choices[0].message.content,
      });

  } catch (error) {
    console.error("Erreur complète:", error);
    const statusCode = error.response?.status || 500;
    const errorData = {
      error: "Échec du traitement de la requête",
      details: error.message,
      ...(error.response?.data && { apiError: error.response.data })
    };

    res.status(statusCode).json(errorData);
  }
};

module.exports = { sendChatMessage };