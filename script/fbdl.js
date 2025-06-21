const axios = require('axios');
const path = require('path');
const fs = require('fs-extra');

module.exports.config = {
    name: "fbdl",
    version: "1.0.0",
    permission: 0,
    description: "Download Facebook video using external API",
    prefix: false,
    premium: false,
    credits: "developer",
    cooldowns: 10,
    category: "media"
};

module.exports.run = async function ({ api, event, args }) {
    const messageText = args.join(' ');
    const facebookLinkRegex = /https:\/\/www\.facebook\.com\/\S+/;

    if (!facebookLinkRegex.test(messageText)) {
        return api.sendMessage("❌ Please provide a valid Facebook video link.", event.threadID, event.messageID);
    }

    try {
        api.sendMessage("📥 𝖣𝗈𝗐𝗇𝗅𝗈𝖺𝖽𝗂𝗇𝗀 𝖥𝖺𝖼𝖾𝖻𝗈𝗈𝗄 𝗏𝗂𝖽𝖾𝗈, 𝗉𝗅𝖾𝖺𝗌𝖾 𝗐𝖺𝗂𝗍...", event.threadID, event.messageID);

        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
            'Content-Type': 'application/json',
        };

        const apiUrl = `https://betadash-api-swordslush-production.up.railway.app/fbdl?url=${encodeURIComponent(messageText)}`;
        const headResponse = await axios.head(apiUrl, { headers });
        const fileSize = parseInt(headResponse.headers['content-length'], 10);

        if (fileSize > 25 * 1024 * 1024) {
            return api.sendMessage({
                body: "⚠️ The video is larger than 25MB and cannot be sent directly.\n\nClick the button below to watch it.",
                attachment: null,
                buttons: [
                    {
                        type: "web_url",
                        url: apiUrl,
                        title: "Watch Video"
                    }
                ]
            }, event.threadID, event.messageID);
        }

        const fileName = `${event.messageID}.mp4`;
        const filePath = path.join(__dirname, fileName);

        const videoStream = await axios({
            method: 'GET',
            url: apiUrl,
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(filePath);
        videoStream.data.pipe(writer);

        writer.on('finish', () => {
            api.sendMessage({
                body: "✅ Here's your downloaded Facebook video!",
                attachment: fs.createReadStream(filePath)
            }, event.threadID, () => {
                fs.unlinkSync(filePath); // clean up
            }, event.messageID);
        });

        writer.on('error', () => {
            api.sendMessage("❌ Error while saving the video. Please try again later.", event.threadID, event.messageID);
        });

    } catch (error) {
        console.error('Facebook download error:', error.message);
        api.sendMessage("❌ Failed to download the Facebook video. Please try again later.", event.threadID, event.messageID);
    }
};