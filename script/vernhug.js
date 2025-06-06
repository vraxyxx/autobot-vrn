module.exports.config = {
  name: "vernhug",
  version: "1.0.0",
  credits: "vern",
  description: "Send a warm hug with cute emojis and GIF.",
  commandCategory: "Fun",
  usages: "[optional mention]",
  cooldowns: 5
};

const gifs = [
  "https://media.giphy.com/media/l2QDM9Jnim1YVILXa/giphy.gif",
  "https://media.giphy.com/media/od5H3PmEG5EVq/giphy.gif",
  "https://media.giphy.com/media/wnsgren9NtITS/giphy.gif"
];

module.exports.run = async function({ api, event, args, Users }) {
  let mentionText = "";
  if (args.length > 0 && event.mentions) {
    const mentionID = Object.keys(event.mentions)[0];
    const name = await Users.getNameUser(mentionID);
    mentionText = `${name}, `;
  }
  const hugEmojis = "🤗💖💕";
  const randomGif = gifs[Math.floor(Math.random() * gifs.length)];

  const message = {
    body: `${mentionText}You got a warm hug! ${hugEmojis}`,
    attachment: await global.utils.getStream(randomGif)
  };

  return api.sendMessage(message, event.threadID);
};
