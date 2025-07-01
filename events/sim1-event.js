const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

const ENABLED_FILE = path.join(__dirname, "../data/simsimi-enabled.json");
const MODE_FILE = path.join(__dirname, "../data/simsimi-mode.json");
let enabledThreads = [], modeData = {};

fs.ensureDirSync(path.dirname(ENABLED_FILE));
fs.ensureFileSync(MODE_FILE);

if (fs.existsSync(ENABLED_FILE)) {
  try { enabledThreads = fs.readJSONSync(ENABLED_FILE); } catch {}
}
try { modeData = fs.readJSONSync(MODE_FILE); } catch {}

async function fetchReply(text, mode = "normal") {
  const apiKey = "3f722ddc86104152a7f6c9aa951e6136b94cf0fd";
  try {
    const res = await axios.get("https://simsimi.ooguy.com/sim", {
      params: { query: text, apikey: apiKey }
    });
    let message = res.data?.message || null;
    if (mode === "angry" && message) {
      message = "😤 " + message
        .replace(/you/gi, "you dumb")
        .replace(/why/gi, "why the hell")
        .replace(/what/gi, "what the hell")
        .replace(/\.$/, " 🤬.")
        .replace(/^/g, "");
    }
    return message;
  } catch {
    return null;
  }
}

module.exports = async function ({ api, event }) {
  const { threadID, senderID, body } = event;
  if (!enabledThreads.includes(threadID)) return;
  if (!body || senderID === api.getCurrentUserID()) return;

  const mode = modeData[threadID] || "normal";
  const reply = await fetchReply(body, mode);
  if (reply) api.sendMessage(reply, threadID);
};
