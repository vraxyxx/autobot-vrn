const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports.config = {
    name: "avatar",
    version: "1.0",
    role: 2,   // admin level permission
    description: "Change bot avatar by URL or by replying to an image",
    prefix: false,
    credits: "Vern",
    cooldowns: 5,
    category: "admin"
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, messageReply } = event;

    let imageUrl;

    if (messageReply && messageReply.attachments && messageReply.attachments.length > 0) {
        const attachment = messageReply.attachments[0];
        if (attachment.type !== "photo") {
            return api.sendMessage("⚠️ Please reply to an image, not another type of file.", threadID, messageID);
        }
        imageUrl = attachment.url;
    } else {
        if (args.length === 0) {
            return api.sendMessage("⚠️ Please provide an image URL or reply to an image.\n📌 Usage: avatar <image_url>", threadID, messageID);
        }
        imageUrl = args[0];
    }

    try {
        const response = await axios({
            url: imageUrl,
            method: "GET",
            responseType: "stream",
            headers: { "User-Agent": "Mozilla/5.0" }
        });

        const cacheDir = path.join(__dirname, "cache");
        await fs.ensureDir(cacheDir);

        const imagePath = path.join(cacheDir, `avatar_${Date.now()}.jpg`);
        const writer = fs.createWriteStream(imagePath);

        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
        });

        const imageStream = fs.createReadStream(imagePath);

        api.changeAvatar(imageStream, "", null, async (err) => {
            try {
                await fs.unlink(imagePath);
            } catch (unlinkErr) {
                console.error("❌ Error deleting temp image file:", unlinkErr);
            }

            if (err) {
                console.error("❌ Error changing avatar:", err);
                return api.sendMessage("❌ Failed to change the avatar. Ensure the image is valid.", threadID, messageID);
            }

            api.sendMessage("✅ Bot avatar changed successfully!", threadID, messageID);
        });

    } catch (error) {
        console.error("❌ Error downloading image:", error);
        return api.sendMessage("❌ Failed to download the image. Ensure the URL is correct or reply to a valid image.", threadID, messageID);
    }
};