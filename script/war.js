module.exports.config = {
    name: "war",
    version: "1.0.1",
    role: 2,
    description: "Friendly group war with funny messages.",
    prefix: false,
    premium: false,
    credits: "Priyansh Rajput",
    cooldowns: 10,
    category: "group"
};

module.exports.languages = {
    english: {
        noMention: "⚠️ Please mention a user to start the friendly war!",
        started: "⚔️ Starting a friendly war with @{name}!"
    }
};

module.exports.run = async function ({ api, event, getText }) {
    const { threadID, messageID, mentions } = event;
    const mentionID = Object.keys(mentions)[0];
    const mentionName = mentions[mentionID];
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    if (!mentionID) return send(getText("noMention"));

    const messages = [
        getText("started").replace("{name}", mentionName),
        "🔥 Listen up, warriors!",
        "⚔️ Prepare yourselves for an epic battle!",
        "🗡️ Sharpen your words, the war has begun!",
        "📣 Are you ready to rumble?",
        "🏆 May the best fighter win!",
        "😆 This is a friendly showdown, no hard feelings!",
        "🎉 Remember to have fun!",
        "💣 Warriors, attack!",
        "🚩 Victory is near!",
        "🤝 Good fight, everyone!",
        "☮️ Peace is restored. Until next time!"
    ];

    messages.forEach((msg, index) => {
        setTimeout(() => {
            if (index === 0) {
                api.sendMessage({
                    body: msg,
                    mentions: [{ id: mentionID, tag: mentionName }]
                }, threadID, messageID);
            } else {
                api.sendMessage(msg, threadID);
            }
        }, index * 5000);
    });
};
