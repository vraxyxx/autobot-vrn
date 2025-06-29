const os = require('os');
const process = require('process');
const { formatDuration } = require('date-fns');

module.exports = {
  config: {
    name: "uptime",
    aliases: ["upt", "up"],
    version: "1.0.0",
    credits: "Vern",
    description: "Display bot and system uptime along with system stats",
    commandCategory: "utility",
    usage: "uptime",
    role: 0,
    hasPrefix: true
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
        totalMemory: (os.totalmem() / (1024 ** 3)).toFixed(2) + " GB",
        freeMemory: (os.freemem() / (1024 ** 3)).toFixed(2) + " GB",
        ramUsage: ((os.totalmem() - os.freemem()) / (1024 ** 2)).toFixed(2) + " MB"
      };

      const totalUsers = await usersData.getAllUsers().then(u => u.length);
      const totalThreads = await threadsData.getAllThreads().then(t => t.length);

      const uptimeMessage = `
╭──✦ [ Uptime Information ]
├‣ 🕒 System Uptime: ${systemUptime}
╰‣ ⏱ Process Uptime: ${processUptime}

╭──✦ [ System Information ]
├‣ 📡 OS: ${systemInfo.os}
├‣ 🛡 Cores: ${systemInfo.cores}
├‣ 🔍 Architecture: ${systemInfo.architecture}
├‣ 🖥 Node Version: ${process.version}
├‣ 📈 Total Memory: ${systemInfo.totalMemory}
├‣ 📉 Free Memory: ${systemInfo.freeMemory}
├‣ 📊 RAM Usage: ${systemInfo.ramUsage}
├‣ 👥 Total Users: ${totalUsers} members
╰‣ 📂 Total Threads: ${totalThreads} Groups`;

      await message.reply(uptimeMessage);
    } catch (err) {
      console.error("[uptime.js] Error:", err);
      await message.reply(`❌ | An error occurred while fetching uptime: ${err.message}`);
    }
  }
};
