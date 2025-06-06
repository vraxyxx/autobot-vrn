const fs = require("fs");

const path = require("path");

module.exports = {

    name: "autorestart",

    author: "Aljur Pogoy",

    description: "Enable or disable automatic bot restart every 2 hours.",

    usage: "/autorestart on | off",

    async run({ api, event, args }) {

        if (!args.length || (args[1] !== "on" && args[1] !== "off")) {

            return api.sendMessage("⚠ Usage: /autorestart on | off", event.threadID, event.messageID);

        }

        const settingsFile = path.join(__dirname, "..", "database", "autorestart.json");

        let autoRestartSettings = { enabled: false };

        try {

            if (fs.existsSync(settingsFile)) {

                autoRestartSettings = JSON.parse(fs.readFileSync(settingsFile, "utf8"));

            }

        } catch (error) {

            return api.sendMessage("❌ Error reading settings file.", event.threadID, event.messageID);

        }

        if (args[1] === "on") {

            if (autoRestartSettings.enabled) {

                return api.sendMessage("⚠ Auto-restart is already enabled!", event.threadID, event.messageID);

            }

            autoRestartSettings.enabled = true;

            fs.writeFileSync(settingsFile, JSON.stringify(autoRestartSettings, null, 2));

            return api.sendMessage("✔️ Auto-restart is ON. The bot will restart every 2 hours.", event.threadID, event.messageID);

        }

        if (args[1] === "off") {

            if (!autoRestartSettings.enabled) {

                return api.sendMessage("⚠ Auto-restart is already disabled!", event.threadID, event.messageID);

            }

            autoRestartSettings.enabled = false;

            fs.writeFileSync(settingsFile, JSON.stringify(autoRestartSettings, null, 2));

            return api.sendMessage("❌ Auto-restart is OFF.", event.threadID, event.messageID);

        }

    }

};