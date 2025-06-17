const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
}

module.exports = {
  name: 'chords',
  description: 'Search for guitar chords by song title.',

  async execute(senderId, args, pageAccessToken, event) {
    const repliedText = event.message?.reply_to?.message || "";
    const userInput = args.join(" ").trim();
    const query = [repliedText, userInput].filter(Boolean).join(" ").trim();

    if (!query) {
      return sendMessage(senderId, {
        text: '🎸 𝗘𝗿𝗿𝗼𝗿: 𝗣𝗹𝗲𝗮𝘀𝗲 𝗲𝗻𝘁𝗲𝗿 𝗼𝗿 𝗿𝗲𝗽𝗹𝘆 𝗮 𝘀𝗼𝗻𝗴 𝘁𝗶𝘁𝗹𝗲.\n𝗘𝘅𝗮𝗺𝗽𝗹𝗲: chords dilaw by maki'
      }, pageAccessToken);
    }

    try {
      const apiUrl = `https://wrapped-rest-apis.vercel.app/api/chords?title=${encodeURIComponent(query)}`;
      const { data } = await axios.get(apiUrl);

      if (!data.success || !data.chords) {
        return sendMessage(senderId, {
          text: '🎵 𝗦𝗼𝗿𝗿𝘆, 𝗰𝗵𝗼𝗿𝗱𝘀 𝗳𝗼𝗿 𝘁𝗵𝗮𝘁 𝘀𝗼𝗻𝗴 𝗰𝗼𝘂𝗹𝗱𝗻’𝘁 𝗯𝗲 𝗳𝗼𝘂𝗻𝗱.'
        }, pageAccessToken);
      }

      const chords = data.chords;
      let message = `
🎸 𝗧𝗶𝘁𝗹𝗲: ${chords.title}
🎤 𝗔𝗿𝘁𝗶𝘀𝘁: ${chords.artist}
🎼 𝗞𝗲𝘆: ${chords.key}
📖 𝗧𝘆𝗽𝗲: ${chords.type}
🔗 𝗟𝗶𝗻𝗸: ${chords.url}

🎶 𝗖𝗵𝗼𝗿𝗱𝘀:
${chords.chords}`;

      if (message.length > 2000) {
        const chunks = splitMessageIntoChunks(message, 1900);
        for (const chunk of chunks) {
          await sendMessage(senderId, { text: chunk }, pageAccessToken);
        }
      } else {
        await sendMessage(senderId, { text: message }, pageAccessToken);
      }

    } catch (error) {
      console.error('❌ Chords API error:', error.message);
      return sendMessage(senderId, {
        text: '❌ 𝗘𝗿𝗿𝗼𝗿: 𝗨𝗻𝗮𝗯𝗹𝗲 𝘁𝗼 𝗳𝗲𝘁𝗰𝗵 𝗰𝗵𝗼𝗿𝗱𝘀. 𝗣𝗹𝗲𝗮𝘀𝗲 𝘁𝗿𝘆 𝗮𝗴𝗮𝗶𝗻.'
      }, pageAccessToken);
    }
  }
};
