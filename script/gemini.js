const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');

// Replace this with your actual API key
const GEMINI_API_URL = "https://kaiz-apis.gleeze.com/api/gemini-vision";
const GEMINI_API_KEY = "YOUR_APIKEY";

const fontMapping = {
  'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚',
  'H': '𝗛', 'I': '𝗜', 'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡',
  'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥', 'S': '𝗦', 'T': '𝗧', 'U': '𝗨',
  'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭',
  'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴',
  'h': '𝗵', 'i': '𝗶', 'j': '𝗷', 'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻',
  'o': '𝗼', 'p': '𝗽', 'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁', 'u': '𝘂',
  'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇'
};

function convertToBold(text) {
  return [...text].map(char => fontMapping[char] || char).join('');
}

module.exports = {
  name: "gemini",
  description: "Analyze images or text with Gemini Vision",
  author: "vern",

  async execute(senderId, args, pageAccessToken, event, imageUrl = "") {
    const replied = event.message?.reply_to?.message || "";
    const userPrompt = args.join(" ");
    const finalPrompt = [replied, userPrompt].filter(Boolean).join(" ").trim();

    if (!finalPrompt) {
      return sendMessage(senderId, {
        text: "❌ 𝗣𝗟𝗘𝗔𝗦𝗘 𝗥𝗘𝗣𝗟𝗬 𝗧𝗢 𝗔𝗡 𝗜𝗠𝗔𝗚𝗘 𝗢𝗥 𝗧𝗬𝗣𝗘 𝗔 𝗣𝗥𝗢𝗠𝗣𝗧."
      }, pageAccessToken);
    }

    try {
      // If imageUrl not passed, try to extract from reply or direct image
      if (!imageUrl) {
        const reply = event.message?.reply_to;
        if (reply?.attachments?.[0]?.type === "image") {
          imageUrl = reply.attachments[0].payload.url;
        } else if (event.message?.attachments?.[0]?.type === "image") {
          imageUrl = event.message.attachments[0].payload.url;
        }
      }

      const res = await axios.get(GEMINI_API_URL, {
        params: {
          q: finalPrompt,
          uid: senderId,
          imageUrl,
          apikey: GEMINI_API_KEY
        }
      });

      const resultText = res.data?.response || "❌ No response from Gemini.";
      const formatted = `
𝗚𝗘𝗠𝗜𝗡𝗜 𝗩𝗜𝗦𝗜𝗢𝗡
────────────────
${convertToBold(resultText)}
────────────────`;

      await sendInChunks(senderId, formatted, pageAccessToken);

    } catch (err) {
      console.error("❌ Gemini Error:", err);
      await sendMessage(senderId, {
        text: `❌ Error: ${err.response?.data?.message || err.message || "Unknown error"}`
      }, pageAccessToken);
    }
  }
};

async function sendInChunks(senderId, text, pageAccessToken) {
  const maxLen = 2000;
  const chunks = text.match(new RegExp(`.{1,${maxLen}}`, "g"));
  for (const msg of chunks) {
    await sendMessage(senderId, { text: msg }, pageAccessToken);
    await new Promise(r => setTimeout(r, 400));
  }
}
