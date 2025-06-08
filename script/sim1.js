const axios = require('axios');

module.exports.config = {
  name: "sim1",
  version: "4.3.8",
  role: 0,
  description: "Chat with Simsimi AI (ooguy.com API).",
  prefix: false,
  premium: false,
  credits: "vern",
  cooldowns: 5,
  category: "chat"
};

// Keeps track of which threads have Simsimi enabled
const simEnabledThreads = new Set();

// Your Simsimi ooguy.com API key
const apiKey = "your-simsimi-apikey"; // <-- Replace with your actual API key

/**
 * Fetch Simsimi reply from API
 * @param {string} text - The user's message
 * @returns {object} - { error: boolean, data: object|null }
 */
async function fetchSimsimiReply(text) {
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return { error: false, data: { success: "🤖 Simsimi needs something to reply to!" } };
  }
  try {
    const apiUrl = `https://simsimi.ooguy.com/sim?query=${encodeURIComponent(text)}&apikey=${apiKey}`;
    const res = await axios.get(apiUrl);
    if (res.data && typeof res.data.message === "string") {
      return { error: false, data: { success: res.data.message } };
    } else if (res.data && typeof res.data.error === "string") {
      return { error: false, data: { error: res.data.error } };
    } else {
      return { error: false, data: { error: "🤖 Simsimi didn't understand that." } };
    }
  } catch (err) {
    console.error("Simsimi API error:", err?.response?.data || err.message || err);
    return { error: true, data: null };
  }
}

/**
 * Auto-reply event handler
 * Replies automatically in threads where Simsimi is enabled
 */
module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, messageID, senderID, body } = event;
  if (!simEnabledThreads.has(threadID)) return;
  if (!body || senderID === api.getCurrentUserID()) return;
  const reply = await fetchSimsimiReply(body);
  if (reply.error) return;
  const message = reply.data.success || reply.data.error || "🤖 Simsimi didn't understand that.";
  return api.sendMessage(message, threadID, messageID);
};

/**
 * Command to manually control Simsimi:
 * Usage:
 *  /sim1 on   - enable auto replies
 *  /sim1 off  - disable auto replies
 *  /sim1 [text] - get a one-time reply from Simsimi
 */
module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const send = (msg) => api.sendMessage(msg, threadID, messageID);

  if (!args.length) {
    return send("💬 Send a message or use `on` / `off` to control Simsimi.");
  }

  const command = args[0].toLowerCase();

  if (command === "on") {
    if (simEnabledThreads.has(threadID)) {
      return send("⚠️ Simsimi is already enabled.");
    }
    simEnabledThreads.add(threadID);
    return send("✅ Simsimi has been enabled.");
  }

  if (command === "off") {
    if (!simEnabledThreads.has(threadID)) {
      return send("⚠️ Simsimi is already disabled.");
    }
    simEnabledThreads.delete(threadID);
    return send("❎ Simsimi has been disabled.");
  }

  // Manual one-time reply
  const query = args.join(" ");
  const reply = await fetchSimsimiReply(query);
  if (reply.error) return send("🚫 Error communicating with Simsimi.");
  const message = reply.data.success || reply.data.error || "🤖 Simsimi didn't understand that.";
  return send(message);
};