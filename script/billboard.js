const axios = require("axios");
const fs = require("fs-extra");
const { loadImage, createCanvas } = require("canvas");

module.exports.config = {
  name: "billboard",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "Priyansh Rajput",
  description: "Comment on a billboard-style image",
  commandCategory: "edit-img",
  usages: "/billboard [text]",
  cooldowns: 5,
  dependencies: {
    "canvas": "",
    "axios": ""
  }
};

// Wrap text in canvas
module.exports.wrapText = (ctx, text, maxWidth) => {
  return new Promise(resolve => {
    if (ctx.measureText(text).width < maxWidth) return resolve([text]);
    if (ctx.measureText('W').width > maxWidth) return resolve(null);
    const words = text.split(' ');
    const lines = [];
    let line = '';
    while (words.length > 0) {
      let split = false;
      while (ctx.measureText(words[0]).width >= maxWidth) {
        const temp = words[0];
        words[0] = temp.slice(0, -1);
        if (split) words[1] = `${temp.slice(-1)}${words[1]}`;
        else {
          split = true;
          words.splice(1, 0, temp.slice(-1));
        }
      }
      if (ctx.measureText(`${line}${words[0]}`).width < maxWidth) {
        line += `${words.shift()} `;
      } else {
        lines.push(line.trim());
        line = '';
      }
      if (words.length === 0) lines.push(line.trim());
    }
    return resolve(lines);
  });
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const text = args.join(" ");
  const pathImg = __dirname + "/cache/billboard.png";
  const avatarPath = __dirname + "/cache/avatar.png";

  if (!text) {
    return api.sendMessage("Please provide a message to display on the billboard.", threadID, messageID);
  }

  try {
    const userInfo = await api.getUserInfo(senderID);
    const userName = userInfo[senderID].name;
    const avatarURL = userInfo[senderID].thumbSrc;

    const avatarData = (await axios.get(avatarURL, { responseType: "arraybuffer" })).data;
    const backgroundData = (await axios.get("https://imgur.com/uN7Sllp.png", { responseType: "arraybuffer" })).data;

    fs.writeFileSync(avatarPath, Buffer.from(avatarData, "utf-8"));
    fs.writeFileSync(pathImg, Buffer.from(backgroundData, "utf-8"));

    const avatarImage = await loadImage(avatarPath);
    const backgroundImage = await loadImage(pathImg);
    const canvas = createCanvas(backgroundImage.width, backgroundImage.height);
    const ctx = canvas.getContext("2d");

    // Draw base
    ctx.drawImage(backgroundImage, 10, 10, canvas.width, canvas.height);
    ctx.drawImage(avatarImage, 148, 75, 110, 110);

    // Username
    ctx.font = "800 23px Arial";
    ctx.fillStyle = "#000";
    ctx.textAlign = "start";
    ctx.fillText(userName, 280, 110);

    // User text
    ctx.font = "400 23px Arial";
    ctx.fillStyle = "#000";
    let fontSize = 55;
    while (ctx.measureText(text).width > 600) {
      fontSize--;
      ctx.font = `400 ${fontSize}px Arial, sans-serif`;
    }

    const lines = await this.wrapText(ctx, text, 250);
    ctx.fillText(lines.join('\n'), 280, 145);

    const imageBuffer = canvas.toBuffer();
    fs.writeFileSync(pathImg, imageBuffer);
    fs.removeSync(avatarPath);

    return api.sendMessage({ attachment: fs.createReadStream(pathImg) }, threadID, () => fs.unlinkSync(pathImg), messageID);

  } catch (err) {
    console.error("Error in billboard command:", err);
    return api.sendMessage("An error occurred while generating the image.", threadID, messageID);
  }
};
