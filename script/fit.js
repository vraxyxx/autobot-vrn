const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "fit",
  version: "1.2.0",
  credits: "vern",
  description: "Send lots of random fit GIF.",
  commandCategory: "Fun",
  usages: "[optional @mention]",
  cooldowns: 5
};

const gifs = [
  "https://i.ibb.co/htp89CV/515406571-3601740833467849-7452117331156948507-n-gif-stp-dst-gif-s480x480-nc-cat-105-ccb-1-7-nc-sid.gif",
  "https://i.ibb.co/wZK7FCgY/513514404-625326283909410-6731764255597241295-n-gif-stp-dst-gif-s480x480-nc-cat-109-ccb-1-7-nc-sid-9.gif",
  "https://i.ibb.co/LyByxm6/512109626-1413261743247471-5826404360100902252-n-gif-stp-dst-gif-s480x480-nc-cat-101-ccb-1-7-nc-sid.gif",
  "https://i.ibb.co/LyByxm6/512109626-1413261743247471-5826404360100902252-n-gif-stp-dst-gif-s480x480-nc-cat-101-ccb-1-7-nc-sid.gif",
  "https://i.ibb.co/htp89CV/515406571-3601740833467849-7452117331156948507-n-gif-stp-dst-gif-s480x480-nc-cat-105-ccb-1-7-nc-sid.gif",
  "https://i.ibb.co/htp89CV/515406571-3601740833467849-7452117331156948507-n-gif-stp-dst-gif-s480x480-nc-cat-105-ccb-1-7-nc-sid.gif",
  "https://i.ibb.co/htp89CV/515406571-3601740833467849-7452117331156948507-n-gif-stp-dst-gif-s480x480-nc-cat-105-ccb-1-7-nc-sid.gif",
  "https://i.ibb.co/htp89CV/515406571-3601740833467849-7452117331156948507-n-gif-stp-dst-gif-s480x480-nc-cat-105-ccb-1-7-nc-sid.gif",
  "https://media.giphy.com/media/l3V0j3ytFyGHqiV7W/giphy.gif",
  "https://i.ibb.co/htp89CV/515406571-3601740833467849-7452117331156948507-n-gif-stp-dst-gif-s480x480-nc-cat-105-ccb-1-7-nc-sid.gif"
];

module.exports.run = async function({ api, event, args, Users }) {
  try {
    let mentionText = "";
    let mentions = [];

    if (Object.keys(event.mentions).length > 0) {
      const mentionID = Object.keys(event.mentions)[0];
      const name = await Users.getNameUser(mentionID);
      mentionText = `${name}, `;
      mentions.push({ id: mentionID, tag: name });
    }

    const kisses = "😘😗😙😚💋💕💖".repeat(3);
    const randomGif = gifs[Math.floor(Math.random() * gifs.length)];

    const filePath = path.join(__dirname, "cache", `kiss.gif`);
    const response = await axios.get(randomGif, { responseType: "arraybuffer" });
    fs.writeFileSync(filePath, Buffer.from(response.data, "binary"));

    const message = {
      body: `${mentionText}Sending you lots of kisses! ${kisses}`,
      attachment: fs.createReadStream(filePath),
      mentions
    };

    return api.sendMessage(message, event.threadID, () => {
      fs.unlinkSync(filePath); // Clean up
    });
  } catch (error) {
    console.error("vernkiss error:", error);
    return api.sendMessage("❌ Failed to send kiss gif.", event.threadID);
  }
};