const axios = require('axios');

module.exports.config = {
    name: "sim1",
    version: "4.3.7",
    role: 0,
    description: "Chat with Simsimi AI.",
    prefix: false,
    premium: false,
    credits: "Priyansh Rajput",
    cooldowns: 5,
    category: "chat"
};

const simEnabledThreads = new Map();

// Simsimi API fetch
async function fetchSimsimiReply(text) {
    try {
        const encodedText = encodeURIComponent(text);
        const res = await axios.get(`https://api.simsimi.net/v2/?text=${encodedText}&lc=en`);
        return { error: false, data: res.data };
    } catch (err) {
        return { error: true, data: null };
    }
}

// Auto-reply handler
module.exports.handleEvent = async function ({ api, event }) {
    const { threadID, messageID, senderID, body } = event;

    if (!simEnabledThreads.has(threadID)) return;
    if (!body || senderID === api.getCurrentUserID()) return;

    const reply = await fetchSimsimiReply(body);
    if (reply.error) return;

    const message = reply.data.success || reply.data.error || "🤖 Simsimi didn't understand that.";
    return api.sendMessage(message, threadID, messageID);
};

// Manual run commands: on/off/chat
module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    if (!args[0]) return send("💬 Send a message or use `on` / `off` to control Simsimi.");

    const command = args[0].toLowerCase();

    if (command === "on") {
        if (simEnabledThreads.has(threadID))
            return send("⚠️ Simsimi is already enabled.");
        simEnabledThreads.set(threadID, true);
        return send("✅ Simsimi has been enabled.");
    }

    if (command === "off") {
        if (!simEnabledThreads.has(threadID))
            return send("⚠️ Simsimi is already disabled.");
        simEnabledThreads.delete(threadID);
        return send("❎ Simsimi has been disabled.");
    }

    // Default: respond manually to the message
    const reply = await fetchSimsimiReply(args.join(" "));
    if (reply.error) return send("🚫 Error communicating with Simsimi.");
    
    const message = reply.data.success || reply.data.error || "🤖 Simsimi didn't understand that.";
    return send(message);
};
