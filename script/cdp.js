const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "cdp",
    version: "1.0.0",
    hasPermission: 0,
    credits: "Vern",
    description: "Fetch 2 random CDP images from the API.",
    commandCategory: "image",
    usages: "cdp",
    cooldowns: 5,
    role: 0,
    hasPrefix: true
  },

  run: async function ({ api, event }) {
    const { threadID, messageID } = event;
    const msgLoading = "⏳ Fetching 2 CDP images...";

    try {
      api.sendMessage(msgLoading, threadID, async () => {
        const res = await axios.get("https://xvi-rest-api.vercel.app/api/cdp");
        const { one, two } = res.data?.result || {};

        if (!one || !two) {
          return api.sendMessage("❌ Failed to fetch CDP images.", threadID, messageID);
        }

        const img1 = (await axios.get(one, { responseType: "arraybuffer" })).data;
        const img2 = (await axios.get(two, { responseType: "arraybuffer" })).data;

        const path1 = path.join(__dirname, "cache", `cdp1_${Date.now()}.jpg`);
        const path2 = path.join(__dirname, "cache", `cdp2_${Date.now()}.jpg`);
        await fs.outputFile(path1, img1);
        await fs.outputFile(path2, img2);

        return api.sendMessage({
          body: "🖼 CDP Images",
          attachment: [
            fs.createReadStream(path1),
            fs.createReadStream(path2)
          ]
        }, threadID, () => {
          fs.unlinkSync(path1);
          fs.unlinkSync(path2);
        }, messageID);
      });
    } catch (error) {
      console.error("[cdp.js] Error:", error.message || error);
      return api.sendMessage("🚫 Error fetching CDP images. Please try again later.", threadID, messageID);
    }
  }
};
