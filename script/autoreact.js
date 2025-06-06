module.exports = {
  name: "autoReact",
  description: "Automatically reacts to certain keywords in messages.",
  author: "vern",
  handleEvent: true,

  async handleEvent({ api, event }) {
    const { messageID, body, threadID } = event;

    if (!body) return;

    // Define keywords and corresponding reactions
    const reactions = {
      "hello": "👋",
      "hi": "👋",
      "lol": "😂",
      "haha": "🤣",
      "love": "❤️",
      "wow": "😲",
      "sad": "😢",
      "angry": "😡",
      "bot": "🤖",
      "good morning": "🌅",
      "good night": "🌙",
      "thanks": "🙏",
      "prefix": "👾"
    };

    const lowerBody = body.toLowerCase();

    for (const keyword in reactions) {
      if (lowerBody.includes(keyword)) {
        return api.setMessageReaction(reactions[keyword], messageID, () => {}, true);
      }
    }
  }
};
