const axios = require("axios");

module.exports.config = {
  name: "aidetect",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: [],
  description: "Detects if the input text is AI or human written",
  usage: "aidetect <your text>",
  credits: "Vern",
  cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;
  const messageID = event.messageID;

  const query = args.join(" ");
  if (!query) {
    return api.sendMessage(
      "Error: Please provide text to analyze.",
      threadID,
      messageID
    );
  }

  const apiUrl = `https://kaiz-apis.gleeze.com/api/aidetector?q=${encodeURIComponent(
    query
  )}&apikey=YOUR_APIKEY`;

  try {
    const { data } = await axios.get(apiUrl, {
      headers: {
        Accept: "application/json",
      },
    });

    const result = data.response.data;

    const feedback = result.feedback;
    const confidence = result.isHuman;
    const input = result.input_text;

    const reply =
      "─────────────\n" +
      "AI Detector\n" +
      `Input: "${input}"\n` +
      `Confidence: ${confidence}% Human\n` +
      `Result: ${feedback}\n` +
      "─────────────";

    return api.sendMessage(reply, threadID, messageID);
  } catch (error) {
    console.error("AIDetector error:", error.message);
    return api.sendMessage(
      "Error: AI Detector request failed.",
      threadID,
      messageID
    );
  }
};