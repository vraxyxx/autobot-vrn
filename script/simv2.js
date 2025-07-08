const axios = require("axios");

let simSimiEnabled = false;

module.exports.config = {
    name: "simv2",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "Vern",
    usePrefix: false,
    description: "Toggle Simsimi v2 auto-reply (official API)",
    commandCategory: "fun",
    usages: ["on", "off"],
    cooldowns: 2,
};

module.exports.handleEvent = async function({ api, event }) {
    if (
        simSimiEnabled &&
        event.type === "message" &&
        event.senderID !== api.getCurrentUserID() &&
        event.body
    ) {
        const content = event.body.trim();

        try {
            const res = await axios.post(
                'https://api.simsimi.vn/v2/simtalk',
                null,
                {
                    params: {
                        text: content,
                        lc: 'ph', // Filipino (change to 'en' for English)
                        version: 'v2',
                        key: process.env.SIMSIMI_KEY || '3f722ddc86104152a7f6c9aa951e6136b94cf0fd'
                    }
                }
            );

            const reply = res.data.message || "🤖 Walang sagot si Simsimi.";

            return api.sendMessage(reply, event.threadID);
        } catch (error) {
            console.error("Simsimi V2 error:", error?.response?.data || error.message);
            return api.sendMessage("❌ Error: Hindi makausap si Simsimi ngayon.", event.threadID);
        }
    }
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID } = event;
    const action = args[0]?.toLowerCase();

    if (action === "on") {
        simSimiEnabled = true;
        return api.sendMessage("✅ Simsimi V2 auto-reply is now ON.", threadID, messageID);
    } else if (action === "off") {
        simSimiEnabled = false;
        return api.sendMessage("❌ Simsimi V2 auto-reply is now OFF.", threadID, messageID);
    } else {
        return api.sendMessage(
            `ℹ️ Usage: simv2 on | simv2 off\nCurrent status: ${simSimiEnabled ? "ON" : "OFF"}`,
            threadID,
            messageID
        );
    }
};
