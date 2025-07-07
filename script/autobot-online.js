const fs = require("fs-extra");
const util = require("util");
const path = require("path");
const os = require("os");

const unlinkAsync = util.promisify(fs.unlink);
const historyFilePath = path.join(__dirname, '..', 'data', 'history.json');

let historyData = [];
try {
  historyData = require(historyFilePath);
} catch (readError) {
  console.error('[active-session] Error reading history.json:', readError);
}

module.exports = {
  config: {
    name: "active-session",
    aliases: ["listusers", "listbots", "activeusers", "list-users", "bot-users", "active-users", "active-bots", "list-bot", "botstatus"],
    description: "List all active bots in the history session.",
    version: "1.4.0",
    role: 2,
    cooldown: 0,
    credits: "Vern",
    hasPrefix: true,
    usage: "active-session",
    dependencies: {}
  },

  onStart: async function ({ api, event, args }) {
    const pogi = "100035996145075";
    if (!pogi.includes(event.senderID))
      return api.sendMessage("❌ This command is only for the AUTOBOT owner.", event.threadID, event.messageID);

    const { threadID, messageID } = event;

    if (args[0] && args[0].toLowerCase() === 'logout') {
      await logout(api, event);
      return;
    }

    if (historyData.length === 0) {
      return api.sendMessage("📭 No users found in the history configuration.", threadID, messageID);
    }

    const currentUserId = api.getCurrentUserID();
    const mainBotIndex = historyData.findIndex(user => user.userid === currentUserId);

    if (mainBotIndex === -1) {
      return api.sendMessage("🤖 Main bot not found in history.", threadID, messageID);
    }

    const mainBot = historyData[mainBotIndex];
    const mainBotName = await getUserName(api, currentUserId);
    const mainBotOSInfo = getOSInfo();
    const mainBotRunningTime = convertTime(mainBot.time);

    const userPromises = historyData
      .filter(user => user.userid !== currentUserId)
      .map(async (user, index) => {
        const userName = await getUserName(api, user.userid);
        const userRunningTime = convertTime(user.time);
        return `[ ${index + 1} ]\n𝗡𝗔𝗠𝗘: ${userName}\n𝗜𝗗: ${user.userid}\n𝗨𝗣𝗧𝗜𝗠𝗘: ${userRunningTime}`;
      });

    const userList = (await Promise.all(userPromises)).filter(Boolean);
    const userCount = userList.length;

    const message = `𝗠𝗔𝗜𝗡𝗕𝗢𝗧: ${mainBotName}\n𝗜𝗗: ${currentUserId}\n𝗕𝗢𝗧 𝗥𝗨𝗡𝗡𝗜𝗡𝗚: ${mainBotRunningTime}\n\n| SYSTEM |\n\n${mainBotOSInfo}\n\n𝗢𝗧𝗛𝗘𝗥 𝗦𝗘𝗦𝗦𝗜𝗢𝗡𝗦 [${userCount}]\n\n${userList.join('\n')}\n\n➡️ To logout this session, use: active-session logout`;

    return api.sendMessage(message, threadID, messageID);
  }
};

async function logout(api, event) {
  const { threadID, messageID } = event;
  const currentUserId = api.getCurrentUserID();
  const sessionFile = path.join(__dirname, '..', 'data', 'session', `${currentUserId}.json`);

  try {
    await unlinkAsync(sessionFile);
    api.sendMessage("✅ Bot has been logged out successfully.", threadID, messageID, () => process.exit(1));
  } catch (error) {
    console.error("[active-session] Error deleting session file:", error);
    api.sendMessage("⚠️ Error during logout. Try again later.", threadID, messageID);
  }
}

async function getUserName(api, userID) {
  try {
    const info = await api.getUserInfo(userID);
    return info?.[userID]?.name || "Unknown";
  } catch {
    return "Unknown";
  }
}

function getOSInfo() {
  const osInfo = `${os.type()} ${os.release()} ${os.arch()} (${os.platform()})`;
  const cpu = os.cpus()[0].model;
  const cores = os.cpus().length;
  const total = formatBytes(os.totalmem());
  const free = formatBytes(os.freemem());

  return `OS: ${osInfo}\nCPU: ${cpu}\nCores: ${cores}\nTotal Memory: ${total}\nFree Memory: ${free}`;
}

function convertTime(seconds) {
  seconds = parseInt(seconds);
  const d = Math.floor(seconds / (24 * 60 * 60));
  const h = Math.floor((seconds % (24 * 60 * 60)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return `${d}d ${h}h ${m}m ${s}s`;
}

function formatBytes(bytes) {
  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + units[i];
}
