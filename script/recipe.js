const axios = require("axios");

module.exports = {
  config: {
    name: "recipe",
    version: "1.0.0",
    aliases: ["cook", "foodie"],
    description: "Get a random recipe with ingredients and instructions.",
    usage: "recipe",
    commandCategory: "fun",
    role: 0,
    hasPrefix: true,
    credits: "Vern",
    cooldown: 3
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID } = event;

    try {
      const res = await axios.get("https://rapido.zetsu.xyz/api/recipe");
      const { name, category, ingredients, instructions } = res.data;

      const ingredientList = ingredients.map((i) => `• ${i}`).join("\n");
      const previewInstructions = instructions.length > 2000
        ? instructions.slice(0, 2000) + "..."
        : instructions;

      const message = `🍽️ 𝗥𝗘𝗖𝗜𝗣𝗘 𝗧𝗜𝗠𝗘\n\n👨‍🍳 𝗡𝗮𝗺𝗲: ${name}\n📂 𝗖𝗮𝘁𝗲𝗴𝗼𝗿𝘆: ${category}\n\n🥬 𝗜𝗻𝗴𝗿𝗲𝗱𝗶𝗲𝗻𝘁𝘀:\n${ingredientList}\n\n📋 𝗜𝗻𝘀𝘁𝗿𝘂𝗰𝘁𝗶𝗼𝗻𝘀:\n${previewInstructions}`;

      return api.sendMessage(message, threadID, messageID);
    } catch (err) {
      console.error("[recipe.js] API Error:", err.message || err);
      return api.sendMessage("❌ Couldn't fetch a recipe at the moment. Please try again later.", threadID, messageID);
    }
  }
};
