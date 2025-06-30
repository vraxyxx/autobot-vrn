module.exports.config = {
  name: "imagine1",
  version: "1.0.",
  permission: 0,
  credits: "Vern",
  author: "Vern",
  description: "response from API",
  prefix: true,
  category: "image",
  usages: "prompt",
  cooldowns: 2,
};

module.exports.run = async ({api, event, args }) => {
const axios = require('axios');
const fs = require('fs-extra');
 let { threadID, messageID } = event;
  let Tanvir143 = args.join(" ");
  
  if (!Tanvir143) return api.sendMessage("[🤍] 𝘗𝘭𝘦𝘢𝘴𝘦 𝘱𝘳𝘰𝘷𝘪𝘥𝘦 𝘺𝘰𝘶𝘳 𝘱𝘳𝘰𝘮𝘰𝘵𝘦.", threadID, messageID);
  api.sendMessage("[🤍] 𝘐𝘮𝘢𝘨𝘦 𝘨𝘦𝘯𝘦𝘳𝘢𝘵𝘪𝘯𝘨,  𝘸𝘢𝘪𝘵...",event.threadID, event.messageID);
  
let path = __dirname + `/system/fluxpro.png`;
  const noob143 = (await axios.get(`https://imagine-v2-by-nzr-meta.onrender.com/generate?prompt=${Tanvir143}`, {
    responseType: "arraybuffer",
  })).data;
  fs.writeFileSync(path, Buffer.from(noob143, "utf-8"));
  api.sendMessage({
    body: `[🤍] 𝘐𝘮𝘢𝘨𝘦 𝘎𝘦𝘯𝘦𝘳𝘢𝘵𝘦𝘥 𝘚𝘶𝘤𝘤𝘦𝘴𝘴𝘧𝘶𝘭`,
    attachment: fs.createReadStream(path) }, threadID, () => fs.unlinkSync(path), messageID);
};