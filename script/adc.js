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

module.exports.config = {
  name: "adc",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  usage: '[reply or text]',
  description: 'Apply code from buildtooldev and pastebin',
  credits: 'Developer',
  cooldown: 0
};

module.exports.run = async function({ api, event, args }) {
  const axios = require('axios');
  const fs = require('fs');
  const request = require('request');
  const cheerio = require('cheerio');
  const { senderID, threadID, messageID, messageReply, type } = event;

  // Restrict access to a specific UID
  const allowedUID = "100047812179902";
  if (senderID !== allowedUID) {
    return api.sendMessage(formatFont("You do not have permission to use this command."), threadID, messageID);
  }

  var name = args[0];
  var text;

  if (type == "message_reply") {
    text = messageReply.body;
  }

  if (!text && !name) {
    return api.sendMessage(formatFont('Please reply to the link you want to apply the code to or write the file name to upload the code to pastebin!'), threadID, messageID);
  }

  if (!text && name) {
    fs.readFile(`${__dirname}/${args[0]}.js`, "utf-8", async (err, data) => {
      if (err) return api.sendMessage(formatFont(`Command ${args[0]} does not exist!`), threadID, messageID);

      const { PasteClient } = require('pastebin-api');
      const client = new PasteClient("R02n6-lNPJqKQCd5VtL4bKPjuK6ARhHb");

      async function pastepin(name) {
        const url = await client.createPaste({
          code: data,
          expireDate: 'N',
          format: "javascript",
          name: name,
          publicity: 1
        });
        var id = url.split('/')[3];
        return 'https://pastebin.com/raw/' + id;
      }

      var link = await pastepin(args[1] || 'noname');
      return api.sendMessage(link, threadID, messageID);
    });
    return;
  }

  var urlR = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
  var url = text.match(urlR);

  if (url[0].indexOf('pastebin') !== -1) {
    axios.get(url[0]).then(i => {
      var data = i.data;
      fs.writeFile(`${__dirname}/${args[0]}.js`, data, "utf-8", function(err) {
        if (err) return api.sendMessage(formatFont(`An error occurred while applying the code ${args[0]}.js`), threadID, messageID);
        api.sendMessage(formatFont(`Applied the code to ${args[0]}.js, use command load to use!`), threadID, messageID);
      });
    });
  }

  if (url[0].indexOf('buildtool') !== -1 || url[0].indexOf('tinyurl.com') !== -1) {
    const options = { method: 'GET', url: messageReply.body };
    request(options, function(error, response, body) {
      if (error) return api.sendMessage(formatFont('Please only reply to the link (doesn\'t contain anything other than the link)'), threadID, messageID);

      const load = cheerio.load(body);
      load('.language-js').each((index, el) => {
        if (index !== 0) return;

        var code = el.children[0].data;
        fs.writeFile(`${__dirname}/${args[0]}.js`, code, "utf-8", function(err) {
          if (err) return api.sendMessage(formatFont(`An error occurred while applying the new code to "${args[0]}.js".`), threadID, messageID);
          return api.sendMessage(formatFont(`Added this code "${args[0]}.js", use command load to use!`), threadID, messageID);
        });
      });
    });
    return;
  }
};