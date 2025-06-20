const axios = require("axios");

module.exports.config = {
  name: "crushimg",
  version: "1.0.0",
  role: 0,
  credits: "vern",
  description: "Generate anime-style image from a text prompt using CrushImg",
  usage: "/crushimg <prompt> -style <style>",
  prefix: true,
  cooldowns: 5,
  commandCategory: "Image"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const prefix = "/";

  let style = "anime";
  let prompt = args.join(" ");

  const styleIndex = args.findIndex(arg => arg === "-style");
  if (styleIndex !== -1 && args[styleIndex + 1]) {
    style = args[styleIndex + 1];
    prompt = args.slice(0, styleIndex).join(" ");
  }

  if (!prompt || prompt.trim().length < 2) {
    const usageMsg = `════『 𝗖𝗥𝗨𝗦𝗛𝗜𝗠𝗚 』════\n\n` +
      `🎨 Generate AI art using a custom prompt.\n\n` +
      `📌 Usage: ${prefix}crushimg <prompt> -style <style>\n` +
      `💬 Example: ${prefix}crushimg cat in city -style anime`;
    return api.sendMessage(usageMsg, threadID, messageID);
  }

  try {
    const waitMsg = `🎨 Generating image for prompt:\n"${prompt}"\n🔧 Style: ${style}\n\nPlease wait...`;
    await api.sendMessage(waitMsg, threadID, messageID);

    const apiUrl = `https://haji-mix.up.railway.app/api/crushimg?prompt=${encodeURIComponent(prompt)}&style=${encodeURIComponent(style)}&negative_prompt=&api_key=48eb5b9082471e96afe7b11ea62e6c32bd595fbad9ca43092d900ae8fe547da8`;

    const response = await axios.get(apiUrl);
    const imageUrl = response.data?.image || response.data?.result || response.data?.url;

    if (!imageUrl) {
      return api.sendMessage("❌ Failed to generate image. Please try again later.", threadID, messageID);
    }

    return api.sendMessage({
      attachment: await global.utils.getStreamFromURL(imageUrl)
    }, threadID);

  } catch (error) {
    console.error("❌ CrushImg Error:", error.message || error);
    return api.sendMessage(
      `❌ Error generating image:\n${error.message || "Unknown error"}`,
      threadID,
      messageID
    );
  }
};
