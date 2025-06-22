const path = require('path');
const fs = require('fs-extra');

module.exports.config = {
    name: "tiksearch",
    version: "1.0.0",
    role: 0,
    description: "Search TikTok videos by keyword.",
    prefix: false,
    premium: false,
    credits: "Vern",
    cooldowns: 10,
    category: "media"
};

module.exports.run = async function ({ api, event, args }) {
    if (!args[0]) {
        return api.sendMessage('❗ 𝗣𝗹𝗲𝗮𝘀𝗲 𝗲𝗻𝘁𝗲𝗿 𝗧𝗶𝗸𝗧𝗼𝗸 𝗸𝗲𝘆𝘄𝗼𝗿𝗱.', event.threadID, event.messageID);
    }

    const query = encodeURIComponent(args.join(' '));
    const url = `https://kaiz-apis.gleeze.com/api/tiksearch?search=${query}&apikey=APIKEY `;

    try {
        api.sendMessage("🔎 𝗦𝗲𝗮𝗿𝗰𝗵𝗶𝗻𝗴 𝗧𝗶𝗸𝗧𝗼𝗸 𝘃𝗶𝗱𝗲𝗼𝘀, 𝗽𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁...", event.threadID, event.messageID);

        const { data } = await axios.get(url);
        const video = data?.data?.videos?.[0];

        if (!video) {
            return api.sendMessage('❌ 𝗡𝗼 𝗧𝗶𝗸𝗧𝗼𝗸 𝘃𝗶𝗱𝗲𝗼 𝗳𝗼𝘂𝗻𝗱. 𝗧𝗿𝘆 𝗮 𝗱𝗶𝗳𝗳𝗲𝗿𝗲𝗻𝘁 𝗸𝗲𝘆𝘄𝗼𝗿𝗱.', event.threadID, event.messageID);
        }

        const fileName = `${event.messageID}.mp4`;
        const filePath = path.join(__dirname, fileName);

        const download = await axios({
            method: 'GET',
            url: video.play,
            responseType: 'stream',
        });

        const writer = fs.createWriteStream(filePath);
        download.data.pipe(writer);

        writer.on('finish', () => {
            api.sendMessage({
                body: `🎬 𝗧𝗶𝘁𝗹𝗲: ${video.title.slice(0, 80)}\n👤 𝗔𝘂𝘁𝗵𝗼𝗿: ${video.author.nickname || video.author.unique_id}`,
                attachment: fs.createReadStream(filePath)
            }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
        });

        writer.on('error', () => {
            api.sendMessage('🚫 𝗘𝗿𝗿𝗼𝗿 𝗱𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗶𝗻𝗴 𝘃𝗶𝗱𝗲𝗼. 𝗧𝗿𝘆 𝗮𝗴𝗮𝗶𝗻.', event.threadID, event.messageID);
        });

    } catch (err) {
        console.error('TikTok search error:', err);
        return api.sendMessage('⚠️ 𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝗳𝗲𝘁𝗰𝗵 𝗧𝗶𝗸𝗧𝗼𝗸 𝘃𝗶𝗱𝗲𝗼. 𝗧𝗿𝘆 𝗹𝗮𝘁𝗲𝗿.', event.threadID, event.messageID);
    }
};