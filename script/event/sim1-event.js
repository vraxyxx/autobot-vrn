const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

const ENABLED_FILE = path.join(__dirname, "../data/simsimi-enabled.json");
let enabledThreads = [];

fs.ensureDirSync(path.dirname(ENABLED_FILE));
if (fs.existsSync(ENABLED_FILE)) {
  try {
    enabledThreads = fs.readJSONSync(ENABLED_FILE);
  } catch (e) {
    console.error("❌ Failed to read enabledThreads:", e);
    enabledThreads = [];
  }
}

async function fetchReply(text) {
  const apiKey = "3f722ddc86104152a7f6c9aa951e6136b94cf0fd";
  if (!text.trim()) return null;
  try {
    const res = await axios.get("https://simsimi.ooguy.com/sim", {
      params: { query: text, apikey: apiKey }
    });
    if (res.data?.message) return res.data.message;
    if (res.data?.error) return `⚠️ Simsimi says: ${res.data.error}`;
    return "🤖 I didn't get that.";
  } catch (err) {
    console.error("❌ Simsimi API error:", err.response?.data || err.message);
    return null;
  }
}

module.exports = async function ({ api, event }) {
  const { threadID, senderID, body } = event;
  if (!enabledThreads.includes(threadID)) return;
  if (!body || senderID === api.getCurrentUserID()) return;

  const reply = await fetchReply(body);
  if (reply) api.sendMessage(reply, threadID);
};
