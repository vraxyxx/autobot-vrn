const axios = require('axios');
const fs = require('fs');

module.exports.config = {
    name: "welcomenoti",
    version: "1.4.0",
    credits: "Vern",
    description: "Sends a stylish welcome message with an image and info when someone joins.",
    usages: "Triggered automatically when someone joins.",
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
╔══════════════════════════════════╗
║ 👋 𝙒𝙚𝙡𝙘𝙤𝙢𝙚 𝙩𝙤 ${groupName}!
║ ━━━━━━━━━━━━━━━━━━━━━━━━
║ 💠 𝗡𝗮𝗺𝗲: ${prefix} ${name}
║ 💠 𝗠𝗲𝗺𝗯𝗲𝗿 #: ${memberCount}
║ 💠 𝗝𝗼𝗶𝗻𝗲𝗱 𝗔𝘁: ${joinDate}
║ 💠 𝗢𝘄𝗻𝗲𝗿: ${ownerName}
║ 💠 𝗔𝗱𝗺𝗶𝗻𝘀: ${adminsString}
║ 💠 𝗕𝗼𝘁 𝗨𝗽𝘁𝗶𝗺𝗲: ${uptime}
║ ━━━━━━━━━━━━━━━━━━━━━━━━
║ 🌟 𝗘𝗻𝗷𝗼𝘆 𝘆𝗼𝘂𝗿 𝘀𝘁𝗮𝘆!
║ ❤️ 𝗧𝗵𝗶𝘀 𝗯𝗼𝘁 𝗶𝘀 𝗺𝗮𝗱𝗲 𝗯𝘆 𝗩𝗲𝗿𝗻
║ 🛠️ 𝗖𝗿𝗲𝗮𝘁𝗶𝗻𝗴 𝗮𝘄𝗲𝘀𝗼𝗺𝗲 𝗲𝘅𝗽𝗲𝗿𝗶𝗲𝗻𝗰𝗲𝘀 𝗳𝗼𝗿 𝘆𝗼𝘂!
╚══════════════════════════════════╝`;

                await api.sendMessage({
                    body: welcomeMessage,
                    attachment: fs.createReadStream(filePath)
                }, event.threadID, () => fs.unlinkSync(filePath));

            } catch (imageError) {
                console.error("Error fetching welcome image:", imageError);
                const fallbackMessage = `
╔══════════════════════╗
║ 👋 Welcome ${prefix} ${name}!
║ 🎉 You're member #${memberCount} in ${groupName}
║ ❤️ All of these made by Vern —bot-site-creator!
╚══════════════════════╝`;
                await api.sendMessage({ body: fallbackMessage }, event.threadID);
            }

        } catch (err) {
            console.error("Error during welcome message:", err);
            await api.sendMessage("An error occurred while processing the welcome message.", event.threadID);
        }
    }
};
