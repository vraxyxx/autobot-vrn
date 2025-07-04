const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "rapsa",
    version: "1.0.0",
    role: 0,
    credits: "Vern",
    description: "Send random Shoti images",
    hasPrefix: false,
    aliases: [],
    usage: "[shotipic]",
    cooldown: 5
};

module.exports.run = async function ({ api, event }) {
    const { threadID, messageID } = event;

    try {
        const apiUrl = 'https://shoti.fbbot.org/api/get-shoti?type=image';
        const headers = {
            'apikey': 'shoti-e5ea61f538',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Gecko/20100101 Firefox/115.0'
        };

        const res = await axios.get(apiUrl, { headers });
        const data = res.data?.result;

        if (!data || !data.content || data.content.length === 0) {
            return api.sendMessage("❌ No Shoti images found.", threadID, messageID);
        }

        for (const imageUrl of data.content) {
            const filename = `shotipic_${Date.now()}.jpg`;
            const filePath = path.join(__dirname, filename);

            const imageResponse = await axios({
                url: imageUrl,
                method: "GET",
                responseType: "stream"
            });

            const writer = fs.createWriteStream(filePath);
            imageResponse.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on("finish", resolve);
                writer.on("error", reject);
            });

            await api.sendMessage(
                { attachment: fs.createReadStream(filePath) },
                threadID
            );

            fs.unlinkSync(filePath);
        }

    } catch (error) {
        console.error("ShotiPic Command Error:", error);
        api.sendMessage(
            `❌ Failed to retrieve Shoti images.\nError: ${error.message || error}`,
            threadID
        );
    }
};