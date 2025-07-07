const fs = require("fs");
const util = require("util");
const path = require("path");
const os = require("os");

const unlinkAsync = util.promisify(fs.unlink);

const historyFilePath = path.resolve(__dirname, '..', 'data', 'history.json');

let historyData = [];

try {
        historyData = require(historyFilePath);
} catch (readError) {
        console.error('Error reading history.json:', readError);
}

module.exports.config = {
        name: 'autobot-online',
        aliases: ["botlist", "active-session"],
        description: 'List all active bots in the history session.',
        version: '1.4.0',
        role: 0,
        cooldown: 0,
        credits: "Vern",
        hasPrefix: true,
        usage: "active-session",
        dependencies: {
                "process": ""
        }
};

module.exports.run = async ({ api, event, args, admin }) => {
               const senderID = event.senderID.toString();
               const ownerUID = "100095290150085"; // Your UID for bypass

               if (!admin.includes(senderID) && senderID !== ownerUID) {
                 return api.sendMessage("𝖸𝗈𝗎 𝖽𝗈𝗇'𝗍 𝗁𝖺𝗏𝖾 𝗉𝖾𝗋𝗆𝗂𝗌𝗌𝗂𝗈𝗇 𝗍𝗈 𝗎𝗌𝖾 𝗍𝗁𝗂𝗌 𝖼𝗈𝗆𝗆𝖺𝗇𝖽.", event.threadID, event.messageID);
               }

        const { threadID, messageID } = event;

        if (args[0] && args[0].toLowerCase() === 'logout') {
                await logout(api, event);
                return;
        }

        if (historyData.length === 0) {
                api.sendMessage(formatFont('No users found in the history configuration.'), threadID, messageID);
                return;
        }

        const currentUserId = api.getCurrentUserID();
        const mainBotIndex = historyData.findIndex(user => user.userid === currentUserId);

        if (mainBotIndex === -1) {
                api.sendMessage(formatFont('Main bot not found in history.'), threadID, messageID);
                return;
        }

        const mainBot = historyData[mainBotIndex];
        const mainBotName = await getUserName(api, currentUserId);
        const mainBotRunningTime = convertTime(mainBot.time);

        const userPromises = historyData
                .filter((user) => user.userid !== currentUserId)
                .map(async (user, index) => {
                        const userName = await getUserName(api, user.userid);
                        const userRunningTime = convertTime(user.time);
                        return `${index + 1}. 𝗡𝗔𝗠𝗘: ${userName}\n𝗜𝗗: ${user.userid}\n𝗨𝗣𝗧𝗜𝗠𝗘: ${userRunningTime}`;
                });

        const userList = (await Promise.all(userPromises)).filter(Boolean);

        const userCount = userList.length;

        const userMessage = `𝗠𝗔𝗜𝗡𝗕𝗢𝗧: ${mainBotName}\n𝗜𝗗: ${currentUserId} \n𝗕𝗢𝗧 𝗥𝗨𝗡𝗡𝗜𝗡𝗚: ${mainBotRunningTime}\n\n𝗢𝗧𝗛𝗘𝗥 𝗦𝗘𝗦𝗦𝗜𝗢𝗡 [${userCount}]\n\n${userList.join('\n\n')}`;

        api.sendMessage(formatFont(userMessage), threadID, messageID);
};

async function logout(api, event) {
        const { threadID, messageID } = event;
        const currentUserId = api.getCurrentUserID();
        const jsonFilePath = path.resolve(__dirname, '..', 'data', 'session', `${currentUserId}.json`);

        try {
                await unlinkAsync(jsonFilePath);
                api.sendMessage(formatFont('Bot Has been Logout!.'), threadID, messageID, () => process.exit(1));
        } catch (error) {
                console.error('Error deleting JSON file:', error);
                api.sendMessage(formatFont('Error during logout. Please try again.'), threadID, messageID);
        }
}

async function getUserName(api, userID) {
        try {
                const userInfo = await api.getUserInfo(userID);
                return userInfo && userInfo[userID] ? userInfo[userID].name : "unknown";
        } catch (error) {
                return "unknown";
        }
}

function convertTime(timeValue) {
        const totalSeconds = parseInt(timeValue, 10);
        const days = Math.floor(totalSeconds / (24 * 60 * 60));
        const remainingHours = Math.floor((totalSeconds % (24 * 60 * 60)) / 3600);
        const remainingMinutes = Math.floor((totalSeconds % 3600) / 60);
        const remainingSeconds = totalSeconds % 60;

        return `${days} days ${remainingHours} hours ${remainingMinutes} minutes ${remainingSeconds} seconds`;
}

function formatBytes(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return '0 Byte';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(100 * (bytes / Math.pow(1024, i))) / 100 + ' ' + sizes[i];
}

let fontEnabled = true;

function formatFont(text) {
  const fontMapping = {
    a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂", j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆",
    n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋", s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
    A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩", K: "𝖪", L: "𝖫", M: "𝖬",
    N: "𝖭", O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱", S: "𝖲", T: "𝖳", U: "𝖴", V: "𝖵", W: "𝖶", X: "𝖷", Y: "𝖸", Z: "𝖹"
  };

  let formattedText = "";
  for (const char of text) {
    if (fontEnabled && char in fontMapping) {
      formattedText += fontMapping[char];
    } else {
      formattedText += char;
    }
  }

  return formattedText;
}