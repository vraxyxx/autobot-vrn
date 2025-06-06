const fs = require("fs");
const axios = require("axios");
const path = require("path");
const configPath = "./config.json";
const config = JSON.parse(fs.readFileSync(configPath));

module.exports = {
    name: "prefix",
    usePrefix: false,
    usage: "prefix",
    version: "1.1",
    description: "Displays the bot's prefix and a GIF.",
    cooldown: 5,
    admin: false,

    execute: async ({ api, event }) => {
        const { threadID, messageID } = event;
        const botPrefix = config.prefix || "/";
        const botName = config.botName || "My Bot";
        const gifUrl = "https://media.giphy.com/media/1UwhOK8VX95TcfPBML/giphy.gif";
        const tempFilePath = path.join(__dirname, "prefix.gif");

        try {
            // Download GIF
            const response = await axios({
                url: gifUrl,
                method: "GET",
                responseType: "stream",
            });

            const writer = fs.createWriteStream(tempFilePath);
            response.data.pipe(writer);

            writer.on("finish", () => {
                api.sendMessage(
                    {
                        body: ` Bot Information\n📌Prefix: ${botPrefix}\n🆔 Bot Name: ${botName}\n\nThanks for using my Fbot`,
                        attachment: fs.createReadStream(tempFilePath),
                    },
                    threadID,
                    () => fs.unlinkSync(tempFilePath) // Delete after sending
                );
            });

            writer.on("error", (err) => {
                console.error("Error saving GIF:", err);
                api.sendMessage("⚠️ Failed to send GIF.", threadID, messageID);
            });

        } catch (error) {
            console.error("Error fetching GIF:", error);
            api.sendMessage("⚠️ Could not retrieve GIF.", threadID, messageID);
        }
    },
};