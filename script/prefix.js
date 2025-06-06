const fs = require("fs");
const axios = require("axios");
const path = require("path");
const util = require("util");
const unlinkAsync = util.promisify(fs.unlink);

// Load config once, avoid reading every time
const config = JSON.parse(fs.readFileSync("./config.json"));

module.exports.config = {
  name: "prefix",
  version: "1.2",
  role: 0,
  description: "Displays the bot's prefix and a GIF.",
  prefix: false,
  premium: false,
  credits: "vern",
  cooldowns: 5,
  category: "info"
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;
  const botPrefix = config.prefix || "/";
  const botName = config.botName || "My Bot";
  const gifUrl = "https://media.giphy.com/media/1UwhOK8VX95TcfPBML/giphy.gif";

  // Use a unique temp filename per call to avoid conflicts
  const tempFilePath = path.join(__dirname, `prefix_${Date.now()}.gif`);

  try {
    const response = await axios({
      url: gifUrl,
      method: "GET",
      responseType: "stream"
    });

    // Save GIF to temp file
    const writer = fs.createWriteStream(tempFilePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    // Send the message with GIF attachment
    await new Promise((resolve, reject) => {
      api.sendMessage({
        body: `🤖 𝗕𝗼𝘁 𝗜𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻\n📌 𝗣𝗿𝗲𝗳𝗶𝘅: ${botPrefix}\n🆔 𝗕𝗼𝘁 𝗡𝗮𝗺𝗲: ${botName}\n\n🙏 𝗧𝗵𝗮𝗻𝗸𝘀 𝗳𝗼𝗿 𝘂𝘀𝗶𝗻𝗴 𝗺𝘆 𝗯𝗼𝘁!`,
        attachment: fs.createReadStream(tempFilePath)
      }, threadID, (err) => {
        if (err) reject(err);
        else resolve();
      }, messageID);
    });

    // Clean up the temp file asynchronously
    await unlinkAsync(tempFilePath).catch(e => console.warn("Failed to delete temp gif:", e));

  } catch (error) {
    console.error("Error in prefix command:", error);
    api.sendMessage("⚠️ Failed to fetch or send the GIF.", threadID, messageID);
  }
};
