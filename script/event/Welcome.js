const axios = require('axios');
const fs = require('fs');

module.exports.config = {
    name: "welcomenoti",
    version: "1.3.0",
    credits: "Vern",
    description: "Sends a decorated welcome message with an image when a new member joins.",
    usages: "No command usage, triggered automatically.",
    cooldown: 5,
};

module.exports.handleEvent = async function ({ api, event }) {
    if (event.logMessageType === "log:subscribe") {
        try {
            const addedParticipants = event.logMessageData.addedParticipants;
            const senderID = addedParticipants[0].userFbId;
            let userInfo = await api.getUserInfo(senderID);
            let name = userInfo[senderID].name;
            const gender = userInfo[senderID]?.gender;
            const prefix = gender === 2 ? "Mr." : gender === 1 ? "Miss" : "";

            const maxLength = 15;
            if (name.length > maxLength) {
                name = name.substring(0, maxLength - 3) + '...';
            }

            const groupInfo = await api.getThreadInfo(event.threadID);
            const groupIcon = groupInfo.imageSrc || "https://i.ibb.co/G5mJZxs/rin.jpg";
            const memberCount = groupInfo.participantIDs.length;
            const groupName = groupInfo.threadName || "this group";
            const background = groupInfo.imageSrc || "https://i.ibb.co/4YBNyvP/images-76.jpg";
            const ownerID = groupInfo.adminIDs[0].id;
            const ownerInfo = await api.getUserInfo(ownerID);
            const ownerName = ownerInfo[ownerID].name;
            const joinDate = new Date(event.logMessageData.timestamp || Date.now()).toLocaleString();
            const adminNames = groupInfo.adminIDs.map(async admin => (await api.getUserInfo(admin.id))[admin.id].name);
            const adminsString = (await Promise.all(adminNames)).join(", ");

            const startTime = global.startTime;
            let uptime = "N/A";
            if (startTime) {
                const now = Date.now();
                const diff = now - startTime;
                const seconds = Math.floor(diff / 1000);
                const minutes = Math.floor(seconds / 60);
                const hours = Math.floor(minutes / 60);
                const days = Math.floor(hours / 24);
                uptime = `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
            }

            const url = `https://joshweb.click/canvas/welcome?name=${encodeURIComponent(name)}&groupname=${encodeURIComponent(groupName)}&groupicon=${encodeURIComponent(groupIcon)}&member=${memberCount}&uid=${senderID}&background=${encodeURIComponent(background)}&owner=${encodeURIComponent(ownerName)}&joindate=${encodeURIComponent(joinDate)}&admins=${encodeURIComponent(adminsString)}&uptime=${encodeURIComponent(uptime)}`;

            try {
                const { data } = await axios.get(url, { responseType: 'arraybuffer' });
                const filePath = './cache/welcome_image.jpg';
                if (!fs.existsSync('./cache')) fs.mkdirSync('./cache');
                fs.writeFileSync(filePath, Buffer.from(data));

                const welcomeMessage = `
━━━━━━━━━━━━━━━━━━━━━━
👋 Welcome ${prefix} ${name}!
🎉 You are member #${memberCount} in "${groupName}"
🏡 Group Owner: ${ownerName}
🕓 Joined: ${joinDate}
🔧 Admins: ${adminsString}
🔋 Bot Uptime: ${uptime}
━━━━━━━━━━━━━━━━━━━━━━
✨ Enjoy your stay and have fun, add me @vern!
━━━━━━━━━━━━━━━━━━━━━━`;

                await api.sendMessage({
                    body: welcomeMessage,
                    attachment: fs.createReadStream(filePath)
                }, event.threadID, () => fs.unlinkSync(filePath));

            } catch (imageError) {
                console.error("Error fetching welcome image:", imageError);
                const fallbackMessage = `👋 Welcome ${prefix} ${name} to "${groupName}"!\nYou're member #${memberCount}. Enjoy your stay!`;
                await api.sendMessage({ body: fallbackMessage }, event.threadID);
            }

        } catch (err) {
            console.error("Error during welcome message:", err);
            await api.sendMessage("An error occurred while processing the welcome message.", event.threadID);
        }
    }
};
