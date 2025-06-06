const fs = require("fs");
const axios = require("axios");
const path = require("path");
const config = JSON.parse(fs.readFileSync("./config.json"));

module.exports.config = {
    name: "prefix",
    version: "1.1",
    role: 0,
    description: "Displays the bot's prefix and a GIF.",
    prefix: false,
    premium: false,
    credits: "Unknown",
    cooldowns: 5,
    category: "info"
};

module.exports.run = async function ({ api, event }) {
    const { threadID, messageID } = event;
    const botPrefix = config.prefix || "/";
    const botName = config.botName || "My Bot";
    const gifUrl = "https://media.giphy.com/media/1UwhOK8VX95TcfPBML/giphy.gif";
    const tempFilePath = path.join(__dirname, "prefix.gif");

    try {
        const response = await axios({
            url: gifUrl,
            method: "GET",
            responseType: "stream"
        });

        const writer = fs.createWriteStream(tempFilePath);
        response.data.pipe(writer);

        writer.on("finish", () => {
            api.sendMessage({
                body: `🤖 𝗕𝗼𝘁 𝗜𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻\n📌 𝗣𝗿𝗲𝗳𝗶𝘅: ${botPrefix}\n🆔 𝗕𝗼𝘁 𝗡𝗮𝗺𝗲: ${botName}\n\n🙏 𝗧𝗵𝗮𝗻𝗸𝘀 𝗳𝗼𝗿 𝘂𝘀𝗶𝗻𝗴 𝗺𝘆 𝗯𝗼𝘁!`,
                attachment: fs.createReadStream(tempFilePath)
            }, threadID, () => {
                fs.unlinkSync(tempFilePath); // Clean up
            }, messageID);
        });

        writer.on("error", (err) => {
            console.error("Error saving GIF:", err);
            api.sendMessage("⚠️ Failed to send GIF.", threadID, messageID);
        });

    } catch (error) {
        console.error("Error fetching GIF:", error);
        api.sendMessage("⚠️ Could not retrieve GIF.", threadID, messageID);
    }
};
