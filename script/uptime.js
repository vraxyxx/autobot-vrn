const os = require("os");
const process = require("process");
const { formatDuration } = require("date-fns");

module.exports = {
  config: {
    name: "uptime",
    version: "1.0.0",
    credits: "Vern",
    description: "Shows system and bot uptime information",
    commandCategory: "utility",
    usage: "uptime",
    hasPrefix: true,
    role: 0
  },

  onStart: async function ({ message, usersData, threadsData }) {
    try {
      const systemUptime = formatDuration({
        hours: Math.floor(os.uptime() / 3600),
        minutes: Math.floor((os.uptime() % 3600) / 60),
        seconds: Math.floor(os.uptime() % 60)
      });

      const processUptime = formatDuration({
        hours: Math.floor(process.uptime() / 3600),
        minutes: Math.floor((process.uptime() % 3600) / 60),
        seconds: Math.floor(process.uptime() % 60)
      });

      const systemInfo = {
        os: `${os.type()} ${os.release()}`,
        cores: os.cpus().length,
        architecture: os.arch(),
        totalMemory: `${(os.totalmem() / (1024 ** 3)).toFixed(2)} GB`,
        freeMemory: `${(os.freemem() / (1024 ** 3)).toFixed(2)} GB`,
        ramUsage: `${((os.totalmem() - os.freemem()) / (1024 ** 2)).toFixed(2)} MB`
      };

      const totalUsers = await usersData.getAllUsers().then(u => u.length);
      const totalThreads = await threadsData.getAllThreads().then(t => t.length);

      const msg = `
╭── ✦ 𝑼𝒑𝒕𝒊𝒎𝒆 & 𝑺𝒚𝒔𝒕𝒆𝒎 𝑰𝒏𝒇𝒐 ✦ ──╮
├ 🕒 System Uptime: ${systemUptime}
├ ⏱ Bot Uptime: ${processUptime}
├ 📡 OS: ${systemInfo.os}
├ 🛡 CPU Cores: ${systemInfo.cores}
├ 🔍 Architecture: ${systemInfo.architecture}
├ 🖥 Node.js: ${process.version}
├ 📈 Total RAM: ${systemInfo.totalMemory}
├ 📉 Free RAM: ${systemInfo.freeMemory}
├ 📊 RAM Usage: ${systemInfo.ramUsage}
├ 👥 Users Tracked: ${totalUsers}
╰ 📂 Threads Active: ${totalThreads}`;

      await message.reply(msg);
    } catch (err) {
      console.error("[uptime.js] Error:", err);
      await message.reply(`❌ | Failed to fetch uptime: ${err.message}`);
    }
  }
};
