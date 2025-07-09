const axios = require("axios");

module.exports = {
  config: {
    name: "simbrand",
    aliases: ["sim"],
    version: "1.0",
    role: 0,
    author: "Vern",
    countDown: 5,
    longDescription: "Check mobile number's SIM card brand.",
    category: "tools",
    guide: {
      en: "{pn} <mobile_number>"
    }
  },

  onStart: async function ({ message, args, event }) {
    const number = args[0];

    if (!number) {
      return message.reply("📱 Please provide a mobile number.\n\nExample:\n/simbrand 09123456789");
    }

    try {
      const apiUrl = `https://jonell01-ccprojectsapihshs.hf.space/api/simbrand?number=${encodeURIComponent(number)}`;
      const { data } = await axios.get(apiUrl);

      if (data.error) {
        return message.reply(`❌ Error: ${data.error}`);
      }

      // Assume response has fields like: brand, prefix, location (customize if needed)
      const brandInfo = `
📱 Mobile Number: ${number}
🏷 Brand: ${data.brand || "Unknown"}
📍 Location: ${data.location || "Not Available"}
      `.trim();

      message.reply(brandInfo);

    } catch (err) {
      console.error("SIM Brand Error:", err.message);
      message.reply("❌ Failed to fetch SIM brand. Please try again later.");
    }
  }
};