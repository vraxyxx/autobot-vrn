const axios = require("axios");

let simSimiEnabled = false;

module.exports.config = {
    name: "simv2",
    version: "1.2.1",
    hasPermssion: 0,
    credits: "Vern",
    usePrefix: false,
    description: "Toggle SimSimi auto-reply",
    commandCategory: "sim",
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
        const content = encodeURIComponent(event.body.trim());

        try {
            const res = await axios.get(`https://simsimi.ooguy.com/sim?query=${content}&lang=ph&apikey=2a5a2264d2ee4f0b847cb8bd809ed34bc3309be7`);
            const respond = res.data.message;

            if (res.data.error) {
                api.sendMessage(`Error: ${res.data.error}`, event.threadID);
            } else {
                api.sendMessage(respond, event.threadID);
            }
        } catch (error) {
            console.error(error);
            api.sendMessage("❌ Error while talking to SimSimi.", event.threadID);
        }
    }
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID } = event;
    const action = args[0]?.toLowerCase();

    if (action === "on") {
        simSimiEnabled = true;
        return api.sendMessage("✅ Simv2 auto-reply is now ON.", threadID, messageID);
    } else if (action === "off") {
        simSimiEnabled = false;
        return api.sendMessage("❌ Simv2 auto-reply is now OFF.", threadID, messageID);
    } else {
        if (!simSimiEnabled) {
            return api.sendMessage("ℹ️ Simv2 auto-reply is currently OFF. Use 'simv2 on' to enable.", threadID, messageID);
        }

        return api.sendMessage("❗ Invalid command. Use: simv2 on | simv2 off", threadID, messageID);
    }
};
