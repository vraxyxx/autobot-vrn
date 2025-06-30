module.exports.config = {
  name: "approve",
  version: "2.0.0",
  permission: 0,
  credits: "Vern",
  description: "approve thread using thread id",
  prefix: false,
  category: "admin",
  premium: false,
  usages: "approve [group/remove] [threadid]",
  cooldowns: 5,
};

module.exports.languages = {
    "bangla": {
        "listAdmin": 'approved list : \n\n%1',
        "notHavePermssion": 'you have no permission to use "%1"',
        "addedNewAdmin": 'approved %1 box :\n\n%2',
        "removedAdmin": 'remove %1 box in approve lists :\n\n%2'
    },
    "english": {
        "listAdmin": 'approved list : \n\n%1',
        "notHavePermssion": 'you have no permission to use "%1"',
        "addedNewAdmin": 'approved %1 box :\n\n%2',
        "removedAdmin": 'remove %1 box in approve lists :\n\n%2'
    }
}

module.exports.run = async function ({ api, event, args, Threads, Users, permssion, getText }) {
    const content = args.slice(1, args.length);
    const { threadID, messageID, mentions } = event;
    const configPath = require('../../config.json');
    const { approvedgroups } = global.config;
    const { userName } = global.data;
    const { writeFileSync } = global.nodemodule["fs-extra"];
    const mention = Object.keys(mentions);
    delete require.cache[require.resolve('../../config.json')];
    var config = require('../../config.json');
    
       
    switch (args[0]) {
        case "list":
        case "all":
        case "-a": {
            const listAdmin = approvedgroups || config.approvedgroups || [];
            var msg = [];

            for (const idAdmin of listAdmin) {
                if (parseInt(idAdmin)) {
                  let boxname;
                  try {
        const groupName = await global.data.threadInfo.get(idAdmin).threadName || "name does not exist"
        boxname = `group name : ${groupName}\ngroup id : ${idAdmin}`;
      } catch (error) {
        const userName = await Users.getNameUser(idAdmin);
        boxname = `user name : ${userName}\nuser id : ${idAdmin}`;
      }
                  msg.push(`\n${boxname}`);
                }
            };

            return api.sendMessage(`approved users and groups :\n${msg.join('\n')}`, threadID, messageID);
        }

        case "box": {
            if (permssion != 3) return api.sendMessage(getText("notHavePermssion", "add"), threadID, messageID);
          

          
            if (mention.length != 0 && isNaN(content[0])) {
              
                var listAdd = [];

                for (const id of mention) {
                  
                    approvedgroups.push(id);
                    config.approvedgroups.push(id);
                    listAdd.push(`${id} - ${event.mentions[id]}`);
                };

                writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
                return api.sendMessage(getText("addedNewAdmin", mention.length, listAdd.join("\n").replace(/\@/g, "")), threadID, messageID);
            }
            else if (content.length != 0 && !isNaN(content[0])) {
                approvedgroups.push(content[0]);
                config.approvedgroups.push(content[0]);
                
                  let boxname;
                  try {
        const groupname = await global.data.threadInfo.get(content[0]).threadName || "name does not exist";
        boxname = `group name : ${groupname}\ngroup id : ${content[0]}`;
      } catch (error) {
        const username = await Users.getNameUser(content[0]);
        boxname = `user name : ${username}\nuser id : ${content[0]}`;
      }
                writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
                return api.sendMessage('this box has been approved', content[0], () => {
                return api.sendMessage(getText("addedNewAdmin", 1, `${boxname}`), threadID, messageID);
                });
            }
            else return global.utils.throwError(this.config.name, threadID, messageID);
        }
        

        case "remove":
        case "rm":
        case "delete": {
            if (permssion != 3) return api.sendMessage(getText("notHavePermssion", "delete"), threadID, messageID);
            if (mentions.length != 0 && isNaN(content[0])) {
                const mention = Object.keys(mentions);
                var listAdd = [];

                for (const id of mention) {
                    const index = config.approvedgroups.findIndex(item => item == id);
                    approvedgroups.splice(index, 1);
                    config.approvedgroups.splice(index, 1);
                    listAdd.push(`${id} - ${event.mentions[id]}`);
                };

                writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
                return api.sendMessage(getText("removedAdmin", mention.length, listAdd.join("\n").replace(/\@/g, "")), threadID, messageID);
            }
            else if (content.length != 0 && !isNaN(content[0])) {
                const index = config.approvedgroups.findIndex(item => item.toString() == content[0]);
                approvedgroups.splice(index, 1);
                config.approvedgroups.splice(index, 1);
                
                  let boxname;
                  try {
        const groupname = await global.data.threadInfo.get(content[0]).threadName || "name does not exist";
        boxname = `group name : ${groupname}\ngroup id : ${content[0]}`;
      } catch (error) {
        const username = await Users.getNameUser(content[0]);
        boxname = `user name : ${username}\nuser id : ${content[0]}`
      }
                writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
                return api.sendMessage('this box has been removed from approved list', content[0], () => {
                return api.sendMessage(getText("removedAdmin", 1, `${boxname}`), threadID, messageID);
                });
            }
            else global.utils.throwError(this.config.name, threadID, messageID);
        }

        default: {
            return global.utils.throwError(this.config.name, threadID, messageID);
        }
    };
}